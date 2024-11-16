const express = require("express");
const app = express();
const port = process.env.PORT || 5001;
const { errorHandler } = require("./src/middleware/errorMiddleware");
const { sequelize } = require("./models");
const cors = require("cors");

const  corsOptions = {
  credentials:true,
  origin:['http://localhost:3000']
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", require("./src/routes/userRoutes"));

app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });