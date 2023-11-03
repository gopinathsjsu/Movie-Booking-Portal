import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { message, Row, Table, Col } from "antd";
import { GetBookingsOfUser } from "../../apicalls/bookings";
import { DeleteBookingOfUser } from "../../apicalls/bookings"
import moment from "moment";

function Bookings() {
  const { user } = useSelector((state) => state.users);
  const [bookings = [], setBookings] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetBookingsOfUser();
      if (response.success) {
        setBookings(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };


  const deleteBooking = async (transaction_id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteBookingOfUser({ transactionId: transaction_id });
      if (response.success) {
        message.success(response.message);
        getData();
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
  //For Cancelling only before the show time(This captures the date and time of the system or the browser)
  const isBookingInFuture = (booking) => {
    const now = moment(); // current date and time
    const bookingDate = moment(booking.show.date);
    const bookingTime = moment(booking.show.time, "HH:mm");

    // Check if the booking date is today or in the future and the time is in the future
    return bookingDate.isAfter(now, 'day') || (bookingDate.isSame(now, 'day') && bookingTime.isAfter(now));
  };
  return (
    <div>
      <Row gutter={[16, 16]}>
        {bookings.map((booking) => (
          <Col span={12}>
            <div className="card p-2 flex justify-between uppercase">
              <div>
                <h1 className="text-xl">
                  {booking.show.movie.title} ({booking.show.movie.language})
                </h1>
                <div className="divider"></div>
                <h1 className="text-sm">
                  {booking.show.theatre.name} ({booking.show.theatre.address})
                </h1>
                <h1 className="text-sm">
                  Date & Time: {moment(booking.show.date).format("MMM Do YYYY")}{" "}
                  - {moment(booking.show.time, "HH:mm").format("hh:mm A")}
                </h1>
                <h1 className="text-sm">
                  Amount : ₹{" "}
                  {booking.show.ticketPrice * booking.seats.length +
                    (user.membershipType === "Premium" ? 0 : 1.5)}
                </h1>
                <h1 className="text-sm">Booking ID: {booking._id}</h1>
                <button 
            onClick={() => deleteBooking(booking._id)}
            disabled={!isBookingInFuture(booking)} // Disable button if booking is not in the future
          >
            Cancel Booking
          </button>
              </div>

              <div>
                <img
                  src={booking.show.movie.poster}
                  alt=""
                  height={100}
                  width={100}
                  className="br-1"
                />
                <h1 className="text-sm">Seats: {booking.seats.join(", ")}</h1>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Bookings;
