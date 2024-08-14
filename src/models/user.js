const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  username: String,
  organization: String,
  country: String,
  state: String,
  countryCode: String,
  phone: String,
  dob: String,
  age: Number,
  org_id: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = { User, UserSchema };
