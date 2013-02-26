Dropbox Authenticator
---------------------

Simple authentication helper for Dropbox.

# Installation

`$ npm install dropbox-authenticator`

# Usage

The authenticator is a tiny object that exposes two single functions.

## Initiate

The `initiate` function asks Dropbox for a request token and generates a URL
that you should send your user to. You are then responsible for providing
a calback URL that Dropbox can send the user to.

**NOTE:** The Authenticator attaches an ID to the callback URL which makes it
possible to have several simultaneous authentication attempts by several users.
It does however make it impossible to use your own querystring with the
callback url.

Once the user comes back to you, you complete the authorization by calling
`complete`.

## Complete

The `complete` function takes the request and response streams from an HTTP
server request listener. As well as a callback function. Once authorization is
complete this function is called with the OAuth credentials. It's up to you
to store these.

# Example

Quick 'n dirty example showing how to use this thing:

```js
var Authenticator = require('dropbox-authenticator');
var http = require('http');
var auth = Authenticator(YOUR_APP_ID, YOUR_APP_SECRET);

// Handle authorizations
http.createServer(function (req, res) {
  if (req.url === '/') {
    auth.initiate('http://mysite.com/authorized', function (err, url) {
      res.write('<a href="' + url + '">Authorize!</a>');
      res.end();
    });
  }
  else {
    auth.complete(req, res, function (err, credentials) {
      // Save credentials or something here
      console.log(credentials);
    });
  }
});
```

Note that this fails if many users access the server simultaneously. This is
because `Authenticator` needs to store some tokens internally between each
step. I'm thinking about a fix for this. In the mean time I recommend doing
some kind of session thing and tying one instance of `Authenticator` to each
session.

# License

ISC

