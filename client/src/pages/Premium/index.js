import React, { useEffect } from 'react'; // Import useEffect here
import StripeCheckout from 'react-stripe-checkout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from "antd";
import { MakePayment, GetPremium } from "../../apicalls/users";

import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { GetCurrentUser } from "../../apicalls/users";
import { updateUserData } from "../../redux/usersSlice";
import Button from "../../components/Button";

function PremiumSubscription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.users);

  const fetchUserData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetCurrentUser();
      if (response.success) {
        dispatch(updateUserData(response.data));
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
      dispatch(ShowLoading());
      let transactionId = "";
      console.log(user);
      if ( user.membershipType === "Premium")
      {
        message.error("You are already a premium user");
      }
      const response = await MakePayment({
        token: token,
        user: user._id,
      });
      console.log("Payment Done");
      transactionId = response.data; // Assuming the payment response contains the transaction ID      

      // // // Book the show with backend
      // const response = await GetPremium({
      //   user: user._id,
      //   transactionId,
      // });


      if (response.success) {
        message.success(response.message);
        if (user.membershipType === "Guest") {
          navigate("/");
        } else {
          navigate("/profile");
        }
      } else {
        console.log(response.message);
        message.error(response.message);
      }
      
      dispatch(HideLoading());
    } catch (error) {
      console.log(error.message);
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div>
      <h1>Subscribe to Premium</h1>
      <StripeCheckout 
          stripeKey="pk_test_51OHNrnDNaesZhvwBfm44JXUOnnUav9iuzU26U1bZNFC7XynYRwbF5zQWQ5OjFD7wK5xA2hjZFril0nWHrlmCde9C0039iJmSqJ"
          token={onToken}
          amount={1500} // Amount in cents ($10.00)
          name="Premium Subscription"
          billingAddress
      >
          <Button title="Subscribe Now" />
      </StripeCheckout>
    </div>
  );
}

export default PremiumSubscription;
