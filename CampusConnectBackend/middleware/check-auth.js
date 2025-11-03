const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      data: "authentication failed",
    });
  }
};

module.exports = authenticate;
