#!/usr/bin/env node
'use strict'

var path = require('path');
var program = require('commander');
var config = require(path.join(path.resolve('.'), 'lang.conf.js'));

function build () {
  var spawn = require( 'child_process' ).spawnSync;
  var babel = spawn('babel', ['./src']);
  var buildTranslations = require('./lib/translator');
  buildTranslations.default();
  console.log('Translations built');
}

program
  .version('1.1.0')

program
  .command('build')
  .description('Build translations for react-intl')
  .action(function () {
    build()
  });

program
  .command('export')
  .description('Export current messages to Google Sheets')
  .action(function() {
    console.log('Exporting messages and translations...');
    var exportMessages = require('./lib/exportMessages');
    exportMessages.default();
  });

program
  .parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
