import React, { useEffect, useState } from "react";
import { Col, Row, Table, message } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { GetAllMovies } from "../../apicalls/movies";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllMovies();
      if (response.success) {
        setMovies(response.data);
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

  return <div>
    <input type="text" className="search-input" placeholder="Search for movie"/>
    <Row
      gutter={[20]}
      className="mt-2"
    >
      {movies.map((movie) => (
        <Col span={6}>
          <div className="card flex-col gap-1 cursor-pointer" 
            onClick={()=> navigate(`/movie/${movie._id}`)}
          >
            <img src={movie.poster} style={{width:'100%'}} alt="" height={200} />
            <div className="flex justify-center p-1">
              <h1 className="text-md uppercase">
                {movie.title}
              </h1>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  </div>;
};

export default Home;
