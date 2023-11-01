import React, { useEffect, useState } from "react";
import { Col, message, Row, Table, Dropdown, Menu } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { GetAllMovies } from "../../apicalls/movies";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Button from "../../components/Button";
import { EnvironmentOutlined } from "@ant-design/icons";

function Home() {
  const [searchText = "", setSearchText] = React.useState("");
  const [movies, setMovies] = React.useState([]);
  const [currentlyShowing, setCurrentlyShowing] = React.useState([]);
  const [upcomingMovies, setUpcomingMovies] = React.useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const locations = ["San Jose", "New York", "Chicago", "All Locations"];

  const categorizeMovies = (movies) => {
    const today = moment();
    const currentlyShowing = movies.filter((movie) =>
      moment(movie.releaseDate).isSameOrBefore(today)
    );
    const upcomingMovies = movies.filter((movie) =>
      moment(movie.releaseDate).isAfter(today)
    );

    setCurrentlyShowing(currentlyShowing);
    setUpcomingMovies(upcomingMovies);
  };

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllMovies();
      if (response.success) {
        const filteredMovies = response.data.filter(
          (movie) =>
            selectedLocation === "All Locations" ||
            movie.location === selectedLocation
        );
        setMovies(filteredMovies);
        categorizeMovies(response.data);
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
  }, [selectedLocation]);

  const handleLocationChange = ({ key }) => {
    setSelectedLocation(key);
  };

  const locationMenu = (
    <Menu onClick={handleLocationChange}>
      {locations.map((loc) => (
        <Menu.Item key={loc}>{loc}</Menu.Item>
      ))}
    </Menu>
  );
  const renderMovies = (movies) => {
    return movies
      .filter((movie) =>
        movie.title.toLowerCase().includes(searchText.toLowerCase())
      )
      .map((movie) => (
        <Col key={movie._id} span={6}>
          <div
            className="card flex flex-col gap-1 cursor-pointer"
            onClick={() =>
              navigate(
                `/movie/${movie._id}?date=${moment().format("YYYY-MM-DD")}`
              )
            }
          >
            <img src={movie.poster} alt="" height={200} />

            <div className="flex flex-col justify-center p-1 text-center">
              <h1 className="text-md uppercase">{movie.title}</h1>
              <h2 className="text-sm">
                Release Date:
                {moment(movie.releaseDate).format("MMM Do, YYYY")}
              </h2>
            </div>
          </div>
        </Col>
      ));
  };

  return (
    <div>
      {user.membershipType === "Regular" && (
        <Button
          title="Subscribe to Premium"
          onClick={() => navigate("/premium")}
        />
      )}

      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search for movies"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <Dropdown overlay={locationMenu} trigger={["click"]}>
        <a
          className="ant-dropdown-link"
          onClick={(e) => e.preventDefault()}
          style={{ cursor: "pointer" }}
        >
          <EnvironmentOutlined style={{ marginRight: 8 }} /> {/* Icon */}
          {selectedLocation} {/* Title */}
        </a>
      </Dropdown>

      <Row gutter={[20]} className="mt-2">
        {movies
          .filter((movie) =>
            movie.title.toLowerCase().includes(searchText.toLowerCase())
          )
          .map((movie) => (
            <Col span={6}>
              <div
                className="card flex flex-col gap-1 cursor-pointer"
                onClick={() =>
                  navigate(
                    `/movie/${movie._id}?date=${moment().format("YYYY-MM-DD")}`
                  )
                }
              >
                <img src={movie.poster} alt="" height={200} />

                <div className="flex justify-center p-1">
                  <h1 className="text-md uppercase">{movie.title}</h1>
                </div>
              </div>
            </Col>
          ))}
      </Row>
      <br />
      <br />

      <h2 className="text-lg mt-4 mb-2">Currently Showing</h2>
      <Row gutter={[20]}>
        {renderMovies(
          currentlyShowing.filter(
            (movie) =>
              selectedLocation === "All Locations" ||
              movie.location === selectedLocation
          )
        )}
      </Row>
      <br />
      <br />

      <h2 className="text-lg mt-4 mb-2">Upcoming Movies</h2>
      <Row gutter={[20]}>
        {renderMovies(
          upcomingMovies.filter(
            (movie) =>
              selectedLocation === "All Locations" ||
              movie.location === selectedLocation
          )
        )}
      </Row>
      <br />
    </div>
  );
}

export default Home;
