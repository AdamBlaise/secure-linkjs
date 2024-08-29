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

## Usage



