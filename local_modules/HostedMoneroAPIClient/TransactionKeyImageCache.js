"use strict"
//
const monero_utils = require('../monero_utils/monero_utils_instance')
//
var key_images = {}
//
var Lazy_KeyImage = function(
	tx_pub_key, 
	out_index,
	view_key__private,
	spend_key__public,
	spend_key__private
)
{
	var cache_index = tx_pub_key + ':' + public_address + ':' + out_index
	if (typeof key_images[cache_index] !== 'undefined' && key_images[cache_index] !== null) {
		return key_images[cache_index]
	}
	var key_image = monero_utils.generate_key_image(
		tx_pub_key,
		view_key__private,
		spend_key__public,
		spend_key__private,
		out_index
	).key_image
	// cache:
	key_images[cache_index] = key_image
	//
	return key_image
}
exports.Lazy_KeyImage = Lazy_KeyImage