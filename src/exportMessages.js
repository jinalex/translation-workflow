import path from 'path';
import google from 'googleapis'; // eslint-disable-line import/no-extraneous-dependencies
import { authedCall } from './googleAuth';
import values from 'object.values';

const config = require(path.join(path.resolve('.'), 'lang.conf'));

// import built languages
const translatedMessages = [];
const BUILD_PATH = config.build_path;
const langs = Object.keys(config.translated_langs);
langs.forEach((lang) => {
  if (config.translated_langs[lang].sheet_id) {
    translatedMessages.push(require(path.join(path.resolve('.'), `${BUILD_PATH}${lang}.json`)));
  }
});

const defaultMessages = require(path.join(path.resolve('.'), `${BUILD_PATH}${config.default_lang}.json`));

const SPREADSHEET_ID = config.spreadsheet_id;
const DEFAULT_MESSAGES_SHEET_ID = config.default_messages.sheet_id;
const sheets = google.sheets('v4');

// while there are translations, this will export built translations
const syncTranslations = (authClient, column = 'C') => {
  if (langs.length === 0 || translatedMessages.length === 0) {
    return null;
  } else {
    langs.shift();
    sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `All Messages!${column}2`,
      valueInputOption: 'RAW',
      insertDataOption: 'OVERWRITE',
      resource: {
         range: `All Messages!${column}2`,
         majorDimension: 'COLUMNS',
         values: [
            values(translatedMessages.shift())
         ],
      },
      auth: authClient
    }, (err, response) => {
      if (err) {
        console.log(err);
        return null;
      }
      console.log(JSON.stringify(response, null, 2));
      const nextCol = String.fromCharCode(column.charCodeAt(0) + 1);
      syncTranslations(authClient, nextCol);
      return null;
    });
  }
  return null;
};

const update = (authClient) => {
  // clear cells
  sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [
        {
          updateCells: {
            range: {
              sheetId: DEFAULT_MESSAGES_SHEET_ID
            },
              fields: 'userEnteredValue'
            }
        }
      ],
    },
    auth: authClient
  }, (err, response) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));

    // append default messages
    sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${config.default_lang}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'OVERWRITE',
      resource: {
        range: `${config.default_lang}!A1`,
        majorDimension: 'ROWS',
        values: [
          Object.keys(defaultMessages),
          values(defaultMessages)
        ],
      },
      auth: authClient
    }, (err, response) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    syncTranslations(authClient);
    });
  });
};

export default () => {authedCall(update)};
