'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNewToken = exports.storeToken = exports.authorize = exports.authedCall = undefined;

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _googleAuthLibrary = require('google-auth-library');

var _googleAuthLibrary2 = _interopRequireDefault(_googleAuthLibrary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// eslint-disable-line import/no-extraneous-dependencies

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var CREDENTIALS_DIR = '.credentials/';
var SECRETS_PATH = CREDENTIALS_DIR + 'client_id.json';
var TOKEN_PATH = CREDENTIALS_DIR + 'token.json';

var authedCall = exports.authedCall = function authedCall(call) {
  fs.readFile(SECRETS_PATH, function (err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      console.log('Make sure you have a .credentials/ folder at the root of your project.');
      console.log('Ensure that you have a client_id.json at .credentials/cliend_id.json with your client secrets for googleAuth to work');
      return;
    }
    authorize(JSON.parse(content), call);
  });
};

var authorize = exports.authorize = function authorize(credentials, callback) {
  var auth = new _googleAuthLibrary2.default();
  var oauth2Client = new auth.OAuth2(credentials.web.client_id, credentials.web.client_secret, credentials.web.redirect_uri);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
};

var storeToken = exports.storeToken = function storeToken(token) {
  try {
    fs.mkdirSync(CREDENTIALS_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
};

var getNewToken = exports.getNewToken = function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ' + authUrl);
  var rl = _readline2.default.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from the url query string here: 127.0.0.1:XXXX/?code=', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
};