const express = require("express");
const http=require("http");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const createDebug=require("debug")

const debug = createDebug('node-ng');
require("dotenv").config();

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );
  next();
});
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_KEY)
  .then(() => {
    console.log("connected to db");
  })
  .catch((error) => {
    console.log(error);
  });
const normalizePort = val => {
    const port = parseInt(val, 10);
    return isNaN(port) ? val: port >= 0 ? port : false;
}

const onError = err => {
    if (err.syscall !== "listen") {
        throw err;
    }
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    switch (err) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            break;
        default:
            throw err;
    }
}

const onListening = () => {
    const addr = server.address();
    const bind = typeof port === "string" ? "pipe " + port : "port " + port;
    debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);