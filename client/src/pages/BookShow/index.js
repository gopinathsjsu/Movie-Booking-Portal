import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { message } from "antd";
import { GetShowById } from "../../apicalls/theatres";
import moment from "moment";
import StripeCheckout from "react-stripe-checkout";
import Button from "../../components/Button";
import { BookShowTickets, MakePayment } from "../../apicalls/bookings";

const BookShow = () => {
  const {user} = useSelector(state => state.users);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetShowById({ showId: params.id });
      if (response.success) {
        setShow(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

    const getSeats = () => {
      const columns = 12;
      const totalSeats = show.totalSeats;
      const rows = Math.ceil(totalSeats / columns);

      return (
        <div className="flex gap-1 flex-col p-2 card">
          {Array.from(Array(rows).keys()).map((seat, index) => {
            return (
              <div className="flex gap-1 justify-center">
                {Array.from(Array(columns).keys()).map((column, index) => {
                  const seatNumber = seat * columns + column + 1;
                  let seatClass = "seat";

                  if (selectedSeats.includes(seat * columns + column + 1)) {
                    seatClass = seatClass + " selected-seat";
                  }

                  if (show.bookedSeats.includes(seat * columns + column + 1)) {
                    seatClass = seatClass + " booked-seat";
                  }

                  return (
                    seat * columns + column + 1 <= totalSeats && (
                      <div
                        className={seatClass}
                        onClick={() => {
                          if (selectedSeats.includes(seatNumber)) {
                            setSelectedSeats(
                              selectedSeats.filter(
                                (item) => item !== seatNumber
                              )
                            );
                          } else {
                            setSelectedSeats([...selectedSeats, seatNumber]);
                          }
                        }}
                      >
                        <h1 className="text-sm">
                          {seat * columns + column + 1}
                        </h1>
                      </div>
                    )
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    };

  const book = async (transactionId) => {
    try {
      dispatch(ShowLoading());
      const response = await BookShowTickets({
        show: params.id,
        seats: selectedSeats,
        transactionId,
        user: user._id,
      });
      if (response.success) {
        message.success(response.message);
        navigate('/profile')
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const onToken = async (token) => {
    try {
      dispatch(ShowLoading());
      const response = await MakePayment(
        token,
        selectedSeats.length * show.ticketPrice * 100
      );
      if (response.success) {
        message.success(response.message);
        book(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    show && (
      <div>
        {/* show information */}
        <div className="flex justify-between card p-2 items-center">
          <div>
            <h1 className="text-x1">{show.theatre.name}</h1>
            <h1 className="text-sm">{show.theatre.address}</h1>
          </div>
          <div>
            <h1 className="text-2x1 uppercase">
              {show.movie.title} ({show.movie.language})
            </h1>
          </div>
          <div>
            <h1 className="text-x1">
              {moment(show.date).format("MMM Do yyyy")} -{" "}
              {moment(show.time, "HH.mm").format("hh:mm A")}
            </h1>
          </div>
        </div>
        {/* seats */}
        <div className="flex justify-center mt-2">{getSeats()}</div>

        {selectedSeats.length > 0 && (
          <div className="mt-2 flex justify-center">
            <StripeCheckout
              token={onToken}
              amount={selectedSeats.length * show.ticketPrice * 100}
              billingAddress
              stripeKey="pk_test_51M0QQiSBrfOkNBSL4veMVBdErktpfGoroJnJARxqvalibNmx1PhR736kMO18ZG8zFFHXRUq3LzOAmq1P313SRcs600BSeno4KZ"
            >
              <Button title="Book Now" />
            </StripeCheckout>
          </div>
        )}
      </div>
    )
  );
};

export default BookShow;
