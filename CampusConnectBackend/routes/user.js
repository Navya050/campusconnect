const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", (req, res, next) => {
  console.log("called");
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hash,
    });

    user
      .save()
      .then((result) => {
        res.status(201).json({
          success: true,
          data: result,
        });
      })
      .catch((error) => {
        if (error.code === 11000) {
          res.status(409).json({
            success: false,
            data: "User already exists!",
          });
        } else {
          res.status(500).json({
            success: false,
            data: error.message || "Signup failed",
          });
        }
      });
  });
});

router.post("/login", (req, res, next) => {
  console.log("testing2");
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          data: "Could not find user",
        });
      }
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          success: false,
          data: "password not found",
        });
      }

      const token = jwt.sign(
        { email: req.body.email, userId: req.body.password },
        "secret_this_should_be_longer",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        success: true,
        token: token,
        expiresIn: 3600,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:id", (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
