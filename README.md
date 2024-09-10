# SecurelinkJs

Securelinkjs is an authentication library designed primarily for node applications.

The sole purpose of SecurelinkJs is to authenticate requests, which it does exceptionally well. SecurelinkJs avails you with 
various in-built methods to handle authentication and authorization of your users as well as token management. Securelinkjs was inspired by some of the limitations of Passportjs
which were carefully examined. SecurelinkJs has a functional approach which expects a configuration object to customize the features of the library enabling the developer
take full control of the authentication flow. SecurelinkJs has authentication features like magic-links, 2fa codes and basic auth i.e username & password. The API is simple and developer friendly,
any developer can easily integrate the library to handle basic authentication and advance level authentication processes without any prior knowledge of building authentication flows,
securelinkjs was developed with developers in mind, simplifying and reducing the amount of time and lines of code required to implement or integrate an authentication flow in your project, 
you have to provide SecurelinkJs, with primary criteria for it to be able to handle the login process for you completely.

## Quick Start

To integrate securelinkJs in your project clone the repository and link it to your project

```bash
  git clone https://github.com/AdamBlaise/secure-linkjs.git
```

cd into the securelinkjs directory and run the npm link command, it will create a link that can be utilized in your project

```
  cd path/to/secure-linkjs/directory

  npm link
```

After running the command above, navigate to your project directory in your terminal and type this command to sync your project with the secure-linkjs library
```
  npm link secure-linkjs
```

## Features

The secure-linkjs library has several api features built-in which can be used directly within your project.
- authenticate
- authorize
- refresh token
- hanadle logout

There are additional functions within the library that make up secure-linkjs, this functions includes, token extractor, generate_2fa_code and verify magic link. secure-linkjs was built to integrate conveniently with mongodb as the database of choice. With secure-linkjs all that is required of the developer is to provide the necessary details to handle the transaction, requiring no logic implementation from the developer's end.

# Usage

## process_login function

This is how you can integrate the process_login function in your project

```

app.post("/auth/login", async (req, res) => {
  try {
    const response = await authenticate.process_login({
      details: req.body,
      mongo_uri: process.env.MONGO_URI,
      collection_name: "users",
      //redirect_link: "http://localhost:5173/login",
      user: true,
      tokenReplay: true,
      /* enable_2fa: true, */
      accessToken_secret: process.env.ACCESS_TOKEN_SECRET,
      refreshToken_secret: process.env.REFRESH_TOKEN_SECRET,
    });

    if (response.errorCode) {
      return res.status(response.errorCode).send(response);
    } else {
      return res.status(200).send(response);
    }
  } catch (error) {
    return res.status(500).send({
      errorCode: 500,
      errorMsg: "We couldn't resolve your problem at this time",
    });
  }
});
```

## handle_logout function

```
app.get("/auth/logout", async (req, res) => {
  try {
    const logged_out = await authenticate.handle_logout({
      request: req,
      mongo_uri: process.env.MONGO_URI,
      accessToken_secret: process.env.ACCESS_TOKEN_SECRET,
      model_name: "users",
    });

    if (logged_out.statusCode === 500) {
      return res.status(401).send({
        errorCode: 401,
        errorMsg: "Unauthorized! Access denied.",
      });
    }

    if (logged_out.statusCode === 200) {
      return res.status(200).send(logged_out);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      errorCode: 500,
      errorMsg: `We have run into an unexpected challenge!`,
    });
  }
});
```

## authorizer function

```
app.get("/profiles/:user_id", async (req, res) => {
  try {
    const authorized = await authorizer.authorize({
      request: req,
      mongo_uri: process.env.MONGO_URI,
      accessToken_secret: process.env.ACCESS_TOKEN_SECRET,
      collection_name: "users",
    });

    if (!authorized) {
      return res.status(401).send({
        errorCode: 401,
        errorMsg: `You do not have permission to view the requested resource::`,
      });
    }

    const user = await User.findById(req.params.user_id);

    if (!user) {
      res.status(404).send({
        errorCode: 404,
        errorMsg: "User could not be found!",
      });
    }

    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({
      errorCode: 500,
      errorMsg: `We have run into an unexpected problem!`,
    });
  }
});
```

