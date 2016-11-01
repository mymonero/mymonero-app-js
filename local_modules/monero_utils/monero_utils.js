"use strict"
//
var monero_config = require('./monero_config.js')
var monero_utils = require('./cryptonote_utils')(monero_config)
//
exports.monero_utils = monero_utils