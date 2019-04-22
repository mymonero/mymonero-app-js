// Copyright (c) 2014-2019, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const async = require('async')
const EventEmitter = require('events')
const extend = require('util')._extend
const uuidV1 = require('uuid/v1')
//
const monero_txParsing_utils = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_txParsing_utils')
const monero_sendingFunds_utils = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_sendingFunds_utils')
const JSBigInt = require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/biginteger').BigInteger
const monero_amount_format_utils = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_amount_format_utils')
const monero_config = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_config')
const mnemonic_languages = require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/mnemonic_languages')
//
const persistable_object_utils = require('../../DocumentPersister/persistable_object_utils')
const wallet_persistence_utils = require('./wallet_persistence_utils')
const WalletHostPollingController = require('../Controllers/WalletHostPollingController')
//
const wallet_currencies =
{
	xmr: 'xmr'
}
const humanReadable__wallet_currencies =
{
	xmr: 'XMR'
}
//
// Shared utility functions (these can be factored out)
function areObjectsEqual(x, y)
{
	if ( x === y ) return true;
	if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
	if ( x.constructor !== y.constructor ) return false;
	for ( var p in x ) {
		if ( ! x.hasOwnProperty( p ) ) continue;
		if ( ! y.hasOwnProperty( p ) ) return false;
		if ( x[ p ] === y[ p ] ) continue;
		if ( typeof( x[ p ] ) !== "object" ) return false;
		if ( ! areObjectsEqual( x[ p ],  y[ p ] ) ) return false;
	}
	for ( p in y ) {
		if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
	}
	return true;
}
//
//
class Wallet extends EventEmitter
{

	
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Init -> setup
	// Important: You must manually call one of the 'Boot_' methods after you initialize

	constructor(options, context)
	{
		super() // must call super before we can access this
		//
		var self = this
		self.options = options
		self.context = context
		//
		self.initTimeInstanceUUID = uuidV1() // so that e.g. the list controller can immediately have an id with which to do observation listener fn cache hashes
		//
		// initialization state
		self._id = self.options._id || null // initialize to null if creating wallet
		self.failedToInitialize_cb = function(err)
		{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when failure cb called
			{
				self.didFailToInitialize_flag = true
				self.didFailToInitialize_errOrNil = err
			}
			setTimeout(function()
			{
				const fn = self.options.failedToInitialize_cb || function(err, walletInstance) {}
				fn(err, self)
			})
		}
		self.successfullyInitialized_cb = function()
		{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when success cb called
			setTimeout(function()
			{
				const fn = self.options.successfullyInitialized_cb || function(walletInstance) {}
				fn(self)
			})
		}
		//
		// runtime state initialization
		self.isBooted = false // you must manually boot the instance
		self.isLoggingIn = false
		self.isLoggedIn = false // may be modified by existing doc
		//
		// detecting how to set up instance
		if (self._id !== null) { // need to look up existing document but do not decrypt & boot
			self.__setup_fetchExistingDoc_andAwaitBoot()
		} else {
			self.__setup_andAwaitBootAndLogInAndDocumentCreation()
		}
	}
	__setup_fetchExistingDoc_andAwaitBoot()
	{
		const self = this
		self.context.persister.DocumentsWithIds(
			wallet_persistence_utils.CollectionName,
			[ self._id ], // cause we're saying we have an _id passed in…
			function(err, contentStrings)
			{
				if (err) {
					console.error("err.message:", err.message)
					self.failedToInitialize_cb(err)
					return
				}
				if (contentStrings.length === 0) {
					const errStr = "❌  Wallet with that _id not found."
					const err = new Error(errStr)
					console.error(errStr)
					self.failedToInitialize_cb(err)
					return
				}
				const encryptedString = contentStrings[0]
				// and we hang onto this for when the instantiator opts to boot the instance
				self.initialization_encryptedString = encryptedString
				self.successfullyInitialized_cb()
			}
		)
	}
	__setup_andAwaitBootAndLogInAndDocumentCreation()
	{
		const self = this
		//
		// need to create new document. gather metadata & state we need to do so
		self.isLoggedIn = false
		self.wallet_currency = self.options.wallet_currency || wallet_currencies.xmr // default
		if (self.options.generateNewWallet !== true) { // if not generating new mnemonic seed -- which we will pick this up later in the corresponding Boot_*
			// First, for now, pre-boot, we'll simply await boot - no need to create a document yet
			self.successfullyInitialized_cb();
			return;
		}
		function _createWithLocale(currentLocale/*TODO rename*/)
		{
			var compatibleLocaleCode = mnemonic_languages.compatible_code_from_locale(currentLocale)
			if (compatibleLocaleCode == null) {
				compatibleLocaleCode = "en" // fall back to English
			}
			//
			// NOTE: the wallet needs to be imported to the hosted API (e.g. MyMonero) for the hosted API stuff to work
			// case I: user is inputting mnemonic string
			// case II: user is inputting address + view & spend keys
			// case III: we're creating a new wallet
			try {
				const ret = self.context.monero_utils.newly_created_wallet(
					compatibleLocaleCode,
					self.context.nettype
				);
				self.mnemonic_wordsetName = ret.mnemonic_language;  // newly_created_wallet converts locale language code to mnemonic language for us
				if (typeof self.mnemonic_wordsetName == 'undefined' || !self.mnemonic_wordsetName) {
					throw "self.mnemonic_wordsetName not found"
				}
				self.generatedOnInit_walletDescription = 
				{ // this structure here is an artifact of a previous organization of the mymonero-core-js code. it should/can be phased out
					seed: ret.sec_seed_string,
					mnemonicString: ret.mnemonic_string,
					keys: {
						public_addr: ret.address_string,
						view: {
							sec: ret.sec_viewKey_string,
							pub: ret.pub_viewKey_string
						},
						spend: {
							sec: ret.sec_spendKey_string,
							pub: ret.pub_spendKey_string
						}
					}
				};
			} catch (e) {
				self.failedToInitialize_cb(e)
				return;
			}
			//
			// First, for now, pre-boot, we'll simply await boot - no need to create a document yet
			self.successfullyInitialized_cb()
		}
		if (self.options.locale_code && typeof self.options.locale_code !== 'undefined') {
			_createWithLocale(self.options.locale_code);
			return
		} 
		self.context.locale.Locale(function(err, currentLocale)
		{
			if (err) {
				console.error("Error obtaining locale.")
				self.failedToInitialize_cb(err)
				throw err
			}
			_createWithLocale(currentLocale)
		});
	}

	
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Teardown
	// Important: You must manually call TearDown() based on how you retain self
	
