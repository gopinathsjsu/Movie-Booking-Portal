import React, { useEffect } from "react";
import { Col, message, Row, Table } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { GetAllMovies } from "../../apicalls/movies";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Button from "../../components/Button";

function Home() {
  const [searchText = "", setSearchText] = React.useState("");
  const [movies, setMovies] = React.useState([]);
  const [currentlyShowing, setCurrentlyShowing] = React.useState([]);
  const [upcomingMovies, setUpcomingMovies] = React.useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        setMovies(response.data);
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
  }, []);

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
      <Button
        title="Subscribe to Premium"
        onClick={() => navigate("/premium")}
      />

      <input
        type="text"
        className="search-input"
        placeholder="Search for movies"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <h2 className="text-lg mt-4 mb-2">Currently Showing</h2>
      <Row gutter={[20]}>{renderMovies(currentlyShowing)}</Row>

      <h2 className="text-lg mt-4 mb-2">Upcoming Movies</h2>
      <Row gutter={[20]}>{renderMovies(upcomingMovies)}</Row>

      {/* <Row gutter={[20]} className="mt-2">
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
      </Row> */}
    </div>
  );
}

export default Home;
