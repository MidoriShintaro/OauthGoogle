const express = require("express");
const router = express.Router();
const protect = require("../protect");
const passport = require("passport");

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  (req, res) => {
    res.redirect("/success");
  }
);

router.get("/", (req, res) => {
  res.render("auth");
});

router.get("/success", protect, (req, res) => {
  res.render("success", { user: req.user });
});
router.get("/error", (req, res) => res.render("error"));

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