	TearDown()
	{
		const self = this
		self.hasBeenTornDown = true
		self.tearDownRuntime()
	}
	tearDownRuntime()
	{
		const self = this
		self.isLoggingIn = false
		self._tearDown_polling()
		self._stopTimer__localTxCleanupJob()
		//
		// and be sure to delete the managed key image cache
		self.context.backgroundAPIResponseParser.DeleteManagedKeyImagesForWalletWith(self.public_address, function() {})
	}
	abortAnyLogInRequest()
	{ // acct info
		const self = this
		let req = self.requestHandle_for_logIn
		if (typeof req !== 'undefined' && req !== null) {
			console.log("💬  Aborting running login request")
			req.abort()
		}
		self.requestHandle_for_logIn = null
		self.isLoggingIn = false // set synchronously
	}
	_tearDown_polling()
	{
		const self = this
		if (typeof self.hostPollingController !== 'undefined' && self.hostPollingController !== null) {
			self.hostPollingController.TearDown()
			self.hostPollingController = null
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime (Post init, pre-boot) - Accessors - Public - Creating new wallets

	MnemonicStringWhichWasGeneratedOnInit()
	{
		return self.generatedOnInit_walletDescription.mnemonicString
	}
	// TODO: there may be room for a 'regenerate mnemonic' with new wordset imperative function


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Booting - Creating/adding wallets

	Boot_byLoggingIn_givenNewlyCreatedWallet(
		persistencePassword,
		walletLabel,
		swatch,
		fn
	) {
		const self = this
		//		
		self.persistencePassword = persistencePassword || null
		if (self.persistencePassword === null) {
			throw "You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
		}
		self.walletLabel = walletLabel || ""
		self.swatch = swatch || ""
		//
		const generatedOnInit_walletDescription = self.generatedOnInit_walletDescription
		const seed = generatedOnInit_walletDescription.seed
		const mnemonicString = generatedOnInit_walletDescription.mnemonicString
		const keys = generatedOnInit_walletDescription.keys
		//
		// pretty sure this is redundant, so commenting:
		const address = keys.public_addr
		const view_key__private = keys.view.sec
		const spend_key__private = keys.spend.sec
		const wasAGeneratedWallet = true // true, in this case
		//
		self._boot_byLoggingIn(
			address,
			view_key__private,
			spend_key__private,
			seed,
			wasAGeneratedWallet,
			false, // persistEvenIfLoginFailed_forServerChange
			fn
		)
	}
	Boot_byLoggingIn_existingWallet_withMnemonic(
		persistencePassword,
		walletLabel,
		swatch,
		mnemonicString,
		persistEvenIfLoginFailed_forServerChange, // need to be able to pass this in, in this case
		fn
	) { // fn: (err?) -> Void
		const self = this
		//
		self.persistencePassword = persistencePassword || null
		if (persistencePassword === null) {
			throw "You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
		}
		//
		self.walletLabel = walletLabel || ""
		self.swatch = swatch || ""
		//
		self.mnemonicString = mnemonicString // even though we re-derive the mnemonicString on success, this is being set here so as to prevent the bug where it gets lost when changing the API server and a reboot w/mnemonicSeed occurs
		// we'll grab the mnemonic_language in a sec:
		//
		var ret;
		try {
			ret = self.context.monero_utils.seed_and_keys_from_mnemonic(
				mnemonicString,
				self.context.nettype
			);
		} catch (e) {
			console.error("Invalid mnemonic!");
			self.__trampolineFor_failedToBootWith_fnAndErr(fn, e)
			return
		}
		{
			if (typeof ret.mnemonic_language == 'undefined' || !ret.mnemonic_language) {
				self.__trampolineFor_failedToBootWith_fnAndErr(fn, "Unknown mnemonic language")
				return
			}
			self.mnemonic_wordsetName = ret.mnemonic_language;
		}
		self._boot_byLoggingIn(
			ret.address_string,
			ret.sec_viewKey_string,
			ret.sec_spendKey_string,
			ret.sec_seed_string,
			false, // wasAGeneratedWallet,
			persistEvenIfLoginFailed_forServerChange,
			fn
		);
	}
	Boot_byLoggingIn_existingWallet_withAddressAndKeys(
		persistencePassword,
		walletLabel,
		swatch,
		address,
		view_key__private,
		spend_key__private,
		persistEvenIfLoginFailed_forServerChange,
		fn // (err?) -> Void
	) {
		const self = this
		{
			self.persistencePassword = persistencePassword || null
			if (persistencePassword === null) {
				throw "You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
			}
		}
		{
			self.walletLabel = walletLabel || ""
			self.swatch = swatch || ""
		}
		{
			const seed = undefined
			const wasAGeneratedWallet = false
			self._boot_byLoggingIn(
				address,
				view_key__private,
				spend_key__private,
				seed, // seed
				wasAGeneratedWallet,
				persistEvenIfLoginFailed_forServerChange,
				fn
			)
		}
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Booting - Reading saved wallets

	Boot_decryptingExistingInitDoc(
		persistencePassword,
		fn
	) {
		const self = this
		self.persistencePassword = persistencePassword || null
		if (persistencePassword === null) {
			const errStr = "❌  You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
			const err = new Error(errStr)
			console.error(errStr)
			self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
			return
		}
		//
		const encryptedString = self.initialization_encryptedString
		if (typeof encryptedString === 'undefined' || encryptedString === null) {
			const errStr = "__boot_decryptInitDoc_andBoot called but encryptedString undefined"
			const err = new Error(err)
			self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
			return
		}
		//
		__proceedTo_decryptContentString(encryptedString)
		//
		function __proceedTo_decryptContentString(encryptedString)
		{
			self.context.string_cryptor__background.New_DecryptedString__Async(
				encryptedString,
				self.persistencePassword,
				function(err, plaintextString)
				{
					if (err) {
						console.error("❌  Decryption err: " + err.toString())
						self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
						return
					}
					self.initialization_encryptedString = null // now we can free this
					//
					var plaintextDocument = null;
					try {
						plaintextDocument = JSON.parse(plaintextString)
					} catch (e) {
						self.__trampolineFor_failedToBootWith_fnAndErr(fn, e)
						return
					}
					__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
				}
			)
		}
		function __proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
		{ // reconstituting state…
			wallet_persistence_utils.HydrateInstance(
				self,
				plaintextDocument
			)
			// Regenerate any runtime vals that depend on persisted vals..
			self.regenerate_shouldDisplayImportAccountOption()
			//
			__proceedTo_validateEncryptedValuesHydration()
		}
		function __proceedTo_validateEncryptedValuesHydration()
		{
			function _failWithValidationErr(errStr)
			{
				const err = new Error(errStr)
				console.error(errStr)
				self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
			}
			if (self.walletLabel === null || typeof self.walletLabel === 'undefined' || self.walletLabel === "") {
				return _failWithValidationErr("Reconstituted wallet had no valid self.walletLabel")
			}
			if (self.wallet_currency === null || typeof self.wallet_currency === 'undefined' || self.wallet_currency === "") {
				return _failWithValidationErr("Reconstituted wallet had no valid self.wallet_currency")
			}
			// We are not going to check whether the acct seed is nil/'' here because if the wallet was
			// imported with public addr, view key, and spend key only rather than seed/mnemonic, we
			// cannot obtain the seed.
			if (self.public_address === null || typeof self.public_address === 'undefined' || self.public_address === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid public_address")
			}
			if (self.public_keys === null || typeof self.public_keys === 'undefined' || self.public_keys === {}) {
				return _failWithValidationErr("Reconstituted wallet had no valid public_keys")
			}
			if (self.public_keys.view === null || typeof self.public_keys.view === 'undefined' || self.public_keys.view === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid public_keys.view")
			}
			if (self.public_keys.spend === null || typeof self.public_keys.spend === 'undefined' || self.public_keys.spend === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid public_keys.spend")
			}
			if (self.private_keys === null || typeof self.private_keys === 'undefined' || self.private_keys === {}) {
				return _failWithValidationErr("Reconstituted wallet had no valid private_keys")
			}
			if (self.private_keys.view === null || typeof self.private_keys.view === 'undefined' || self.private_keys.view === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid private_keys.view")
			}
			if (self.private_keys.spend === null || typeof self.private_keys.spend === 'undefined' || self.private_keys.spend === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid private_keys.spend")
			}
			if (self.account_seed == "") {
				return _failWithValidationErr("Reconstituted wallet had empty string at account_seed")
			}
			//
			// finally
			if (self.isLoggedIn) { // the typical case - and we can check this here b/c we actually persist .isLoggedIn
				self._trampolineFor_successfullyBooted(fn)
				// so we're doing the same thing as Boot_havingLoadedDecryptedExistingInitDoc in the iOS app - since record load architecture differs slightly
			} else {
				console.log("Wallet which was unable to log in was loaded. Attempting to reboot.")
				//
				// going to treat this as a wallet which was saved but which failed to log in
				self.logOutAndSaveThenLogBackIn(persistencePassword)
				//
				fn()
			}
		}
	}
	//
	// Runtime - Imperatives - Rebooting / Debooting
	deBoot()
	{
		const self = this
		let old__total_received = self.total_received
		let old__total_sent = self.total_sent
		let old__locked_balance = self.locked_balance
		let old__spent_outputs = self.spent_outputs
		let old__transactions = self.transactions
		{
			self.tearDownRuntime() // stop any requests, etc
		}
		{
			// important flags to clear:
			self.isLoggedIn = false
			self.didFailToBoot_flag = false
			self.didFailToBoot_errOrNil = null
			self.isBooted = false
			//
			self.total_received = undefined
			self.total_sent = undefined
			self.locked_balance = undefined
			//
			self.account_scanned_tx_height = undefined
			self.account_scanned_height = undefined
			self.account_scanned_block_height = undefined
			self.account_scan_start_height = undefined
			self.transaction_height = undefined
			self.blockchain_height = undefined
			//
			self.spent_outputs = undefined
			self.transactions = undefined
			//
			self.dateThatLast_fetchedAccountInfo = undefined
			self.dateThatLast_fetchedAccountTransactions = undefined
		}
		{
			self.___didReceiveActualChangeTo_balance(
				old__total_received,
				old__total_sent,
				old__locked_balance
			)
			self.___didReceiveActualChangeTo_spentOutputs(old__spent_outputs)
			self.___didReceiveActualChangeTo_heights()
			if (typeof self.options.didReceiveUpdateToAccountTransactions === 'function') {
				self.options.didReceiveUpdateToAccountTransactions()
			}
			self.___didReceiveActualChangeTo_transactionsList(
				0, // numberOfTransactionsAdded, 
				[], // newTransactions
				old__transactions // oldTransactions
			)
			self.regenerate_shouldDisplayImportAccountOption()
		}
		self.saveToDisk(function(err)
		{
			if (err) {
				console.log("Error while saving during a deBoot(): " + err)
			}
		});
	}
	logOutAndSaveThenLogBackIn(persistencePassword)
	{
		const self = this
		const fn = function(err)
		{
			if (err) {
				console.log("❌  Error while trying to log back in:", err)
			} else {
				console.log("✅  Logged back in")
			}
		}
		if (self.isLoggedIn || self.isBooted || self.didFailToBoot_flag) {
			self.deBoot()
		}
		if (self.mnemonicString != null && typeof self.mnemonicString != 'undefined') {
			self.Boot_byLoggingIn_existingWallet_withMnemonic(
				persistencePassword,
				self.walletLabel,
				self.swatch,
				self.mnemonicString,
				true, // persistEvenIfLoginFailed_forServerChange,
				fn
			)
		} else {
			if (self.account_seed != null && typeof self.account_seed != "undefined") {
				throw "expected nil self.account_seed"
			}
			self.Boot_byLoggingIn_existingWallet_withAddressAndKeys(
				persistencePassword,
				self.walletLabel,
				self.swatch,
				self.public_address,
				self.private_keys.view,
				self.private_keys.spend,
				true, // persistEvenIfLoginFailed_forServerChange,
				fn
			)
		}
	}
	//
	// Runtime - Imperatives - Private - Booting
	_trampolineFor_successfullyBooted(
		fn // (err?) -> Void
	) {
		const self = this
		{
			if (typeof self.account_seed === 'undefined' || self.account_seed === null || self.account_seed == "") {
				console.warn("⚠️  Wallet initialized without an account_seed.")
				self.wasInitializedWith_addrViewAndSpendKeysInsteadOfSeed = true
			} else { 
				// TODO: move this to -before- the initial saveToDisk()
				const derived_mnemonicString = self.context.monero_utils.mnemonic_from_seed(self.account_seed, self.mnemonic_wordsetName)
				if (self.mnemonicString != null && typeof self.mnemonicString != 'undefined') {
					const areMnemonicsEqual = self.context.monero_utils.are_equal_mnemonics(
						self.mnemonicString,
						derived_mnemonicString
					)
					if (areMnemonicsEqual == false) { // would be rather odd
						throw "Different mnemonicString derived from accountSeed than was entered for login"
					}
					console.log("Not setting mnemonicSeed because the instance was initialized with one and it's the same as the one derived from the account_seed.")
				}
				self.mnemonicString = derived_mnemonicString // in all cases, save derived mnemonic in case input mnemonic was truncated words form - so we always recover full form
			}
		}
		// console.info("✅  Successfully instantiated", self.Description())
		{
			self.isBooted = true
		}
		{ // ensure we call the callback
			fn() 
		}
		{ // notify listeners
			self.emit(self.EventName_booted())
		}
		{
			self.__do_localTxCleanupJob();
			self._startTimer__localTxCleanupJob() // mark dropped txs as dead
			self._atRuntime_setup_hostPollingController() // instantiate (and kick off) polling controller
		}
	}
	_atRuntime_setup_hostPollingController()
	{ 
		const self = this
		let options = { 
			wallet: self,
			factorOfIsFetchingStateDidUpdate_fn: function()
			{
				self.emit(self.EventName_isFetchingUpdatesChanged())
			}
		}
		let context = self.context
		self.hostPollingController = new WalletHostPollingController(options, context)
	}
	_stopTimer__localTxCleanupJob()
	{
		const self = this
		// console.log("💬  Clearing polling localTxCleanupJob__intervalTimer.")
		clearInterval(self.localTxCleanupJob__intervalTimer)
		self.localTxCleanupJob__intervalTimer = null
	}
	_startTimer__localTxCleanupJob()
	{
		const self = this
		// it would be cool to change the sync polling interval to faster while any transactions are pending confirmation, then dial it back while passively waiting
		self.localTxCleanupJob__intervalTimer = setInterval(function()
		{
			self.__do_localTxCleanupJob()
		}, 60 * 1000 /*ms*/) // every minute?
	}
	__do_localTxCleanupJob()
	{
		const self = this;
		var didChangeAny = false;
		const oneDayAndABit_ms = 60 * 60 * (24 + 1/*bit=1hr*/) * 1000;/*ms time*/ // and a bit to avoid possible edge cases
		const timeNow = (new Date()).getTime();
		const n_transactions = (self.transactions || []).length;
		for (let i = 0 ; i < n_transactions ; i++) {
			const existing_tx = self.transactions[i];
			if (typeof existing_tx.timestamp !== 'undefined' && existing_tx.timestamp) {
				const msSinceCreation = timeNow - existing_tx.timestamp.getTime()
				if (msSinceCreation < 0) {
					console.warn("Expected non-negative msSinceCreation")
					continue; // skip this one .. probably some weird mempool thing
				}
				if (msSinceCreation > oneDayAndABit_ms) {
					if (self.IsTransactionConfirmed(existing_tx) == false
						|| existing_tx.mempool == true) {
						if (existing_tx.isFailed != true/*already*/) { 
							console.log("Marking transaction as dead: ", existing_tx)
							//
							didChangeAny = true;
							existing_tx.isFailed = true;  // this flag does not need to get preserved on existing_txs when overwritten by an incoming_tx because if it's returned by the server, it can't be dead
						}
					}
				}
			} else {
				console.warn("Expected non-nil existing_tx.timestamp")
			}
		}
		if (didChangeAny) {
			self.saveToDisk(function(err) {});
		}
	}
	__trampolineFor_failedToBootWith_fnAndErr(fn, err)
	{
		const self = this
		{
			self.didFailToBoot_flag = true
			self.didFailToBoot_errOrNil = err
		}
		fn(err)
		//
		self.emit(self.EventName_errorWhileBooting(), err)
	}
	_boot_byLoggingIn(
		address,
		view_key,
		sec_spendKey_orUndef,
		seed_orUndefined,
		wasAGeneratedWallet,
		persistEvenIfLoginFailed_forServerChange,
		fn
	) {
		const self = this
		//
		self.abortAnyLogInRequest()
		self.isLoggingIn = true
		//
		var ret;
		try {
			ret = self.context.monero_utils.validate_components_for_login(
				address,
				view_key,
				sec_spendKey_orUndef || "", // expects string
				seed_orUndefined || "", // expects string
				self.context.nettype
			);
		} catch (e) {
			return {
				err_str: typeof e === "string" ? e : "" + e
			};
		}
		if (ret.isValid == false) { // actually don't think we're expecting this..
			self.__trampolineFor_failedToBootWith_fnAndErr(fn, "Invalid input")
			return
		}
		//
		// record these properties regardless of whether we are about to error on login
		self.public_address = address;
		if (seed_orUndefined === "") {
			throw "_boot_byLoggingIn passed an empty string for a seed; pass undefined or seed."
		}
		self.account_seed = seed_orUndefined;
		self.public_keys =
		{
			view: ret.pub_viewKey_string,
			spend: ret.pub_spendKey_string
		};
		self.private_keys = 
		{
			view: view_key,
			spend: sec_spendKey_orUndef
		};
		self.isInViewOnlyMode = ret.isInViewOnlyMode; // should be true "if(spend_key__orZero)"
		self.local_wasAGeneratedWallet = wasAGeneratedWallet; // for regeneration purposes later
		//
		{ // this state must be reset after a failure or the wallet will appear to not have logged in successfully despite success
			self.didFailToBoot_flag = false
			self.didFailToBoot_errOrNil = null
		}
		self.requestHandle_for_logIn = self.context.hostedMoneroAPIClient.LogIn(
			address,
			view_key,
			wasAGeneratedWallet,
			function(login__err, new_address, received__generated_locally, start_height)
			{
				self.requestHandle_for_logIn = null // free
				//
				self.isLoggingIn = false
				self.isLoggedIn = login__err == null
				self.login__new_address = new_address
				self.login__generated_locally = received__generated_locally // now update this b/c the server may have pre-existing information
				self.account_scan_start_height = start_height // is actually the same thing - we should save this here so we can use it when calculating whether to show the import btn
				//
				self.regenerate_shouldDisplayImportAccountOption() // now this can be called
				//
				const shouldExitOnLoginError = persistEvenIfLoginFailed_forServerChange == false
				if (login__err) {
					if (shouldExitOnLoginError == true) {
						self.__trampolineFor_failedToBootWith_fnAndErr(fn, login__err)
						//
						return
					} else {
						// not returning here allows us to continue with the above-set login info to call
						// 'saveToDisk(…)' when this call to log in is coming from a wallet
						// reboot. reason is that we expect all such wallets to be valid monero
						// wallets if they are able to have been rebooted.
					}
				}
				//
				self.saveToDisk(
					function(save__err)
					{
						if (save__err) {
							self.__trampolineFor_failedToBootWith_fnAndErr(fn, save__err)
							return
						}
						if (shouldExitOnLoginError == false && login__err) {
							// if we are attempting to re-boot the wallet, but login failed
							self.__trampolineFor_failedToBootWith_fnAndErr(fn, login__err)  // i.e. leave the wallet in the 'errored'/'failed to boot' state even though we saved
							return
						} else { // it's actually a success
							self._trampolineFor_successfullyBooted(fn)
						}
					}
				)
			}
		)
	}
	regenerate_shouldDisplayImportAccountOption()
	{
		const self = this
		let isAPIBeforeGeneratedLocallyAPISupport = typeof self.login__generated_locally == "undefined" || typeof self.account_scan_start_height == 'undefined'
		if (isAPIBeforeGeneratedLocallyAPISupport) {
			if (typeof self.local_wasAGeneratedWallet == 'undefined') {
				self.local_wasAGeneratedWallet = false // just going to set this to false - it means the user is on a wallet which was logged in via a previous version
			}
			if (typeof self.login__new_address == 'undefined') {
				self.login__new_address = false // going to set this to false if it doesn't exist - it means the user is on a wallet which was logged in via a previous version
			}
			self.shouldDisplayImportAccountOption = !self.local_wasAGeneratedWallet && self.login__new_address 
		} else {
			if (typeof self.account_scan_start_height === 'undefined') {
				throw "Logic error: expected latest_scan_start_height"
			}
			self.shouldDisplayImportAccountOption = self.login__generated_locally != true && self.account_scan_start_height !== 0
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public - Events - Booting

	EventName_booted()
	{
		return "EventName_booted"
	}
	EventName_errorWhileBooting()
	{
		return "EventName_errorWhileBooting"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public - Events - Updates

	EventName_walletLabelChanged()
	{
		return "EventName_walletLabelChanged"
	}
	EventName_walletSwatchChanged()
	{
		return "EventName_walletSwatchChanged"
	}
	EventName_balanceChanged()
	{
		return "EventName_balanceChanged"
	}
	EventName_spentOutputsChanged()
	{
		return "EventName_spentOutputsChanged"
	}
	EventName_heightsUpdated()
	{
		return "EventName_heightsUpdated"
	}
	EventName_transactionsChanged()
	{
		return "EventName_transactionsChanged"
	}
	EventName_transactionsAdded()
	{
		return "EventName_transactionsAdded"
	}
	EventName_isFetchingUpdatesChanged()
	{
		return "EventName_isFetchingUpdatesChanged"
	}
	//
	EventName_willBeDeleted()
	{
		return "EventName_willBeDeleted"
	}
	EventName_deleted()
	{
		return "EventName_deleted"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public - Wallet properties
	
	IsFetchingAnyUpdates()
	{
		const self = this
		if (typeof self.hostPollingController === 'undefined' || !self.hostPollingController) {
			return false
		}
		return self.hostPollingController.IsFetchingAnyUpdates()
	}
	HasEverFetched_accountInfo()
	{ // semantically, accountInfo here actually excludes the address, keys, mnemonic, …
		// and mostly means stuff like totals (balances) and heights… but we keep accountInfo
		// cause of the endpoint name
		const self = this
		if (typeof self.dateThatLast_fetchedAccountInfo === 'undefined') {
			return false
		}
		if (self.dateThatLast_fetchedAccountInfo === null) {
			return false
		}
		//
		return true
	}
	HasEverFetched_transactions()
	{
		const self = this
		if (typeof self.dateThatLast_fetchedAccountTransactions === 'undefined') {
			return false
		}
		if (self.dateThatLast_fetchedAccountTransactions === null) {
			return false
		}
		//
		return true
	}
	IsScannerCatchingUp()
	{
		const self = this
		if (self.blockchain_height == 0 || typeof self.blockchain_height == 'undefined' || self.blockchain_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 blockchain_height")
			return true
		}
		if (self.account_scanned_block_height == 0 || typeof self.account_scanned_block_height === 'undefined' || self.account_scanned_block_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 account_scanned_block_height.")
			return true
		}
		const nBlocksBehind = self.blockchain_height - self.account_scanned_block_height
		if (nBlocksBehind >= 10) {
			return true
		} else if (nBlocksBehind < 0) {
			throw "nBlocksBehind < 0" // maybe replace with warn log
			// return false 
		}
		return false
	}
	NBlocksBehind()
	{
		const self = this
		if (self.blockchain_height == 0 || typeof self.blockchain_height == 'undefined' || self.blockchain_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 blockchain_height")
			return 0
		}
		if (self.account_scanned_block_height == 0 || typeof self.account_scanned_block_height === 'undefined' || self.account_scanned_block_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 account_scanned_block_height.")
			return 0
		}
		const nBlocksBehind = self.blockchain_height - self.account_scanned_block_height
		return nBlocksBehind
	}
	CatchingUpPercentageFloat() // btn 0 and 1.0
	{
		const self = this
		if (self.account_scanned_height == 0 || typeof self.account_scanned_height === 'undefined' || self.account_scanned_height === null) {
			throw "CatchingUpPercentageFloat() requested but self.account_scanned_height still 0" // maybe replace with warn log
			// return 0
		} else if (self.transaction_height == 0 || typeof self.transaction_height === 'undefined' || self.transaction_height === null) {
			throw "CatchingUpPercentageFloat() requested but self.transaction_height still 0" // maybe replace with warn log
			// return 0
		}
		const pctFloat = self.account_scanned_height / self.transaction_height
		console.log(`CatchingUpPercentageFloat ${self.account_scanned_height}/${self.transaction_height}=${pctFloat.toFixed(2)}%`)
		return pctFloat
	}
	
	IsTransactionConfirmed(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_txParsing_utils.IsTransactionConfirmed(tx, blockchain_height)
	}
	IsTransactionUnlocked(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_txParsing_utils.IsTransactionUnlocked(tx, blockchain_height)
	}
	TransactionLockedReason(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_txParsing_utils.TransactionLockedReason(tx, blockchain_height)
	}
	//
	New_StateCachedTransactions()
	{	// this function is preferred for public access
		// as it caches the derivations of the above accessors.
		// these things could maybe be derived on reception from API instead of on each access
		const self = this
		const transactions = self.transactions || []
		const stateCachedTransactions = [] // to finalize
		const transactions_length = transactions.length
		for (let i = 0 ; i < transactions_length ; i++) {
			stateCachedTransactions.push(self.New_StateCachedTransaction(transactions[i]))
		}
		//
		return stateCachedTransactions
	}
	New_StateCachedTransaction(transaction)
	{
		const self = this
		const shallowCopyOf_transaction = extend({}, transaction)
		shallowCopyOf_transaction.isConfirmed = self.IsTransactionConfirmed(transaction)
		shallowCopyOf_transaction.isUnlocked = self.IsTransactionUnlocked(transaction)
		shallowCopyOf_transaction.lockedReason = self.TransactionLockedReason(transaction)
		if (shallowCopyOf_transaction.isConfirmed && shallowCopyOf_transaction.isFailed) {
			// throw "Unexpected isFailed && isConfirmed"
		}
		//
		return shallowCopyOf_transaction;
	}
	//
	IsAccountCatchingUp()
	{
		const self = this
		// TODO: detect whether account is synched yet
		//
		return (self.blockchain_height - self.account_scanned_block_height) >= 10
	}
	//
	Balance_JSBigInt()
	{
		const self = this
		var total_received = self.total_received
		var total_sent = self.total_sent
		if (typeof total_received === 'undefined') {
			total_received = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
		}
		if (typeof total_sent === 'undefined') {
			total_sent = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
		}
		const balance_JSBigInt = total_received.subtract(total_sent)
		if (balance_JSBigInt.compare(0) < 0) {
			return new JSBigInt(0)
		}
		return balance_JSBigInt
	}
	Balance_FormattedString()
	{ // provided for convenience mainly so consumers don't have to require monero_utils
		let self = this
		let balance_JSBigInt = self.Balance_JSBigInt()
		//
		return monero_amount_format_utils.formatMoney(balance_JSBigInt) 
	}
	Balance_DoubleNumber()
	{
		let self = this
		return parseFloat(self.Balance_FormattedString()) // is this appropriate and safe?
	}
	UnlockedBalance_JSBigInt()
	{
		const self = this
		const difference = self.Balance_JSBigInt().subtract(
			self.locked_balance || new JSBigInt(0)
		)
		if (difference.compare(0) < 0) {
			return new JSBigInt(0)
		}
		return difference
	}
	LockedBalance_JSBigInt()
	{
		let self = this
		var lockedBalance_JSBigInt = self.locked_balance
		if (typeof lockedBalance_JSBigInt === 'undefined') {
			lockedBalance_JSBigInt = new JSBigInt(0)
		}
		//
		return lockedBalance_JSBigInt
	}
	LockedBalance_FormattedString()
	{ // provided for convenience mainly so consumers don't have to require monero_utils
		let self = this
		let lockedBalance_JSBigInt = self.LockedBalance_JSBigInt()
		//
		return monero_amount_format_utils.formatMoney(lockedBalance_JSBigInt)
	}
	LockedBalance_DoubleNumber()
	{
		let self = this
		return parseFloat(self.LockedBalance_FormattedString()) // is this appropriate and safe?
	}
	AmountPending_JSBigInt()
	{
		const self = this
		const transactions = self.transactions || []
		const stateCachedTransactions = [] // to finalize
		const transactions_length = transactions.length
		var amount = new JSBigInt(0)
		for (let i = 0 ; i < transactions_length ; i++) {
			const transaction = transactions[i]
			const isConfirmed = self.IsTransactionConfirmed(transaction)
			if (isConfirmed != true) {
				if (transaction.isFailed != true) { // just filtering these out
					// now, adding both of these (positive) values to contribute to the total
					const sent = typeof transaction.total_sent == 'string' ? new JSBigInt(transaction.total_sent) : transaction.total_sent ? transaction.total_sent : new JSBigInt(0)
					const received = typeof transaction.total_received == 'string' ? new JSBigInt(transaction.total_received) : transaction.total_received ? transaction.total_received : new JSBigInt(0)
					const abs_mag = sent.subtract(received).abs()
					amount = amount.add(abs_mag)
				}
			}
		}
		return amount
	}
	AmountPending_FormattedString()
	{ // provided for convenience mainly so consumers don't have to require monero_utils
		let self = this
		let balance_JSBigInt = self.AmountPending_JSBigInt()
		//
		return monero_amount_format_utils.formatMoney(balance_JSBigInt) 
	}
	AmountPending_DoubleNumber()
	{
		let self = this
		return parseFloat(self.AmountPending_FormattedString()) // is this appropriate and safe?
	}
	HasLockedFunds()
	{
		const self = this
		var locked_balance_JSBigInt = self.locked_balance
		if (typeof locked_balance_JSBigInt === 'undefined') {
			return false
		}
		if (locked_balance_JSBigInt === new JSBigInt(0)) {
			return false
		}
		//
		return true
	}
	HumanReadable_walletCurrency()
	{
		const self = this
		var wallet_currency = self.wallet_currency
		if (typeof wallet_currency === 'undefined') {
			console.error("HumanReadable_walletCurrency called while self.wallet_currency was nil, which shouldn't happen")
			console.trace()
			return ''
		}
		//
		return humanReadable__wallet_currencies[wallet_currency] // declared outside of class 
	}
	Description()
	{
		const self = this
		//
		return "Wallet with _id " + self._id + " named " + self.walletLabel + ", Balance:" + self.Balance_FormattedString()
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Sending funds

	SendFunds(
		enteredAddressValue, // currency-ready wallet address, but not an OpenAlias address (resolve before calling)
		resolvedAddress,
		manuallyEnteredPaymentID,
		resolvedPaymentID,
		hasPickedAContact,
		resolvedAddress_fieldIsVisible,
		manuallyEnteredPaymentID_fieldIsVisible,
		resolvedPaymentID_fieldIsVisible,
		//
		contact_payment_id,
		cached_OAResolved_address,
		contact_hasOpenAliasAddress,
		contact_address,
		//
		raw_amount_string,
		isSweepTx, // when true, amount will be ignored
		simple_priority,
		//
		preSuccess_nonTerminal_statusUpdate_fn, // (String) -> Void
		canceled_fn, // () -> Void
		fn // (err?, mockedTransaction?) -> Void
	) {
		const self = this
		// state-lock the function
		if (self.isSendingFunds === true) {
			const errStr = "Currently already sending funds. Please try again when complete."
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		self.isSendingFunds = true
		//
		// now that we've done that, we can ask the user idle controller to disable user idle until we're done with this - cause it's not something we want to have interrupted by the user idle controller tearing everything down!!
		self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
		//
		function ___aTerminalCBWasCalled()
		{ // private - no need to call this yourself unless you're writing a trampoline function
			// Note: This function is to be called before you call fn() anywhere - so we can do critical things like unlocking this method and re-enabling user idle
			self.isSendingFunds = false
			//
			// critical to do on every exit from this method
			self.context.userIdleInWindowController.ReEnable_userIdle()
		}
		let statusUpdate_messageBase = isSweepTx ? `Sending wallet balance…` : `Sending ${raw_amount_string} XMR…`
		const processStepMessageSuffix_byEnumVal = 
		{
			0: "", // 'none'
			1: "", // "initiating send" - so we don't want a suffix
			2: "Fetching latest balance.",
			3: "Calculating fee.",
			4: "Fetching decoy outputs.",
			5: "Constructing transaction.", // may go back to .calculatingFee
			6: "Submitting transaction.",
		}
		const failureCodeMessage_byEnumVal =
		{
			0: "--", // message is provided - this should never get requested
			1: "Unable to load that wallet.",
			2: "Unable to log into that wallet.",
			3: "This wallet must first be imported.",
			4: "Please specify the recipient of this transfer.",
			5: "Couldn't resolve this OpenAlias address.",
			6: "Couldn't validate destination Monero address.",
			7: "Please enter a valid payment ID.",
			8: "Couldn't construct integrated address with short payment ID.",
			9: "The amount you've entered is too low.",
			10: "Please enter a valid amount to send.",
			11: "--", // errInServerResponse_withMsg
			12: "--", // createTransactionCode_balancesProvided
			13: "--", // createTranasctionCode_noBalances
			14: "Unable to construct transaction after many attempts.",
			//
			99900: "Please contact support with code: 99900.", // codeFault_manualPaymentID_while_hasPickedAContact
			99901: "Please contact support with code: 99901.", // codeFault_unableToFindResolvedAddrOnOAContact
			99902: "Please contact support with code: 99902.",// codeFault_detectedPIDVisibleWhileManualInputVisible
			99903: "Please contact support with code: 99903.", // codeFault_invalidSecViewKey
			99904: "Please contact support with code: 99904.", // codeFault_invalidSecSpendKey
			99905: "Please contact support with code: 99905." // codeFault_invalidPubSpendKey
		}
		const createTxErrCodeMessage_byEnumVal =
		{
			0: "No error",
			1: "No destinations provided",
			2: "Wrong number of mix outputs provided",
			3: "Not enough outputs for mixing",
			4: "Invalid secret keys",
			5: "Output amount overflow",
			6: "Input amount overflow",
			7: "Mix RCT outs missing commit",
			8: "Result fee not equal to given fee",
			9: "Invalid destination address",
			10: "Payment ID must be blank when using an integrated address",
			11: "Payment ID must be blank when using a subaddress",
			12: "Couldn't add nonce to tx extra",
			13: "Invalid pub key",
			14: "Invalid commit or mask on output rct",
			15: "Transaction not constructed",
			16: "Transaction too big",
			17: "Not yet implemented",
			18: "Couldn't decode address",
			19: "Invalid payment ID",
			20: "The amount you've entered is too low",
			21: "Can't get decrypted mask from 'rct' hex",
			90: "Spendable balance too low"
		};
		const args = 
		{
			fromWallet_didFailToInitialize: self.didFailToInitialize_flag == true ? true : false,
			fromWallet_didFailToBoot: self.didFailToBoot_flag == true ? true : false,
			fromWallet_needsImport: self.shouldDisplayImportAccountOption == true ? true : false,
			requireAuthentication: self.context.settingsController.authentication_requireWhenSending != false,
			//
			sending_amount_double_string: raw_amount_string,
			hasPickedAContact: hasPickedAContact,
			resolvedAddress_fieldIsVisible: resolvedAddress_fieldIsVisible,
			manuallyEnteredPaymentID_fieldIsVisible: manuallyEnteredPaymentID_fieldIsVisible,
			resolvedPaymentID_fieldIsVisible: resolvedPaymentID_fieldIsVisible,

			is_sweeping: isSweepTx,
			from_address_string: self.public_address,
			sec_viewKey_string: self.private_keys.view,
			sec_spendKey_string: self.private_keys.spend,
			pub_spendKey_string: self.public_keys.spend,
			priority: simple_priority,
			nettype: self.context.nettype,
			//
			enteredAddressValue: enteredAddressValue, // may be ""
			resolvedAddress: resolvedAddress, // may be ""
			manuallyEnteredPaymentID: manuallyEnteredPaymentID, // may be ""
			resolvedPaymentID: resolvedPaymentID, // may be ""
			//
			contact_payment_id: contact_payment_id, // may be undefined
			cached_OAResolved_address: cached_OAResolved_address, // may be undefined
			contact_hasOpenAliasAddress: contact_hasOpenAliasAddress, // may be undefined
			contact_address: contact_address // may be undefined
		};
		args.willBeginSending_fn = function()
		{
			preSuccess_nonTerminal_statusUpdate_fn(statusUpdate_messageBase)
		}
		args.authenticate_fn = function(cb)
		{
			self.context.passwordController.Initiate_VerifyUserAuthenticationForAction(
				"Authenticate",
				function() { cb(false) },
				function() { cb(true) }
			)
		}
		args.status_update_fn = function(params)
		{
			const suffix = processStepMessageSuffix_byEnumVal[params.code] // this is kept in JS rather than C++ to allow for localization via the same mechanism as the rest of the app
			preSuccess_nonTerminal_statusUpdate_fn(`${statusUpdate_messageBase} ${suffix}`) // TODO: localize concatenation
		}
		args.canceled_fn = function()
		{
			___aTerminalCBWasCalled()
			canceled_fn()
		}
		args.success_fn = function(params)
		{
			___aTerminalCBWasCalled()
			//
			let total_sent__JSBigInt = new JSBigInt(""+params.total_sent)
			let total_sent__atomicUnitString = total_sent__JSBigInt.toString()
			let total_sent__floatString = monero_amount_format_utils.formatMoney(total_sent__JSBigInt) 
			let total_sent__float = parseFloat(total_sent__floatString)
			//
			const mockedTransaction = 
			{
				hash: params.tx_hash,
				mixin: "" + params.mixin,
				coinbase: false,
				mempool: true,
				//
				isJustSentTransaction: true, // this is set back to false once the server reports the tx's existence
				timestamp: new Date(), // faking
				//
				unlock_time: 0,
				//
				// height: null, // mocking the initial value -not- to exist (rather than to erroneously be 0) so that isconfirmed -> false
				//
				total_sent: total_sent__JSBigInt,
				total_received: new JSBigInt("0"),
				//
				approx_float_amount: -1 * total_sent__float, // -1 cause it's outgoing
				// amount: new JSBigInt(sentAmount), // not really used (note if you uncomment, import JSBigInt)
				//
				payment_id: params.final_payment_id, // b/c `payment_id` may be nil of short pid was used to fabricate an integrated address
				//
				// info we can only preserve locally
				tx_fee: new JSBigInt(""+params.used_fee),
				tx_key: params.tx_key,
				target_address: params.target_address,
			};
			fn(null, mockedTransaction, params.isXMRAddressIntegrated, params.integratedAddressPIDForDisplay)
			//
			// manually insert .. and subsequent fetches from the server will be 
			// diffed against this, preserving the tx_fee, tx_key, target_address...
			self._manuallyInsertTransactionRecord(mockedTransaction);
		}
		args.error_fn = function(params)
		{
			___aTerminalCBWasCalled()
			//
			const code = params.err_code
			var errStr;
			if (code === 0 || (typeof code === 'undefined' || code === null)) { // msgProvided
				errStr = params.err_msg
			} else if (isNaN(code)) {
				errStr = "Unexpected NaN err code - please contact support"
			} else if (code === 11) { // errInServerResponse_withMsg
				errStr = params.err_msg
			} else if (code === 12) { // createTransactionCode_balancesProvided
				if (params.createTx_errCode == 90) { // needMoreMoneyThanFound
					errStr = `Spendable balance too low. Have ${
						monero_amount_format_utils.formatMoney(new JSBigInt(""+params.spendable_balance))
					} ${monero_config.coinSymbol}; need ${
						monero_amount_format_utils.formatMoney(new JSBigInt(""+params.required_balance))
					} ${monero_config.coinSymbol}.` 
				} else { 
					errStr = createTxErrCodeMessage_byEnumVal[params.createTx_errCode] 
				}
			} else if (code === 13) { // createTranasctionCode_noBalances
				errStr = createTxErrCodeMessage_byEnumVal[params.createTx_errCode]
			} else {
				errStr = failureCodeMessage_byEnumVal[code]
			}
			const err = new Error(errStr)
			console.error(err)
			fn(err)
		}
		args.get_unspent_outs_fn = function(req_params, cb)
		{
			self.context.hostedMoneroAPIClient.UnspentOuts(req_params, cb)
		}
		args.get_random_outs_fn = function(req_params, cb)
		{
			self.context.hostedMoneroAPIClient.RandomOuts(req_params, cb)
		}
		args.submit_raw_tx_fn = function(req_params, cb)
		{
			self.context.hostedMoneroAPIClient.SubmitRawTx(req_params, cb)
		}
		self.context.monero_utils.async__send_funds(args)
	}
	//
	// Runtime - Imperatives - Manual refresh
	requestFromUI_manualRefresh()
	{
		const self = this
		if (typeof self.hostPollingController !== 'undefined' && self.hostPollingController !== null) {
			self.hostPollingController.requestFromUI_manualRefresh()
		} else {
			console.warn("Wallet: Manual refresh requested before hostPollingController set up.")
			// not booted yet.. ignoring
		}
	}
	//
	// Runtime - Imperatives - Private - Persistence
	saveToDisk(fn)
	{
		const self = this
		if (self.hasBeenTornDown) {
			console.warn("Wallet asked to saveToDisk after having been torn down.")
			console.warn((new Error()).stack)
			return
		}
		wallet_persistence_utils.SaveToDisk(
			self,
			fn
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Deletion

	Delete(
		fn // (err?) -> Void
	) {
		const self = this
		self.emit(self.EventName_willBeDeleted(), self._id)
		wallet_persistence_utils.DeleteFromDisk(
			self,
			function(err) {
				if (err) {
					fn(err)
					return
				}
				self.emit(self.EventName_deleted(), self._id)
				fn()
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing password

	ChangePasswordTo(
		changeTo_persistencePassword,
		fn
	) {
		const self = this
		console.log("Wallet changing password.")
		const old_persistencePassword = self.persistencePassword
		self.persistencePassword = changeTo_persistencePassword
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to change password with error", err)
					self.persistencePassword = old_persistencePassword // revert
				} else {
					console.log("Successfully changed password.")
				}
				fn(err)
			}
		)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing meta data

	Set_valuesByKey(
		valuesByKey, // keys like "walletLabel", "swatch"
		fn // (err?) -> Void
	) {
		const self = this
		const valueKeys = Object.keys(valuesByKey)
		var didUpdate_walletLabel = false
		var didUpdate_swatch = false
		for (let valueKey of valueKeys) {
			const value = valuesByKey[valueKey]
			{ // validate / mark as updated for yield later
				if (valueKey === "walletLabel") {
					if (typeof value === 'undefined' || value === null || value.length < 1) {
						return fn(new Error("Please enter a wallet name"))
					}
					didUpdate_walletLabel = true
				} else if (valueKey === "swatch") {
					if (typeof value === 'undefined' || value === null || value.length < 1) {
						return fn(new Error("Please select a wallet color."))
					}
					didUpdate_swatch = true
				}
			}
			{ // set
				self[valueKey] = value
			}
		}
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new valuesByKey", err)
				} else {
					console.log("📝  Successfully saved " + self.constructor.name + " update ", JSON.stringify(valuesByKey))
					if (didUpdate_walletLabel) {
						self.emit(self.EventName_walletLabelChanged(), self.walletLabel)
					}
					if (didUpdate_swatch) {
						self.emit(self.EventName_walletSwatchChanged(), self.swatch)
					}
				}
				fn(err)
			}
		)
	}
	_manuallyInsertTransactionRecord(transaction)
	{
		const self = this
		//
		const oldTransactions = self.transactions;
		const newTransactions = []; // constructing a new array so we preserve the old one
		newTransactions.push(transaction);
		for (var i = 0 ; i < oldTransactions.length ; i++) {
			newTransactions.push(oldTransactions[i]);
		}
		self.transactions = newTransactions;
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					// notify/yield
					if (typeof self.options.didReceiveUpdateToAccountTransactions === 'function') {
						self.options.didReceiveUpdateToAccountTransactions()
					}
					self.___didReceiveActualChangeTo_transactionsList(
						1, // numberOfTransactionsAdded, 
						newTransactions, 
						oldTransactions
					)
				} else {
					// try to save again? 
				}
			}
		)
	}

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private - WalletHostPollingController delegation fns

	_WalletHostPollingController_didFetch_accountInfo(
		total_received_JSBigInt,
		locked_balance_JSBigInt,
		total_sent_JSBigInt,
		spent_outputs,
		account_scanned_tx_height,
		account_scanned_block_height,
		account_scan_start_height,
		transaction_height,
		blockchain_height,
		ratesBySymbol
	) {
		const self = this
		//
		// console.log("_didFetch_accountInfo")
		//
		setTimeout(
			function()
			{ // just so as not to interfere w/ the _didFetch_accountInfo 'meat'
				self.context.CcyConversionRates_Controller_shared.set_batchOf_ratesBySymbol(
					ratesBySymbol
				)
			}
		)
		//
		// JSBigInts
		var accountBalance_didActuallyChange = false
		var existing_total_received = self.total_received || new JSBigInt(0)
		var existing_total_sent = self.total_sent || new JSBigInt(0)
		var existing_locked_balance = self.locked_balance || new JSBigInt(0)
		function isExistingBigIntDifferentFrom(existingValue, newValue)
		{
			if (typeof existingValue === 'undefined' || existingValue === null || typeof existingValue !== 'object') { // let's always broadcast-as-diff receiving a newValue when existingValue is undefined, null, or non JSBigInts
				return true
			} // now we presume it's a JSBigInt…
			if (existingValue.compare(newValue) != 0) {
				return true
			}
			return false
		}
		if (isExistingBigIntDifferentFrom(existing_total_received, total_received_JSBigInt) === true) {
			accountBalance_didActuallyChange = true
		}
		if (isExistingBigIntDifferentFrom(existing_total_sent, total_sent_JSBigInt) === true) {
			accountBalance_didActuallyChange = true
		}
		if (isExistingBigIntDifferentFrom(existing_locked_balance, locked_balance_JSBigInt) === true) {
			accountBalance_didActuallyChange = true
		}
		self.total_received = total_received_JSBigInt
		self.total_sent = total_sent_JSBigInt
		self.locked_balance = locked_balance_JSBigInt
		//
		// outputs
		// TODO: diff spent_outputs
		var spentOutputs_didActuallyChange = false
		const existing_spent_outputs = self.spent_outputs
		if (typeof existing_spent_outputs === 'undefined' || existing_spent_outputs === null || areObjectsEqual(spent_outputs, existing_spent_outputs) === false) {
			spentOutputs_didActuallyChange = true
		}
		self.spent_outputs = spent_outputs
		//
		// heights
		var heights_didActuallyChange = false
		// TODO: should this actually be account_scanned_height? can we remove account_scanned_tx_height?
		if (account_scanned_tx_height !== self.account_scanned_tx_height) {
			heights_didActuallyChange = true
			self.account_scanned_tx_height = account_scanned_tx_height
		}
		if (account_scanned_block_height !== self.account_scanned_block_height) {
			heights_didActuallyChange = true
			self.account_scanned_block_height = account_scanned_block_height
		}
		if (account_scan_start_height !== self.account_scan_start_height) {
			heights_didActuallyChange = true
			self.account_scan_start_height = account_scan_start_height
		}
		// NOTE: the following change even when we do not do/get any txs
		if (transaction_height !== self.transaction_height) {
			heights_didActuallyChange = true
			self.transaction_height = transaction_height
		}
		if (blockchain_height !== self.blockchain_height) {
			heights_didActuallyChange = true
			self.blockchain_height = blockchain_height
		}
		//
		var wasFirstFetchOf_accountInfo = false
		if (typeof self.dateThatLast_fetchedAccountInfo === 'undefined' || self.dateThatLast_fetchedAccountInfo === null) {
			wasFirstFetchOf_accountInfo = true
		}		
		self.dateThatLast_fetchedAccountInfo = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					// no matter what we'll notify that updates were received
					if (typeof self.options.didReceiveUpdateToAccountInfo === 'function') {
						self.options.didReceiveUpdateToAccountInfo()
					}
					//
					// then we'll check if anything actually changed
					var anyChanges = false
					if (accountBalance_didActuallyChange === true || wasFirstFetchOf_accountInfo === true) {
						anyChanges = true
						self.___didReceiveActualChangeTo_balance(
							existing_total_received,
							existing_total_sent,
							existing_locked_balance
						)
					}
					if (spentOutputs_didActuallyChange === true || wasFirstFetchOf_accountInfo === true) {
						anyChanges = true
						self.___didReceiveActualChangeTo_spentOutputs(existing_spent_outputs)
					}
					if (heights_didActuallyChange === true || wasFirstFetchOf_accountInfo === true) {
						anyChanges = true
						self.regenerate_shouldDisplayImportAccountOption() // scan start height may have changed
						self.___didReceiveActualChangeTo_heights()
					}
					if (anyChanges == false) {
						// console.log("💬  No actual changes to balance, heights, or spent outputs")
					}
				}
			}
		)
	}
	_WalletHostPollingController_didFetch_transactionHistory(
		account_scanned_height,
		account_scanned_block_height,
		account_scan_start_height,
		transaction_height,
		blockchain_height,
		transactions
	) {
		const self = this
		//
		var heights_didActuallyChange = false
		if (account_scanned_height !== self.account_scanned_height) {
			heights_didActuallyChange = true
			self.account_scanned_height = account_scanned_height
		}
		if (account_scanned_block_height !== self.account_scanned_block_height) {
			heights_didActuallyChange = true
			self.account_scanned_block_height = account_scanned_block_height
		}
		if (account_scan_start_height !== self.account_scan_start_height) {
			heights_didActuallyChange = true
			self.account_scan_start_height = account_scan_start_height
		}
		// NOTE: the following change even when we do not do/get any txs
		if (transaction_height !== self.transaction_height) {
			heights_didActuallyChange = true
			self.transaction_height = transaction_height
		}
		if (blockchain_height !== self.blockchain_height) {
			heights_didActuallyChange = true
			self.blockchain_height = blockchain_height
		}
		//
		// 
		var transactionsList_didActuallyChange = false // we'll see if anything actually changed and only emit if so
		// We will construct the txs from the incoming txs here as follows.
		// Doing this allows us to selectively preserve already-cached info.
		var numberOfTransactionsAdded = 0
		const newTransactions = []
		const existing_transactions = self.transactions || []
		const self_transactions_length = existing_transactions.length
		const incoming_transactions_length = transactions.length
		//
		// Always make sure to construct new array so we have the old set
		const txs_by_hash = {};
		for (let i = 0 ; i < self_transactions_length ; i++) {
			const existing_tx = self.transactions[i];
			delete existing_tx["id"]; // not expecting an id but just in case .. so we don't break diffing
			txs_by_hash[existing_tx.hash] = existing_tx; // start with old one
		}
		for (let i = 0 ; i < incoming_transactions_length ; i++) {
			const incoming_tx = transactions[i];
			delete incoming_tx["id"]; // because this field changes while sending funds, even though hash stays the same, 
			// and because we don't want `id` messing with our ability to diff. so we're not even going to try to store this
			const existing_tx = txs_by_hash[incoming_tx.hash];
			const isNewTransaction = existing_tx == null || typeof existing_tx === 'undefined'
			var finalized_incoming_tx = incoming_tx;
			// ^- If any existing tx is also in incoming txs, this will cause 
			// the (correct) deletion of e.g. isJustSentTransaction=true.
			if (isNewTransaction) { // This is generally now only going to be hit when new incoming txs happen - or outgoing txs done on other logins
				transactionsList_didActuallyChange = true
				numberOfTransactionsAdded += 1
			} else {
				const existing_same_tx = existing_tx;
				if (existing_same_tx == null) {
					throw "expected existing_same_tx when didFindIncomingTxIdInExistingTxs=false"
				}
				if (areObjectsEqual(incoming_tx, existing_same_tx) === false) {
					transactionsList_didActuallyChange = true // this is likely to happen if tx.height changes while pending confirmation
				}
				//
				// Check if existing tx has any cached info which we 
				// want to bring into the finalized_tx before setting;
				if (existing_same_tx.tx_key && typeof existing_same_tx.tx_key !== 'undefined') {
					finalized_incoming_tx.tx_key = existing_same_tx.tx_key;
				}
				if (existing_same_tx.target_address && typeof existing_same_tx.target_address !== 'undefined') {
					finalized_incoming_tx.target_address = existing_same_tx.target_address;
				}
				if (existing_same_tx.tx_fee && typeof existing_same_tx.tx_fee !== 'undefined') {
					finalized_incoming_tx.tx_fee = existing_same_tx.tx_fee;
				}
				if (typeof incoming_tx.payment_id == 'undefined' || !incoming_tx.payment_id || incoming_tx.payment_id == "") {
					if (existing_same_tx.payment_id && typeof existing_same_tx.payment_id != 'undefined') {
						finalized_incoming_tx.payment_id = existing_same_tx.payment_id; // if the tx lost it.. say, while it's being scanned, keep pid
					}
				}
				if (typeof incoming_tx.mixin == 'undefined' || !incoming_tx.mixin || incoming_tx.mixin == "" || incoming_tx.mixin === 0) {
					if (existing_same_tx.mixin && typeof existing_same_tx.mixin != 'undefined' && existing_same_tx.mixin != 0) {
						finalized_incoming_tx.mixin = existing_same_tx.mixin; // if the tx lost it.. say, while it's being scanned, keep mixin
					}
				}
				//
				if (incoming_tx.mempool === true) { // since the server has an issue sending the spent outputs at present, and only sends the (positive) change amount, this is a workaround to always prefer the existing cached tx's amounts rather than the ones sent by the server
					// NOTE: This will also apply to *incoming* txs just due to the naiveness of the logic
					finalized_incoming_tx.total_sent = existing_same_tx.total_sent;
					finalized_incoming_tx.total_received = existing_same_tx.total_received;
					finalized_incoming_tx.amount = existing_same_tx.amount;
					finalized_incoming_tx.approx_float_amount = existing_same_tx.approx_float_amount;
				}

			}
			// always overwrite existing ones:
			txs_by_hash[incoming_tx.hash] = finalized_incoming_tx; // the finalized tx
			if (isNewTransaction) { // waiting so we have the finalized incoming_tx obj
				newTransactions.push(finalized_incoming_tx)
			}
		}
		//
		var finalized_transactions = [];
		const hashes = Object.keys(txs_by_hash);
		const n_hashes = hashes.length
		for (let i = 0 ; i < n_hashes ; i++) {
			const final_tx = txs_by_hash[hashes[i]];
			final_tx.timestamp = typeof final_tx.timestamp === 'string' ? new Date(final_tx.timestamp) : final_tx.timestamp;
			if (Object.prototype.toString.call(final_tx.timestamp) !== '[object Date]') {
				throw "Expected tx obj to have Date timestamp by now";
			}
			finalized_transactions.push(final_tx);
		}
		finalized_transactions.sort(function(a, b) 
		{
			// there are no ids here for sorting so we'll use timestamp
			// and .mempool can mess with user's expectation of tx sorting
			// when .isFailed is involved, so just going with a simple sort here
			return b.timestamp - a.timestamp;
		});
		//
		self.transactions = finalized_transactions
		//
		var wasFirstFetchOf_transactions = false
		if (typeof self.dateThatLast_fetchedAccountTransactions === 'undefined' || self.dateThatLast_fetchedAccountTransactions === null) {
			wasFirstFetchOf_transactions = true
		}
		self.dateThatLast_fetchedAccountTransactions = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					// notify/yield
					//
					// no matter what, we'll say we received update
					if (typeof self.options.didReceiveUpdateToAccountTransactions === 'function') {
						self.options.didReceiveUpdateToAccountTransactions()
					}
					//
					// and here we'll check whether things actually changed
					if (transactionsList_didActuallyChange === true || wasFirstFetchOf_transactions === true) {
						self.___didReceiveActualChangeTo_transactionsList(numberOfTransactionsAdded, newTransactions, existing_transactions)
					} else {
						// console.log("💬  No info from txs fetch actually changed txs list so not emiting that txs changed")
					}
					if (heights_didActuallyChange === true || wasFirstFetchOf_transactions === true) {
						self.regenerate_shouldDisplayImportAccountOption() // heights may have changed
						self.___didReceiveActualChangeTo_heights()
					}
				} else {
					// try again?
				}
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private - When actual data changes received from host 
	
	___didReceiveActualChangeTo_balance(
		old_total_received,
		old_total_sent,
		old_locked_balance
	) {
		const self = this
		console.log("💬  Received an update to balance")
		self.emit(self.EventName_balanceChanged(), self, old_total_received, old_total_sent, old_locked_balance)
	}
	___didReceiveActualChangeTo_spentOutputs(old_spent_outputs)
	{
		const self = this
		console.log("💬  Received an update to spent outputs")
		self.emit(self.EventName_spentOutputsChanged(), self, (old_spent_outputs || []))
	}
	___didReceiveActualChangeTo_heights()
	{
		const self = this
		// console.log("💬  Received an update to heights")
		self.emit(self.EventName_heightsUpdated(), self)
	}
	___didReceiveActualChangeTo_transactionsList(numberOfTransactionsAdded, newTransactions, oldTransactions)
	{
		const self = this
		// console.log("💬  Got an update to txs list")
		self.emit(self.EventName_transactionsChanged(), self, oldTransactions)
		if (numberOfTransactionsAdded > 0) {
			console.log(`💬  ${numberOfTransactionsAdded} new transaction(s) added`)
			self.emit(self.EventName_transactionsAdded(), self, numberOfTransactionsAdded, newTransactions)
		}
	}
}
module.exports = Wallet
