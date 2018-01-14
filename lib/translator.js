'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _glob = require('glob');

var _mkdirp = require('mkdirp');

var _csvtojson = require('csvtojson');

var _csvtojson2 = _interopRequireDefault(_csvtojson);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line import/no-extraneous-dependencies

// eslint-disable-line import/no-extraneous-dependencies

var config = require(_path2.default.join(_path2.default.resolve('.'), 'lang.conf.js')); // eslint-disable-line import/no-extraneous-dependencies
// eslint-disable-line import/no-extraneous-dependencies


var filePattern = _path2.default.join(_path2.default.resolve('.'), config.messages_path + '/**/*.json');
var outputDir = _path2.default.join(_path2.default.resolve('.'), '' + config.build_path);
var SPREADSHEET_ID = config.spreadsheet_id;
var DEFAULT_LANG = config.default_lang;

// initialize empty language collection objects
var languageCollections = {};

var langs = Object.keys(config.translated_langs);

langs.forEach(function (lang) {
  if (config.translated_langs[lang].sheet_id) {
    languageCollections[lang] = {};
  }
});

var messages = function messages(lang) {
  return (0, _glob.sync)(filePattern).map(function (filename) {
    return fs.readFileSync(filename, 'utf8');
  }).map(function (file) {
    return JSON.parse(file);
  }).reduce(function (collection, descriptors) {
    descriptors.forEach(function (_ref) {
      var id = _ref.id,
          defaultMessage = _ref.defaultMessage;

      if (Object.prototype.hasOwnProperty.call(collection, id)) {
        throw new Error('Duplicate message id: ' + id);
      }
      switch (lang) {
        case DEFAULT_LANG:
          collection[id] = defaultMessage;
          break;
        default:
          {
            var translatedMessage = languageCollections[lang][id];
            if (translatedMessage) {
              collection[id] = translatedMessage;
            } else {
              collection[id] = '';
            }
            break;
          }
      }
    });

    return collection;
  }, {});
};

exports.default = function () {
  // Create a new directory that we want to write the built messages to
  (0, _mkdirp.sync)(outputDir);

  langs.forEach(function (lang) {
    var sheetId = config.translated_langs[lang].sheet_id;
    if (sheetId) {
      (0, _csvtojson2.default)({ noheader: false, flatKeys: true }).fromStream(_request2.default.get('https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/export?format=csv&gid=' + sheetId)).on('json', function (json) {
        languageCollections[lang] = json;
        fs.writeFileSync('' + outputDir + lang + '.json', '' + JSON.stringify(messages(lang), null, 2));
      }).on('done', function (error) {
        if (error) {
          console.log('Error, no ' + lang + ' translations were built.');
          return error;
        }
        fs.writeFileSync('' + outputDir + DEFAULT_LANG + '.json', '' + JSON.stringify(messages(DEFAULT_LANG), null, 2));
      });
    }
  });
  return;
};