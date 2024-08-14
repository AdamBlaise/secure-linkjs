const mongoose = require("mongoose");

const ExpiredTokenSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    token: { type: String, required: true },
  },
  { timestamps: true }
);

const ExpiredToken = mongoose.model("expired-token", ExpiredTokenSchema);

module.exports = {
  ExpiredToken,
  ExpiredTokenSchema,
};
