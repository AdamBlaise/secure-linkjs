const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("./connections");
const { token_extractor } = require("./authorizer");

var mongoose_connection;
var field_name;
var accessToken_secret;
var accessToken_ttl;
var refreshToken_secret;
var refreshToken_ttl;
var accessToken;
var refreshToken;

// parameters::
// accessToken_secret::compulsory,
// refreshToken_secret::compulsory,
// refreshToken_ttl::optional,
// accessToken_ttl::optional,
// user::optional::boolean
const process_login = async (config) => {
  accessToken_secret = config.accessToken_secret;
  refreshToken_secret = config.refreshToken_secret;
  refreshToken_ttl = config.refreshToken_ttl;
  accessToken_ttl = config.accessToken_ttl;

  if (!config.accessToken_secret) {
    return {
      errorCode: 400,
      errorMsg: `please provide a secret key to encode accessToken:: keyname should be accessToken_secret::`,
    };
  }

  if (!config.refreshToken_secret) {
    return {
      errorCode: 400,
      errorMsg: `please provide a secret key to encode refreshToken:: keyname should be refreshToken_secret::`,
    };
  }

  if (!config.details) {
    return {
      errorCode: 400,
      errorMsg: `kindly provide us an information that can be verified::`,
    };
  }

  if (!config.schema) {
    return {
      errorCode: 400,
      errorMsg: `Kindly provide a schema to be used in accessing the DB::`,
    };
  }

  if (!config.collection_name) {
    return {
      errorCode: 400,
      errorMsg: `Kindly provide a collection name for the database::`,
    };
  }

  if (!config.redirect_link && !config.details.password) {
    return {
      errorCode: 400,
      errorMsg: `Kindly provide a password for a simple login::`,
    };
  }

  if (!mongoose_connection && config.mongo_uri) {
    try {
      mongoose_connection = await connection.connect_mongodb(config.mongo_uri);
    } catch (error) {
      return { errorCode: 500, errorMsg: "Failure to connect to mongoDB::" };
    }
  }

  if (config.details) {
    if (config.details.username) {
      field_name = "username";
    } else if (config.details.email) {
      field_name = "email";
    } else if (config.details.phone) {
      field_name = "phone";
    }
  }

  try {
    // Check for user account in database
    var doc = await mongoose.connection
      .collection(config.collection_name.toLowerCase())
      .findOne({
        $or: [
          { email: config.details.email },
          { phone: config.details.phone },
          { username: config.details.username },
        ],
      });

    // If user does not exist return error message to developer
    if (!doc) {
      return { errorCode: 404, errorMsg: `User does not exist::` };
    }

    // Checking for password match before generating magic link
    if (!config.redirect_link && config.details.password) {
      const match = await passwordMatcher(
        config.details.password,
        doc.password
      );
      if (!match)
        return {
          errorCode: 401,
          errorMsg: `username or password is incorrect::`,
        };
    }

    // payload is generated from user's request using user_id and login field provided
    let payload = {
      sub: doc._id.toString(),
      field_name: config.details[field_name],
    };

    // token is generated from initialized payload
    if (!config.redirect_link) {
      accessToken = await jwt.sign(payload, accessToken_secret, {
        algorithm: "HS512",
        expiresIn: accessToken_ttl ?? 1800, // 1hr by default
      });
      refreshToken = await jwt.sign(payload, refreshToken_secret, {
        algorithm: "HS512",
        expiresIn: refreshToken_ttl ?? 604800, // 7days by default
      });
    }

    // if user provides a redirect link generate magic link by appending accesstoken to provided link
    if (config.redirect_link) {
      accessToken = await jwt.sign(payload, accessToken_secret, {
        algorithm: "HS512",
        expiresIn: config.token_ttl ?? 900,
      });
      const magic_link = await create_magic_link(
        config.redirect_link,
        accessToken,
        doc._id.toString()
      );

      if (!magic_link) {
        return {
          errorCode: 500,
          errorMsg: `Failed to generate magic link::`,
        };
      }

      return { authLink: magic_link };
    }

    // if user is set to true then user detail is returned along with tokens
    if (config.user) {
      return {
        user: doc,
        access_token: accessToken,
        refreshToken: refreshToken,
      };
    }

    // if user is not specified or if user is set to false then return only tokens
    if (!config.user) {
      return { access_token: accessToken, refreshToken: refreshToken };
    }
  } catch (error) {
    console.log(error);
    return `Error: Failed to retrieve document from database::`;
  }
};

