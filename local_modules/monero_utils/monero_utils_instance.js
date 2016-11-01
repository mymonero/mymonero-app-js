"use strict"
//
var monero_config = require('./monero_config')
var cryptonote_utils = require('../cryptonote_utils/cryptonote_utils').cnUtil
var monero_utils_instance = cryptonote_utils(monero_config)
//
module.exports = monero_utils_instance