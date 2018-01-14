'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _googleapis = require('googleapis');

var _googleapis2 = _interopRequireDefault(_googleapis);

var _googleAuth = require('./googleAuth');

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line import/no-extraneous-dependencies
var config = require(_path2.default.join(_path2.default.resolve('.'), 'lang.conf'));

// import built languages
var translatedMessages = [];
var BUILD_PATH = config.build_path;
var langs = Object.keys(config.translated_langs);
langs.forEach(function (lang) {
  if (config.translated_langs[lang].sheet_id) {
    translatedMessages.push(require(_path2.default.join(_path2.default.resolve('.'), '' + BUILD_PATH + lang + '.json')));
  }
});

var defaultMessages = require(_path2.default.join(_path2.default.resolve('.'), '' + BUILD_PATH + config.default_lang + '.json'));

var SPREADSHEET_ID = config.spreadsheet_id;
var DEFAULT_MESSAGES_SHEET_ID = config.default_messages.sheet_id;
var sheets = _googleapis2.default.sheets('v4');

// while there are translations, this will export built translations
var syncTranslations = function syncTranslations(authClient) {
  var column = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'C';

  if (langs.length === 0 || translatedMessages.length === 0) {
    return null;
  } else {
    langs.shift();
    sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'All Messages!' + column + '2',
      valueInputOption: 'RAW',
      resource: {
        range: 'All Messages!' + column + '2',
        majorDimension: 'COLUMNS',
        values: [(0, _object2.default)(translatedMessages.shift())]
      },
      auth: authClient
    }, function (err, response) {
      if (err) {
        console.log(err);
        return null;
      }
      console.log(JSON.stringify(response, null, 2));
      var nextCol = String.fromCharCode(column.charCodeAt(0) + 1);
      syncTranslations(authClient, nextCol);
      return null;
    });
  }
  return null;
};

var update = function update(authClient) {
  // clear cells
  sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        updateCells: {
          range: {
            sheetId: DEFAULT_MESSAGES_SHEET_ID
          },
          fields: 'userEnteredValue'
        }
      }]
    },
    auth: authClient
  }, function (err, response) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));

    // append default messages
    sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: config.default_lang + '!A1',
      valueInputOption: 'RAW',
      insertDataOption: 'OVERWRITE',
      resource: {
        range: config.default_lang + '!A1',
        majorDimension: 'ROWS',
        values: [Object.keys(defaultMessages), (0, _object2.default)(defaultMessages)]
      },
      auth: authClient
    }, function (err, response) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(JSON.stringify(response, null, 2));
      syncTranslations(authClient, 'C');
    });
  });
};

exports.default = function () {
  (0, _googleAuth.authedCall)(update);
};