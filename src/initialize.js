var refreshToken_secret;
var accessToken_secret;
var mongo_uri;
var redis_uri;
var refreshToken_ttl;
var accessToken_ttl;
var redirect_link;

const init = async (config) => {
  if (config.refreshToken_secret) {
    refreshToken_secret = config.refreshToken_secret;
  }

  if (config.accessToken_secret) {
    accessToken_secret = config.accessToken_secret;
  }

  if (config.mongo_uri) {
    mongo_uri = config.mongo_uri;
  }

  if (config.redis_uri) {
    redis_uri = config.redis_uri;
  }

  if (config.accessToken_ttl) {
    accessToken_ttl = config.accessToken_ttl;
  }

  if (config.refreshToken_ttl) {
    refreshToken_ttl = config.refreshToken_ttl;
  }

  if (config.redirect_link) {
    redirect_link = config.redirect_link;
  }
};

const getValues = async () => {
  return {
    refreshToken_secret: refreshToken_secret,
    accessToken_secret: accessToken_secret,
    redirect_link: redirect_link,
    mongo_uri: mongo_uri,
    redis_uri: redis_uri,
    accessToken_ttl: accessToken_ttl,
    refreshToken_ttl: refreshToken_ttl,
  };
};

module.exports = { init, getValues };
