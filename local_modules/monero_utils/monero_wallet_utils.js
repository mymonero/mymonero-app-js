"use strict"
//
const mnemonic = require('../cryptonote_utils/mnemonic')
const monero_utils = require('./monero_utils_instance')
const monero_config = require('./monero_config')
//
const wordsetNames = {}
const wordsetNames_array = Object.keys(mnemonic.mn_words)
for (let wordsetName of wordsetNames_array) {
	wordsetNames[wordsetName] = wordsetName
}
exports.wordsetNames = wordsetNames
//
function NewlyCreatedWallet(mnemonic_wordsetName)
{
	const seed = monero_utils.rand_16() // 128-bit/16-byte key -- comes out as 32 chars
	const mnemonicString = mnemonic.mn_encode(seed, mnemonic_wordsetName)
	const keys = monero_utils.create_address(seed)
	//
	return {
		seed: seed,
		mnemonicString: mnemonicString,
		keys: keys
	}
}
exports.NewlyCreatedWallet = NewlyCreatedWallet
//
function MnemonicStringFromSeed(account_seed, mnemonic_wordsetName)
{
	const mnemonicString = mnemonic.mn_encode(account_seed, mnemonic_wordsetName)
	//
	return mnemonicString
}
exports.MnemonicStringFromSeed = MnemonicStringFromSeed
//
function SeedAndKeysFromMnemonic(mnemonicString, mnemonic_wordsetName, fn)
{ // fn: (err?, seed?, keys?)
	mnemonicString = mnemonicString.toLowerCase() || ""
	try {
		var seed = null
		var keys = null
		switch (mnemonic_wordsetName) {
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
				seed = mnemonic.mn_decode(mnemonicString, mnemonic_wordsetName)
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
	
	const isInViewOnlyMode = (spend_key === '')
	
	
	if (!view_key || view_key.length !== 64 || (isInViewOnlyMode ? false : spend_key.length !== 64)) {
		fn(new Error("invalid secret key length"))
		return
	}
	if (!monero_utils.valid_hex(view_key) || (isInViewOnlyMode ? false : !monero_utils.valid_hex(spend_key))) {
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
	if (!isInViewOnlyMode && (public_keys.spend !== expected_spend_pub)) {
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
			expected_account.public_addr !== address) {
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
exports.VerifiedComponentsForLogIn = VerifiedComponentsForLogIn
//
//
//
////////////////////////////////////////////////////////////////////////////////
// Transactions
//
function IsTransactionConfirmed(tx, blockchain_height)
{
	return (blockchain_height - tx.height) > monero_config.txMinConfirms
}
exports.IsTransactionConfirmed = IsTransactionConfirmed
//
function IsTransactionUnlocked(tx, blockchain_height)
{
	return monero_utils.is_tx_unlocked(tx.unlock_time || 0, blockchain_height)
}
exports.IsTransactionUnlocked = IsTransactionUnlocked
//
function TransactionLockedReason(tx, blockchain_height)
{
	return monero_utils.tx_locked_reason(tx.unlock_time || 0, blockchain_height)
}
exports.TransactionLockedReason = TransactionLockedReason

//
//
//
////////////////////////////////////////////////////////////////////////////////
// Sending funds
//

function UsableOutputsAndAmountForMixin(
	target_amount,
	using_outs_amount,
	unused_outs
)
{
	console.log(
		"Selecting outputs to use. Current total: " 
		+ monero_utils.formatMoney(using_outs_amount) 
		+ " target: " + monero_utils.formatMoney(target_amount)
	)
	var toFinalize_usingOutsAmount = using_outs_amount
	const toFinalize_usableOuts = []

	function __randomIndex(list) {
		return Math.floor(Math.random() * list.length);
	}
	function _poppedRandomValueFromList(list)
	{
		var idx = __randomIndex(list)
		var val = list[idx]
		list.splice(idx, 1)
		//
		return val
	}
	while (using_outs_amount.compare(target_amount) < 0 && unused_outs.length > 0) {
		var out = _poppedRandomValueFromList(unused_outs)
		const out_amount = out.amount
		toFinalize_usableOuts.push(out)
		toFinalize_usingOutsAmount = using_outs_amount.add(out_amount)
		console.log(
			"Using output: "
			+ monero_utils.formatMoney(out_amount) 
			+ " - " 
			+ JSON.stringify(out)
		)
	}
	//
	return {
		usableOuts: toFinalize_usableOuts,
		usingOutsAmount: toFinalize_usingOutsAmount
	}
}
