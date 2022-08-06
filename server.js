require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("./model/user.js");
const dburi = process.env.DBURI;
const GOOGLE_CLIENT_ID = process.env.GGCLIENTID;
const GOOGLE_CLIENT_SECRET = process.env.GGCLIENTSECRET;
let userProfile;

mongoose.connect(dburi).then(() => console.log("DB connected"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: false,
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      userProfile = profile;
      const curUser = await User.findOne({ GoogleId: profile.id })
      if (curUser) {
        return done(null, curUser);
      } else {
        const newUser = await new User({
          GoogleId: profile.id,
          name: profile.name.familyName + " " + profile.name.givenName,
          email: profile.emails[0].value,
        }).save()
        return done(null, newUser)
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user));
});

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  function (req, res) {
    // Successful authentication, redirect success.
    res.redirect("/success");
  }
);

app.get("/", function (req, res) {
  res.render("auth");
});

app.get("/success", (req, res) => {
  res.render("success", { userProfile });
});
app.get("/error", (req, res) => res.send("error logging in"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("App listening on port " + port));
