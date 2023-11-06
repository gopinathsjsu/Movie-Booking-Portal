import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { message, Row, Table, Col, Tabs } from "antd";
import { GetBookingsOfUser } from "../../apicalls/bookings";
import { DeleteBookingOfUser } from "../../apicalls/bookings"
import moment from "moment";
const { TabPane } = Tabs;

function Bookings() {
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [currentAndUpcomingBookings, setCurrentAndUpcomingBookings] = useState([]);
   
  const { user } = useSelector((state) => state.users);
  const [bookings = [], setBookings] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetBookingsOfUser();
      if (response.success) {
        const sortedBookings = response.data.sort((a, b) => 
        moment(b.show.date).diff(moment(a.show.date))
      );
        setAllBookings(sortedBookings);
        const currentUpcoming = response.data.filter(booking =>
          moment(booking.show.date).isSameOrAfter(moment())
        ).sort((a, b) => moment(b.show.date).diff(moment(a.show.date)));
        setCurrentAndUpcomingBookings(currentUpcoming);

        setBookings(response.data);

        const filteredBookings = response.data.filter(booking =>
        moment(booking.show.date).isAfter(moment().subtract(30, 'days'))
        );
        setRecentBookings(filteredBookings);
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

  const renderBookings = (bookings) => (
    <Row gutter={[16, 16]}>
      {bookings.map((booking) => (
        <Col span={24}>
          <div className="card p-2">
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <h1 className="text-xl">
                  {booking.show.movie.title} ({booking.show.movie.language})
                </h1>
                <div className="divider"></div>
                <h1 className="text-sm">
                  {booking.show.theatre.name} ({booking.show.theatre.address})
                </h1>
                <h1 className="text-sm">
                  Date & Time: {moment(booking.show.date).format("MMM Do YYYY")} -
                  {moment(booking.show.time, "HH:mm").format("hh:mm A")}
                </h1>
                <h1 className="text-sm">
                  Amount : ₹ {booking.show.ticketPrice * booking.seats.length}
                </h1>
                <h1 className="text-sm">Booking ID: {booking._id}</h1>
                <h1 className="text-sm">Seats: {booking.seats.join(", ")}</h1>
              </Col>
              <Col span={8}>
                <img
                  src={booking.show.movie.poster}
                  alt=""
                  height={100}
                  width={100}
                  className="br-1"
                />
              </Col>
              <button 
            onClick={() => deleteBooking(booking._id)}
            disabled={!isBookingInFuture(booking)} // Disable button if booking is not in the future
          >
            Cancel Booking
          </button>

            </Row>
          </div>
        </Col>
      ))}
    </Row>
  );  
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
    <Tabs defaultActiveKey="1">
    <TabPane tab="Current & Upcoming Bookings" key="1">
          <Row gutter={[16, 16]}>
            {renderBookings(currentAndUpcomingBookings)}
          </Row>
    </TabPane>
    <TabPane tab="Recent Bookings" key="2">
        <Row gutter={[16, 16]}>
          {renderBookings(recentBookings)}
        </Row>
      </TabPane>
      <TabPane tab="All Bookings" key="3">
        <Row gutter={[16, 16]}>
          {renderBookings(allBookings)}
        </Row>
      </TabPane>
    </Tabs>
    </div>
  );
}

export default Bookings;
