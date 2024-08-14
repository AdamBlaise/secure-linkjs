const mongoose = require("mongoose");

const connect_mongodb = async (mongo_uri) => {
  const connection = await mongoose.connect(mongo_uri);
  return connection;
};

module.exports = { connect_mongodb };
