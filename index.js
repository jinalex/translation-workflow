#!/usr/bin/env node
var program = require('commander');

program
  .version('1.0.0')

program
  .command('build')
  .description('Build translations for react-intl')
  .action(function() {
    var buildTranslations = require('./lib/translator');
    console.log('Translations built');
    buildTranslations.default();
  });

program
  .command('export')
  .description('Export current messages to Google Sheets')
  .action(function() {
    console.log('Exporting messages and translations...');
    var buildTranslations = require('./lib/translator');
    buildTranslations.default();
    var exportMessages = require('./lib/exportMessages');
    exportMessages.default();
  });

program
  .parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
