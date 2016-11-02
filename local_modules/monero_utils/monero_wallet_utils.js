"use strict"
//
const mnemonic = require('../cryptonote_utils/mnemonic')
const monero_utils = require('./monero_utils_instance')
//
function SeedAndKeysFromMnemonic(mnemonicString, mnemonicLanguage, fn)
{ // fn: (err?, seed?, keys?)
	mnemonicString = mnemonicString.toLowerCase() || ""
	try {
		var seed = null
		var keys = null
	    switch (mnemonicLanguage) {
	        case 'english':
	            try {
	                seed = mnemonic.mn_decode(mnemonicString)
	            } catch (e) {
	                // Try decoding as an electrum seed, on failure throw the original exception
	                try {
	                    seed = mnemonic.mn_decode(mnemonicString, "electrum")
	                } catch (ee) {
	                    throw e
	                }
	            }
	            break
	        default:
	            seed = mnemonic.mn_decode(mnemonicString, mnemonicLanguage)
	            break
	    }
		if (seed === null) {
			fn(new Error("Unable to derive seed"), null, null)
			return
		}
	    keys = monero_utils.create_address(seed)
		if (keys === null) {
			fn(new Error("Unable to derive keys from seed"), seed, null)
			return
		}
		fn(null, seed, keys)
	} catch (e) {
	    console.error("Invalid mnemonic!")
		fn(e, null, null)
	}
}
exports.SeedAndKeysFromMnemonic = SeedAndKeysFromMnemonic
//
function VerifiedComponentsForLogIn(
	address, 
	view_key, 
	spend_key_orUndefinedForViewOnly, 
	seed_orUndefined, 
	wasAGeneratedWallet,
	fn
)
{ // fn: (err?, address, account_seed, public_keys, private_keys, isInViewOnlyMode) -> Void
	var spend_key
    if (typeof spend_key_orUndefinedForViewOnly === 'undefined' && (typeof seed_orUndefined === 'undefined' || seed_orUndefined === '') && wasAGeneratedWallet === false) {
    	spend_key = ''
    } else {
    	spend_key = spend_key_orUndefinedForViewOnly
    }
    if (!view_key || view_key.length !== 64 || (view_only ? false : spend_key.length !== 64)) {
        fn(new Error("invalid secret key length"))
		return
    }
    if (!monero_utils.valid_hex(view_key) || (view_only ? false : !monero_utils.valid_hex(spend_key))) {
        fn(new Error("invalid hex formatting"))
		return
    }
	var public_keys
    try {
        public_keys = monero_utils.decode_address(address)
    } catch (e) {
		fn(new Error("invalid address"))
		return
    }
    var expected_view_pub = monero_utils.sec_key_to_pub(view_key)
    var expected_spend_pub
    if (spend_key.length === 64) {
        expected_spend_pub = monero_utils.sec_key_to_pub(spend_key)
    }
    if (public_keys.view !== expected_view_pub) {
		fn(new Error("invalid view key"))
		return
    }
    const isInViewOnlyMode = (spend_key === '')
    if (!view_only && (public_keys.spend !== expected_spend_pub)) {
        fn(new Error("invalid spend key"))
		return
    }
    const private_keys =
	{
        view: view_key,
        spend: spend_key
    }
	var account_seed
    if (!!seed_orUndefined) { // not keen on this "!!"
        var expected_account = monero_utils.create_address(seed_orUndefined)
        if (expected_account.view.sec !== view_key ||
            expected_account.spend.sec !== spend_key ||
            expected_account.public_addr !== public_address) {
            fn(new Error("invalid seed"))
        }
        account_seed = seed_orUndefined
    } else {
        account_seed = ''
    }
	fn(
		null, // err
		address,
		account_seed,
		public_keys,
		private_keys,
		isInViewOnlyMode
	)
}
	