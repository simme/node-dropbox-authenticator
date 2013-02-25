//
// # Test Authenticator
//
// @TODO: Test error handling
//

var assert        = require('assert');
var nock          = require('nock');
var Authenticator = require('./../lib/authenticator');

// Setup Nock
(function setupNock() {
  // Parse URLs in authenticator
  var url = require('url');
  var auth = Authenticator('foo', 'bar');
  var parts = url.parse(auth.request_url);
  var access_parts = url.parse(auth.access_url);

  // Setup interception of above parsed URLs.
  nock(parts.protocol + '//' + parts.host)
    .persist() // Makes nock work more then once for this URL.
    .get(parts.path)
    .reply(200, function () {
      return 'oauth_token=foobar&oauth_token_secret=barz';
    })

    .persist()
    .get(access_parts.path)
    .reply(200, function () {
      return 'oauth_token=foobar&oauth_token_secret=barz';
    });
    
}());

// Tests
suite('Authenticator', function () {
  test('should callback with URL', function (done) {
    var auth = Authenticator('foo', 'bar');
    auth.initiate('foohoo', function(err, url) {
      assert(!err);
      assert(url);
      done();
    });
  });

  test('should return object with credentials', function (done) {
    var auth = Authenticator('foo', 'bar');
    auth.initiate('foohoo', function (err, url) {
      auth.complete(function (err, credentials) {
        assert(credentials.consumer_key);
        assert(credentials.consumer_secret);
        assert(credentials.token);
        assert(credentials.token_secret);
        done();
      });
    });
  });
});

