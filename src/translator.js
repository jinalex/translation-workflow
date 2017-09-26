import path from 'path';
import * as fs from 'fs';
import { sync as globSync } from 'glob'; // eslint-disable-line import/no-extraneous-dependencies
import { sync as mkdirpSync } from 'mkdirp'; // eslint-disable-line import/no-extraneous-dependencies

import csv from 'csvtojson'; // eslint-disable-line import/no-extraneous-dependencies
import request from 'request'; // eslint-disable-line import/no-extraneous-dependencies

const config = require(path.join(path.resolve('.'), 'lang.conf.js'));

const filePattern = path.join(path.resolve('.'), `${config.messages_path}/**/*.json`);
const outputDir = path.join(path.resolve('.'), `${config.build_path}`);
const SPREADSHEET_ID = config.spreadsheet_id;
const DEFAULT_LANG = config.default_lang;

// initialize empty language collection objects
const languageCollections = {};

const langs = Object.keys(config.translated_langs);

langs.forEach((lang) => {
  if (config.translated_langs[lang].sheet_id) {
    languageCollections[lang] = {};
  }
});

const messages = lang => globSync(filePattern)
  .map(filename => fs.readFileSync(filename, 'utf8'))
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({id, defaultMessage}) => {
      if (Object.prototype.hasOwnProperty.call(collection, id)) {
        throw new Error(`Duplicate message id: ${id}`);
      }
      switch (lang) {
        case DEFAULT_LANG:
          collection[id] = defaultMessage;
          break;
        default: {
          const translatedMessage = languageCollections[lang][id];
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

export default () => {
  // Create a new directory that we want to write the built messages to
  mkdirpSync(outputDir);

  langs.forEach((lang) => {
    const sheetId = config.translated_langs[lang].sheet_id;
    if (sheetId) {
      csv({noheader: false, flatKeys: true})
      .fromStream(request.get(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetId}`))
      .on('json', (json) => {
        languageCollections[lang] = json;
        fs.writeFileSync(`${outputDir}${lang}.json`, `${JSON.stringify(messages(lang), null, 2)}`);
      }).on('done', (error) => {
        if (error) {
          console.log(`Error, no ${lang} translations were built.`);
          return error;
        }
        fs.writeFileSync(`${outputDir}${DEFAULT_LANG}.json`, `${JSON.stringify(messages(DEFAULT_LANG), null, 2)}`);
      });
    }
  });
  return;
};
