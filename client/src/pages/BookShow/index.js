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
  const [useRewardPoints, setUseRewardPoints] = React.useState(false);
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
        {Array.from(Array(rows).keys()).map((row, rowIndex) => {
          return (
            <div className="flex gap-1 justify-center" key={rowIndex}>
              {Array.from(Array(columns).keys()).map((column, columnIndex) => {
                const seatNumber = row * columns + column + 1;
                let seatClass = "seat";

                if (selectedSeats.includes(seatNumber)) {
                  seatClass += " selected-seat";
                }

                if (show.bookedSeats.includes(seatNumber)) {
                  seatClass += " booked-seat";
                }

                return (
                  seatNumber <= totalSeats && (
                    <div
                      className={seatClass}
                      key={columnIndex}
                      onClick={() => {
                        if (selectedSeats.includes(seatNumber)) {
                          setSelectedSeats(
                            selectedSeats.filter((item) => item !== seatNumber)
                          );
                        } else if (selectedSeats.length < 8) {
                          setSelectedSeats([...selectedSeats, seatNumber]);
                        } else {
                          message.warning("You can only select up to 8 seats.");
                        }
                      }}
                    >
                      <h1 className="text-sm">{seatNumber}</h1>
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
        useRewardPoints: useRewardPoints,
      });
      if (response.success) {
        message.success(response.message);
        if (user.membershipType !== "Guest") {
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

  const onToken = async (token) => {
    try {
      await fetchUserData();
      dispatch(ShowLoading());
      const totalCost =
        calculateDiscountedPrice(show, selectedSeats.length, useRewardPoints) *
        100;
      let transactionId = "";
      if (
        totalCost > 0 &&
        (user.membershipType === "Guest" ||
          (totalCost > 0 && user.rewardPoints >= 0))
      ) {
        // Process Stripe payment if user is not Premium or doesn't have enough points

        const paymentResponse = await MakePayment({
          token: token,
          show: params.id,
          seats: selectedSeats,
          user: user._id,
          useRewardPoints: useRewardPoints,
        }); // Stripe expects amount in cents
        transactionId = paymentResponse.data; // Assuming the payment response contains the transaction ID
      }

      // Book the show with backend
      const bookingResponse = await BookShowTickets({
        show: params.id,
        seats: selectedSeats,
        user: user._id,
        transactionId: transactionId,
        useRewardPoints: useRewardPoints,
      });

      if (bookingResponse.success) {
        message.success(bookingResponse.message);
        navigate("/");
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
  const calculateDiscountedPrice = (
    show,
    selectedSeatsLength,
    useRewardPoints
  ) => {
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
    const finalCost =
      (show.ticketPrice * (1 - discount) +
        (user.membershipType === "Premium" ? 0 : 1.5)) *
      selectedSeatsLength;

    let amountToCharge = finalCost;

    if (useRewardPoints) {
      if (
        user.membershipType === "Guest" ||
        (user.rewardPoints < finalCost && user.rewardPoints >= 0)
      ) {
        amountToCharge = Math.max(0, amountToCharge - user.rewardPoints);
      } else {
        amountToCharge = 0;
      }
    }
    return amountToCharge;
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

  const findMembership = (user) => {
    try {
      const typeMembership = user.membershipType;
      if (typeMembership === "Regular" || typeMembership === "Premium") {
        return "Reward Points: " + user.rewardPoints;
      } else {
        return "";
      }
    } catch (error) {
      message.error(error.message);
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
            <h1 className="text-2xl uppercase">{findMembership(user)}</h1>
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
                  {calculateDiscountedPrice(
                    show,
                    selectedSeats.length,
                    useRewardPoints
                  )}
                </h1>
              </div>
            </div>
            {user.membershipType !== "Guest" && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={useRewardPoints}
                  onChange={(e) => setUseRewardPoints(e.target.checked)}
                />
                <label>Use Reward Points</label>
              </div>
            )}

            {calculateDiscountedPrice(
              show,
              selectedSeats.length,
              useRewardPoints
            ) > 0 ? (
              <StripeCheckout
                token={onToken}
                amount={
                  calculateDiscountedPrice(
                    show,
                    selectedSeats.length,
                    useRewardPoints
                  ) * 100
                }
                billingAddress
                stripeKey="pk_test_51OHNrnDNaesZhvwBfm44JXUOnnUav9iuzU26U1bZNFC7XynYRwbF5zQWQ5OjFD7wK5xA2hjZFril0nWHrlmCde9C0039iJmSqJ"
              >
                <Button title="Book Now" />
              </StripeCheckout>
            ) : (
              <Button title="Book Now" onClick={() => onToken(null)} />
            )}
          </div>
        )}
      </div>
    )
  );
}

export default BookShow;
