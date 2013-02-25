//
// # Authenticator
//
// Functions for requesting tokens from Dropbox.
//

var request = require('request');
var url     = require('url');
var qs      = require('querystring');

//
// ## Create new authenticator
//
var Authenticator = function (app_id, app_secret) {
  this.consumer_key = app_id;
  this.consumer_secret = app_secret;
  this.token = '';
  this.token_secret = '';

  this.request_url = 'https://api.dropbox.com/1/oauth/request_token';
  this.access_url  = 'https://api.dropbox.com/1/oauth/access_token';
};

//
// ## Initiate authorization
//
// Gets request token from Dropbox.
//
// * **callback_url** callback URL to send user from Dropbox.
// * **callback** function that gets URL to be opened in browser.
//
Authenticator.prototype.initiate = function (callback_url, fn) {
  var self = this;
  var oauth = {
    callback: callback_url,
    consumer_key: this.consumer_key,
    consumer_secret: this.consumer_secret
  };

  // Request a request token from Dropbox.
  request({url: this.request_url, oauth: oauth}, function (err, res, body) {
    // Had an error.
    if (err) {
      fn(err);
      return;
    }

    // Parse response and store away tokens.
    var response = qs.parse(body);
    self.token = response.oauth_token;
    self.token_secret = response.oauth_token_secret;

    // Build URL to be opened in browser.
    var parameters = {
      oauth_token: response.oauth_token,
      oauth_callback: callback_url
    };

    var query = qs.stringify(parameters);
    var url = 'http://www.dropbox.com/1/oauth/authorize?' + query;

    // Callback with URL.
    fn(undefined, url);
  });
};

//
// ## Finish authorization
//
// Complete authorization by POSTing to Dropbox.
//
// * **fn** function called with resulting credentials.
//
Authenticator.prototype.complete = function(res, fn) {
  var self = this;
  var url = 'https://api.dropbox.com/1/oauth/access_token';
  var oauth = {
    consumer_key: this.consumer_key,
    consumer_secret: this.consumer_secret,
    token: this.token,
    token_secret: this.token_secret
  };

  // Request access token
  request({url: this.access_url, oauth: oauth}, function (err, res, body) {
    // Had an error.
    if (err) {
      fn(err);
      return;
    }

    // If something went wrong Dropbox will return a JSON object containing
    // the error message. So try to parse the response if status code is not
    // 200. Then pass errors to the callback.
    if (res.statusCode !== 200) {
      try {
        var response = JSON.parse(body);
        if (response && response.error) {
          fn(response.error);
          return;
        }
      } catch (err) {
        fn(err);
      }
    }
    // Otherwise the response will be a query string containing our final
    // credentials. So parse it and return it.
    else {
      var parsed = qs.parse(body);
      var credentials = {
        consumer_key: self.consumer_key,
        consumer_secret: self.consumer_secret,
        token: parsed.oauth_token,
        token_secret: parsed.oauth_token_secret
      };
      // @TODO: Look for user id.
      //console.log(parsed, credentials);

      fn(undefined, credentials);
    }
  });
};

//
// ## Export API
//
// Follow the `substack-pattern` by only exposing one single function. In our
// case this functions instantiates a new Authenticator and returns it.
//
module.exports = function (a, s) {
  return new Authenticator(a, s);
};

