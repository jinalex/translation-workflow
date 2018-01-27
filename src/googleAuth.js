import * as fs from 'fs';
import readline from 'readline';
import GoogleAuth from 'google-auth-library'; // eslint-disable-line import/no-extraneous-dependencies

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_DIR = '.credentials/';
const SECRETS_PATH = `${CREDENTIALS_DIR}client_id.json`;
const TOKEN_PATH = `${CREDENTIALS_DIR}token.json`;

export const authedCall = (call) => {
  fs.readFile(SECRETS_PATH, (err, content) => {
    if (err) {
      console.log(`Error loading client secret file: ${err}`);
      console.log('Make sure you have a .credentials/ folder at the root of your project.');
      console.log('Ensure that you have a client_id.json at .credentials/cliend_id.json with your client secrets for googleAuth to work');
      return;
    }
    authorize(JSON.parse(content), call);
  });
};

export const authorize = (credentials, callback) => {
  const auth = new GoogleAuth();
  const oauth2Client = new auth.OAuth2(credentials.web.client_id, credentials.web.client_secret, credentials.web.redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
};

export const storeToken = (token) => {
  try {
    fs.mkdirSync(CREDENTIALS_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`);
};

export const getNewToken = (oauth2Client, callback) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log(`Authorize this app by visiting this url: ${authUrl}`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from the url query string here: 127.0.0.1:XXXX/?code=', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
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
