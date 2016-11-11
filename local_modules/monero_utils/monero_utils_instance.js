"use strict"
//
const monero_config = require('./monero_config')
const cryptonote_utils = require('../cryptonote_utils/cryptonote_utils').cnUtil
const monero_utils_instance = cryptonote_utils(monero_config)
//
module.exports = monero_utils_instance