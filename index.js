const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./utils/swagger.json");
const dbUtils = require("./utils/dbUtils");
dbUtils.connectDb();
app.use(express.json());
const authRoute = require("./routes/userRoutes");
const hotelRoute = require("./routes/hotelRoutes");
app.use("/user", authRoute);
app.use("/", hotelRoute);

app.get("/", (req, res) => {
  res.send("hello world");
});

const error = async function (err, req, res, next) {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
    // res.status(err.status).send(err.message);
  } else {
    res.status(500).send({ message: err.message });
  }
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(error);
app.use(cors());

app.listen(PORT, () => {
  console.log(`listening on port:${PORT}`);
});
