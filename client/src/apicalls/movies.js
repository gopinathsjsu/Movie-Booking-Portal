const { axiosInstance } = require(".");

// Add a new movie
export const AddMovie = async (payload) => {
    try{
        const response = await axiosInstance.post("/api/movies/add-movie", payload);
        return response.data
    } catch (error) {
        return error.response;
    }
}

// Get all movies
export const GetAllMovies = async () => {
    try{
        const response = await axiosInstance.get("/api/movies/get-all-movies");
        return response.data;
    } catch (error) {
        return error.response;
    }
}

// Update a movie
export const UpdateMovie = async (payload) => {
    try {
        const response = await axiosInstance.post('/api/movies/update-movie', payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export const DeleteMovie = async (payload) => {
    try{
        const response = await axiosInstance.post("/api/movies/delete-movie", payload);
        return response.data;
    }catch (error) {
        return error.message;
    }
}

// get movie by id
export const GetMovieById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/movies/get-movie-by-id/${id}`);
        return response.data;
    } catch(error) {
        return error.response;
    }
}