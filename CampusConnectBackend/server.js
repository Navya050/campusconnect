const app = require("./app.js");
const http = require("http");
const createDebug = require("debug");

const debug = createDebug("node-ng");

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  return isNaN(port) ? val : port >= 0 ? port : false;
};

const onError = (err) => {
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
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3406");
app.set("port", port);

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);