// parameters::
// request::optional,
// refreshToken_secret::compulsory,
// refreshToken_ttl::optional,
// accessToken_secret::compulsory,
// accessToken_ttl::optional
const refresh_token = async (config) => {
  let token;

  if (config.request) {
    token = await token_extractor(config.request);
  }

  if (!config.request && !config.refreshToken) {
    return {
      errorCode: 400,
      errorMsg: "Please provide a valid refresh token::",
    };
  }

  if (!config.accessToken_secret || !config.refreshToken_secret) {
    return {
      errorCode: 400,
      errorMsg:
        "Kindly provide the accessToken secret and refreshToken secret respectively::",
    };
  }

  try {
    const decoded = await jwt.verify(
      config.refreshToken ?? token,
      config.refreshToken_secret,
      { algorithms: "HS512", complete: true }
    );

    if (!decoded) {
      return { errorCode: 400, errorMsg: "Token Expired." };
    }

    let payload = {
      sub: decoded.sub,
      field_name: decoded.field_name,
    };

    if (decoded && config.accessToken_secret && config.refreshToken_secret) {
      accessToken = await jwt.sign(payload, config.accessToken_secret, {
        algorithm: "HS512",
        expiresIn: config.accessToken_ttl ?? 1800, // 1hr by default
      });
      refreshToken = await jwt.sign(payload, config.refreshToken_secret, {
        algorithm: "HS512",
        expiresIn: config.refreshToken_ttl ?? 604800, // 7days by default
      });
    }

    return { accessToken: accessToken, refreshToken: refreshToken };
  } catch (error) {
    return { errorCode: 500, errorMsg: error };
  }
};

const passwordMatcher = async (password, stored_password) => {
  let match = await bcrypt.compare(password, stored_password);
  if (!match) {
    return false;
  } else {
    return true;
  }
};

const create_magic_link = async (redirect_link, token, user_id) => {
  return `${redirect_link}?token=${token}&user_id=${user_id}`;
};

const verify_magic_link = async (req, config) => {
  let token;

  if (req.body.token) {
    token = req.body.token;
  }

  if (req.params.token) {
    token = req.params.token;
  }

  try {
    const decoded = await jwt.verify(token, config.accessToken_secret, {
      algorithms: "HS512",
      complete: true,
    });

    if (decoded) {
      refreshToken = await jwt.sign(
        decoded.payload,
        config.refreshToken_secret,
        {
          algorithm: "HS512",
          expiresIn: config.refreshToken_ttl ?? 604800, // 7days by default
        }
      );

      return { accessToken: token, refreshToken: refreshToken };
    }
  } catch (error) {
    return { errorCode: 401, errorMsg: "Unauthorized! Access denied." };
  }
};

// parameters::
// request
// accessToken_secret
const handle_logout = async (req, accessToken_secret) => {
  const token = await token_extractor(req);
  const decoded = await jwt.verify(token, accessToken_secret, {
    complete: true,
    algorithms: "HS512",
  });

  if (!decoded) {
    return { errorCode: 401, errorMsg: "Unauthorized! Access denied." };
  }

  let payload = {
    sub: decoded.sub,
    field_name: decoded.field_name,
  };

  const logout_token = await jwt.sign(payload, accessToken_secret, {
    algorithm: "HS512",
    expiresIn: 5,
  });

  return {
    statusCode: 200,
    msg: "Logout successful this token expires in 5 seconds which will render the user logged out 5 seconds after this request has been initiated:",
    logoutToken: logout_token,
  };
};

const invalidate_user_token = async (config) => {};

module.exports = {
  process_login,
  refresh_token,
  passwordMatcher,
  create_magic_link,
  verify_magic_link,
  handle_logout,
  invalidate_user_token,
};
