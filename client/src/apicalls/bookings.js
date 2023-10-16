import { axiosInstance } from ".";

// make payment
export const MakePayment = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/bookings/make-payment", {
      payload,
    });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// book shows
export const BookShowTickets = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/api/bookings/book-show",
      payload
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// get bookings of a user
export const GetBookingsOfUser = async () => {
  try {
    const response = await axiosInstance.get("/api/bookings/get-bookings");
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// delete bookings of a user
export const DeleteBookingOfUser = async (payload) => {
  try {
    const tId = payload.transactionId;
    const response = await axiosInstance.post('/api/bookings/delete-booking', { tId });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

