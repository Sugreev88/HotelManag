const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

const dbUtils = require("./utils/dbUtils");
dbUtils.connectDb();
app.use(express.json());

const authRoute = require("./routes/userRoutes");
app.use("/user", authRoute);

const error = async function (err, req, res, next) {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
    // res.status(err.status).send(err.message);
  } else {
    res.status(500).send({ message: err.message });
  }
};

app.use(error);

app.listen(PORT, () => {
  console.log(`listening on port:${PORT}`);
});
