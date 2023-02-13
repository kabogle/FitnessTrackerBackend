require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const apiRouter = require("./api");
const client = require("./db/client");

const app = express();
app.use(express.json());

// Setup your Middleware and API Router here
apiRouter.use(cors());
apiRouter.use(morgan("dev"));

app.use("/api", apiRouter);


app.use("/*", (req, res) => {
    res.status(404).json({
        name: "Page Not Found",
        message: "Not Found"
    });
})

app.use((err, req, res, next) => {
    res.status(500).send({error: "500", name: err.name, message: err.message});
})

client.connect();

module.exports = app;