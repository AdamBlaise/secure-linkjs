const jwt = require("jsonwebtoken");

// returns boolean value:
const authorize = async (req, res, config) => {
  if (!req.headers["authorization"] || req.headers["Authorization"]) {
    return { errorCode: 401, errorMsg: "Unauthorized! Access denied." };
  }

  const token = await token_extractor(req);

  try {
    const value = await jwt.verify(token, config.accessToken_secret, {
      algorithms: "HS512",
      complete: true,
    });

    if (value) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

const token_extractor = async (req) => {
  let token;
  if (req.headers["authorization"]) {
    token = await req.headers["authorization"].split(" ")[1];
  }

  if (req.headers["Authorization"]) {
    token = await req.headers["authorization"].split(" ")[1];
  }
  return token;
};

module.exports = {
  authorize,
  token_extractor,
};
