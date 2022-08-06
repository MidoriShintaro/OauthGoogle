const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  GoogleId: String,
  name: String,
  email: String,
});

module.exports = mongoose.model("User", userSchema);
