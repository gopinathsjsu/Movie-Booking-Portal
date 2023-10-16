const { axiosInstance } = require(".");

// Register a new user
export const RegisterUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/register", payload);
    return response.data;
  } catch (error) {
    return error.response;
  }
};

// Login a user
export const LoginUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/login", payload);
    return response.data;
  } catch (error) {
    return error.response;
  }
};

// Get current user
export const GetCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-current-user");
    console.log(response);
    return response.data;
  } catch (error) {
    return error;
  }
};

// Make payment
export const MakePayment = async (payload) => {
  try {
    console.log("Payment Payload: ", payload);
    const response = await axiosInstance.post(
      "/api/users/make-payment",
      payload
    );

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// // // get premium user status
// export const GetPremium = async (payload) => {
//   try {
//     const response = await axiosInstance.post(
//       "/api/bookings/get-premium",
//       payload
//     );    
//     console.log(payload);
//     return response.data;
//   } catch (error) {
//     return error.response.data;
//   }
// };
