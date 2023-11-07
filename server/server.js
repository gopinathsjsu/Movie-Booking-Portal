const cors = require("cors");

const express = require("express");
const app = express();
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
app.use(express.json());


const usersRoute = require("./routes/usersRoute");
const moviesRoute = require("./routes/moviesRoute");
const theatresRoute = require("./routes/theatresRoute");
const bookingsRoute = require("./routes/bookingsRoute");
const deleteBookingRoute = require("./routes/bookingsRoute")

app.use("/api/users", usersRoute);
app.use("/api/movies", moviesRoute);
app.use("/api/theatres", theatresRoute);
app.use("/api/bookings", bookingsRoute);

const port = process.env.PORT || 5000;

const path = require("path");
__dirname = path.resolve();


// render deployment
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});


app.use(cors({origin:'*'}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.listen(port, () =>
  console.log(`Node JS Server is running on port ${port}`)
);

