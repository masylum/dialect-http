#!/usr/bin/env node
/*
 * dialect-http
 * Copyright(c) Pau Ramon <masylum@gmail.com>
 * (MIT Licensed)
 */

require('colors');

var _lib_path = require('path').join(__dirname, '..', 'lib'),

    _utils = require(_lib_path + '/utils'),
    _dialect_http = require(_lib_path + '/dialect_http'),

    _usage = 'Usage:'.bold + ' dialect-http [options]\n' +
             'Options'.bold + ':\n' +
             '  -c, --config PATH    Config file path\n' +
             '  -v, --version        Output version number\n' +
             '  -h, --help           Display help information\n',

    _version = '0.9.0',
    _args = process.argv.slice(2);


// parse options
while (_args.length) {
  var arg = _args.shift();

  switch (arg) {
  case '-h':
  case '--help':
    console.log(_usage);
    process.exit(1);
    break;
  case '-v':
  case '--version':
    console.log(_version);
    process.exit(1);
    break;
  case '-c':
  case '--config':
    arg = _args.shift();
    if (arg) {
      _dialect_http.options = _utils.merge(_dialect_http.options, require(arg));
    } else {
      throw Error('--config requires an path');
    }
    break;
  default:
    console.log('`' + arg + '`'.yellow + ' is not a valid option'.red);
    console.log(_usage);
    process.exit(1);
  }
}

_dialect_http.run();
