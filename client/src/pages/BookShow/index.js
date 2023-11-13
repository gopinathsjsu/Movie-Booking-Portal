import { message } from "antd";
import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetShowById } from "../../apicalls/theatres";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import StripeCheckout from "react-stripe-checkout";
import Button from "../../components/Button";
import { BookShowTickets, MakePayment } from "../../apicalls/bookings";
import { GetCurrentUser } from "../../apicalls/users";
import { updateUserData } from "../../redux/usersSlice";

function BookShow() {
  const { user } = useSelector((state) => state.users);
  const [show, setShow] = React.useState(null);
  const [selectedSeats, setSelectedSeats] = React.useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetShowById({
        showId: params.id,
      });
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
                            selectedSeats.filter((item) => item !== seatNumber)
                          );
                        } else {
                          setSelectedSeats([...selectedSeats, seatNumber]);
                        }
                      }}
                    >
                      <h1 className="text-sm">{seat * columns + column + 1}</h1>
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
        if (user.membershipType === "Guest") {
          navigate("/");
        } else {
          navigate("/profile");
        }
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  // const onToken = async (token) => {
  //   try {
  //     const totalAmount =
  //       selectedSeats.length * show.ticketPrice * 100 +
  //       (user.membershipType === "Premium" ? 0 : 150);
  //     dispatch(ShowLoading());
  //     const response = await MakePayment(token, totalAmount);
  //     if (response.success) {
  //       message.success(response.message);
  //       book(response.data);
  //     } else {
  //       message.error(response.message);
  //     }
  //     dispatch(HideLoading());
  //   } catch (error) {
  //     message.error(error.message);
  //     dispatch(HideLoading());
  //   }
  // };

  const onToken = async (token) => {
    try {
      await fetchUserData();
      dispatch(ShowLoading());
      const totalCost = selectedSeats.length * show.ticketPrice * 100;
      let transactionId = "";
      if (
        user.membershipType !== "Premium" ||
        user.membershipType !== "Regular" ||
        (100 * user.rewardPoints < totalCost && user.rewardPoints >= 0)
      ) {
        // Process Stripe payment if user is not Premium or doesn't have enough points

        const paymentResponse = await MakePayment({
          token: token,
          show: params.id,
          seats: selectedSeats,
          user: user._id,
        }); // Stripe expects amount in cents
        transactionId = paymentResponse.data; // Assuming the payment response contains the transaction ID
      }

      // Book the show with backend
      const bookingResponse = await BookShowTickets({
        show: params.id,
        seats: selectedSeats,
        user: user._id,
        transactionId,
      });

      if (bookingResponse.success) {
        message.success(bookingResponse.message);
        if (user.membershipType === "Guest") {
          navigate("/");
        } else {
          navigate("/profile");
        }
      } else {
        message.error(bookingResponse.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };
  // In the section where you display the total price
  const calculateDiscountedPrice = (show) => {
    let discount = 0;
    let showType = "";

    // Check if the show date is Tuesday or Thursday
    const dayOfWeek = moment(show.date).format("dddd");
    if (dayOfWeek === "Tuesday") {
      discount += 0.5;
      showType = "Discount Show";
    }

    // Check if the show time is before 6:00 PM
    const showTime = moment(show.time, "HH:mm");
    if (showTime.isBefore(moment("18:00", "HH:mm"))) {
      discount += 0.5;
    }

    // Apply discount, ensuring it does not exceed 100%
    discount = Math.min(discount, 1);
    return show.ticketPrice * (1 - discount);
  };
  // till here

  const fetchUserData = async () => {
    try {
      // Assuming you have an API endpoint to fetch current user data
      const response = GetCurrentUser();
      if (response.data.success) {
        // Update user data in Redux store
        dispatch(updateUserData(response.data.user));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    getData();
  }, []);
  return (
    show && (
      <div>
        {/* show infomation */}

        <div className="flex justify-between card p-2 items-center">
          <div>
            <h1 className="text-sm">{show.theatre.name}</h1>
            <h1 className="text-sm">{show.theatre.address}</h1>
          </div>

          <div>
            <h1 className="text-2xl uppercase">
              {show.movie.title} ({show.movie.language})
            </h1>
          </div>
          <div>
            <h1 className="text-2xl uppercase">
              Actual Price: {show.ticketPrice}
            </h1>
          </div>

          <div>
            <h1 className="text-sm">
              {moment(show.date).format("MMM Do yyyy")} -{" "}
              {moment(show.time, "HH:mm").format("hh:mm A")}
            </h1>
          </div>
        </div>

        {/* seats */}

        <div className="flex justify-center mt-2">{getSeats()}</div>

        {selectedSeats.length > 0 && (
          <div className="mt-2 flex justify-center gap-2 items-center flex-col">
            <div className="flex justify-center">
              <div className="flex uppercase card p-2 gap-3">
                <h1 className="text-sm">
                  <b>Selected Seats</b> : {selectedSeats.join(" , ")}
                </h1>

                {/* Discounting prices of the tickets */}
                <h1 className="text-sm">
                  <b>Total Price</b> :{" "}
                  {selectedSeats.length * calculateDiscountedPrice(show)}
                </h1>
              </div>
            </div>
            <StripeCheckout
              token={onToken}
              amount={
                selectedSeats.length * show.ticketPrice * 100 +
                (user.membershipType === "Premium" ? 0 : 150)
              }
              billingAddress
              stripeKey="pk_test_51OHNrnDNaesZhvwBfm44JXUOnnUav9iuzU26U1bZNFC7XynYRwbF5zQWQ5OjFD7wK5xA2hjZFril0nWHrlmCde9C0039iJmSqJ"
            >
              <Button title="Book Now" />
            </StripeCheckout>
          </div>
        )}
      </div>
    )
  );
}

export default BookShow;
