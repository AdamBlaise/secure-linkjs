const { process_login } = require("../src/authenticate");
const { UserSchema } = require("../src/models/user");

test("logs a user in and sends back an access token with refresh token", async () => {
  const res = await process_login({
    details: { email: "okoisorjr@gmail.com", password: "test1234" },
    mongo_uri: "mongodb://127.0.0.1:27017/justpay",
    collection_name: "Users",
    schema: UserSchema,
    token_secret: "Thisisarandomsecretfortestpurposes",
  });
  expect(res).toBe({ access_token: "", refreshToken: "" });
});
