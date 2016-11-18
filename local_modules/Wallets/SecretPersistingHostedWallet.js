// Copyright (c) 2014-2016, MyMonero.com
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

"use strict"
//
const async = require('async')
//
const monero_wallet_utils = require('../monero_utils/monero_wallet_utils')
const monero_sendingFunds_utils = require('../monero_utils/monero_sendingFunds_utils')
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger
//
const document_cryptor = require('../symmetric_cryptor/document_cryptor')
const CryptSchemeFieldValueTypes = document_cryptor.CryptSchemeFieldValueTypes
//
const documentCryptScheme =
{
	public_address: { type: CryptSchemeFieldValueTypes.String },
	account_seed: { type: CryptSchemeFieldValueTypes.String },
	public_keys: { type: CryptSchemeFieldValueTypes.JSON },
		// view
		// spend
	private_keys: { type: CryptSchemeFieldValueTypes.JSON },
		// view
		// spend
	//
	heights: { type: CryptSchemeFieldValueTypes.JSON },
		// account_scanned_height
		// account_scanned_tx_height
		// account_scanned_block_height
		// account_scan_start_height
		// transaction_height
		// blockchain_height
	totals: { type: CryptSchemeFieldValueTypes.JSON },
		// total_received
		// locked_balance
		// total_sent
	//
	transactions: { type: CryptSchemeFieldValueTypes.Array },
	spent_outputs: { type: CryptSchemeFieldValueTypes.Array }
}
const CollectionName = "Wallets"
//
const wallet_currencies =
{
	xmr: 'xmr'
}
//
class SecretPersistingHostedWallet
{
	constructor(options, context)
	{
		var self = this
		self.options = options
		self.context = context
		//
		self.setup()
	}
	setup()
	{
		var self = this
		//
		const failure_cb = self.options.failure_cb // (err) -> Void
		const successfullyInstantiated_cb = self.options.successfullyInstantiated_cb // () -> Void
		const ifNewWallet__informingAndVerifyingMnemonic_cb = self.options.ifNewWallet__informingAndVerifyingMnemonic_cb 
		// ^ ifNewWallet__informingAndVerifyingMnemonic_cb: (mnemonicString, confirmation_cb) -> Void
		// 	confirmation_cb: (userConfirmed_mnemonicString) -> Void
		// See logIn_creatingNewWallet. Only need to supply this if you're asking to create a new wallet
		//
		function _trampolineFor_successfullyInstantiated_cb()
		{
			if (typeof self.account_seed === 'undefined' || self.account_seed === null || self.account_seed.length < 1) {
				console.warn("⚠️  Wallet initialized without an account_seed.")
				self.wasInitializedWith_addrViewAndSpendKeysInsteadOfSeed = true
			} else {
				self.mnemonicString = monero_wallet_utils.MnemonicStringFromSeed(self.account_seed, self.mnemonic_wordsetName)
				if (typeof self.initialization_mnemonicString !== 'undefined' && self.initialization_mnemonicString !== null) {
					if (self.mnemonicString !== self.initialization_mnemonicString) {
						const errStr = "❌  Initialized a wallet with a mnemonic string and logged in successfully but the derived mnemonic string from the account_seed wasn't the same as the initialization mnemonic string"
						console.error(errStr)
						failure_cb(new Error(errStr))
						return
					}
				}
			}
			//
			successfullyInstantiated_cb()
			//
			function __callAllSyncFunctions()
			{
				self._fetch_accountInfo(
					function(err)
					{	
					}
				)
				self._fetch_transactionHistory(
					function(err)
					{
					}
				)
			}
			//
			// kick off synchronizations
			setTimeout(function()
			{ 
				__callAllSyncFunctions()
			})
			//
			// and kick off the polling call to pull latest updates
			const syncPollingInterval = 10000 
			setInterval(function()
			{
				__callAllSyncFunctions()
			}, syncPollingInterval)
			
		}
		//
		// initial properties…
		self._id = self.options._id || null // initialize to null if creating wallet
		self.persistencePassword = self.options.persistencePassword || null
		if (self.persistencePassword === null) {
			const errStr = "❌  You must supply a persistencePassword in the options of your SecretPersistingHostedWallet instantiation call"
			const err = new Error(errStr)
			console.error(errStr)
			failure_cb(err)
			return
		}
		self.isLoggingIn = false 
		//
		self.isLoggedIn = false // this is soon toggled based on what is persisted in the DB
		self.mustCreateNewWalletAndAccount = false // to derive…
		if (self._id === null) {
			self._setup_logInOrSignUp(
				ifNewWallet__informingAndVerifyingMnemonic_cb,
				failure_cb,
				_trampolineFor_successfullyInstantiated_cb
			)
			return
		}
		// Wallet supposedly already exists. Let's look it up…
		self._setup_fetchExistingWalletWithId(
			failure_cb,
			_trampolineFor_successfullyInstantiated_cb
		)
	}
	_setup_logInOrSignUp(
		ifNewWallet__informingAndVerifyingMnemonic_cb,
		failure_cb,
		_trampolineFor_successfullyInstantiated_cb
	)
	{
		const self = this
		//
		self.wallet_currency = wallet_currencies.xmr // default 
		self.mnemonic_wordsetName = monero_wallet_utils.wordsetNames.english // default 
		//
		// existing mnemonic string
		self.initialization_mnemonicString = self.options.initWithMnemonic__mnemonicString
		if (typeof self.initialization_mnemonicString !== 'undefined') {
			self.mnemonic_wordsetName = self.options.initWithMnemonic__wordsetName || self.mnemonic_wordsetName
			self.logIn_mnemonic(
				self.initialization_mnemonicString, 
				self.mnemonic_wordsetName,
				function(err)
				{
					if (err) {
						const errStr = "❌  Failed to instantiate a SecretPersistingHostedWallet by adding existing wallet with mnemonic with error… " + err.toString()
						console.error(errStr)
						failure_cb(err)
						return
					}
					console.log("✅  Successfully added existing wallet via mnemonic string")
					_trampolineFor_successfullyInstantiated_cb()
				}
			)
			//
			return
		}
		//
		// address + view & spend keys
		const initialization_address = self.options.initWithKeys__address
		const initialization_view_key__private = self.options.initWithKeys__view_key__private
		const initialization_spend_key__private = self.options.initWithKeys__spend_key__private
		if (typeof initialization_address !== 'undefined') {
			if (typeof initialization_view_key__private === 'undefined' || initialization_view_key__private === null || initialization_view_key__private === '') {
				const errStr = "❌  You must supply a initWithKeys__view_key__private as an argument to you SecretPersistingHostedWallet instantiation call as you are passing initWithKeys__address"
				console.error(errStr)
				failure_cb(new Error(errStr))
				return
			}
			if (typeof initialization_spend_key__private === 'undefined' || initialization_spend_key__private === null || initialization_spend_key__private === '') {
				const errStr = "❌  You must supply a initWithKeys__spend_key__private as an argument to you SecretPersistingHostedWallet instantiation call as you are passing initWithKeys__address"
				const err = new Error(errStr)
				console.error(errStr)
				failure_cb(err)
				return
			}
			self.logIn_keys(
				initialization_address, 
				initialization_view_key__private, 
				initialization_spend_key__private, 
				function(err)
				{
					if (err) {
						const errStr = "❌  Failed to instantiate a SecretPersistingHostedWallet by adding existing wallet with address + spend & view keys with error… " + err.toString()
						const err = new Error(errStr)
						console.error(errStr)
						failure_cb(err)
						return
					}
					console.log("✅  Successfully added existing wallet via address and view & spend keys")
					_trampolineFor_successfullyInstantiated_cb()
				}

			)
			//
			return
		}
		//
		// Otherwise, we're creating a new wallet
		if (typeof ifNewWallet__informingAndVerifyingMnemonic_cb === 'undefined' || ifNewWallet__informingAndVerifyingMnemonic_cb === null) {
			const errStr = "❌  You must supply a ifNewWallet__informingAndVerifyingMnemonic_cb as an argument to you SecretPersistingHostedWallet instantiation call as you are creating a new wallet"
			const err = new Error(errStr)
			console.error(errStr)
			failure_cb(err)
			return
		}
		//
		self.mustCreateNewWalletAndAccount = true
		console.log("Creating new wallet.")
		//
		// NOTE: the wallet needs to be imported to the hosted API (e.g. MyMonero) for the hosted API stuff to work
		self.logIn_creatingNewWallet(
			ifNewWallet__informingAndVerifyingMnemonic_cb, // this is passed straight through from the initializer
			function(err)
			{
				if (err) {
					const errStr = "❌  Failed to instantiate a SecretPersistingHostedWallet by creating new wallet and account with error… " + err.toString()
					const err = new Error(errStr)
					console.error(errStr)
					failure_cb(err)
					return
				}
				console.log("✅  Successfully logged after creating a new wallet.")
				_trampolineFor_successfullyInstantiated_cb()
			}
		)
	}
	_setup_fetchExistingWalletWithId(
		failure_cb,
		_trampolineFor_successfullyInstantiated_cb
	)
	{
		const self = this
		//	
		self.context.persister.DocumentsWithQuery(
			CollectionName,
			{ _id: self._id }, // cause we're saying we have an _id passed in…
			{},
			function(err, docs)
			{
				if (err) {
					console.error(err.toString)
					failure_cb(err)
					return
				}
				if (docs.length === 0) {
					const errStr = "❌  Wallet with that _id not found."
					const err = new Error(errStr)
					console.error(errStr)
					failure_cb(err)
					return
				}
				const encryptedDocument = docs[0]
				__proceedTo_decryptDocument(encryptedDocument)
			}
		)
		function __proceedTo_decryptDocument(encryptedDocument)
		{
			var plaintextDocument
			try {
				plaintextDocument = document_cryptor.New_DecryptedDocument(
					encryptedDocument, 
					documentCryptScheme, 
					self.persistencePassword
				)
			} catch (e) {
				const errStr = "❌  Decryption err: " + e.toString()
				const err = new Error(errStr)
				console.error(errStr)
				failure_cb(err)
				return
			}
			__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
		}
		function __proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
		{ // reconstituting state…
				// console.log("plaintextDocument", plaintextDocument)
			self.isLoggedIn = plaintextDocument.isLoggedIn
			self.dateThatLast_fetchedAccountInfo = plaintextDocument.dateThatLast_fetchedAccountInfo
			self.dateThatLast_fetchedAccountTransactions = plaintextDocument.dateThatLast_fetchedAccountTransactions
			//
			self.dateWalletFirstSavedLocally = plaintextDocument.dateWalletFirstSavedLocally
			//
			self.mnemonic_wordsetName = plaintextDocument.mnemonic_wordsetName
			self.wallet_currency = plaintextDocument.wallet_currency
			//
			self.account_seed = plaintextDocument.account_seed
			self.private_keys = plaintextDocument.private_keys
			self.public_address = plaintextDocument.public_address
			self.public_keys = plaintextDocument.public_keys
			self.isInViewOnlyMode = plaintextDocument.isInViewOnlyMode
			//
			self.transactions = plaintextDocument.transactions // no || [] because we always persist at least []
			//
			// unpacking heights…
			const heights = plaintextDocument.heights // no || {} because we always persist at least {}
			self.account_scanned_height = heights.account_scanned_height
			self.account_scanned_tx_height = heights.account_scanned_tx_height 
			self.account_scanned_block_height = heights.account_scanned_block_height
			self.account_scan_start_height = heights.account_scan_start_height
			self.transaction_height = heights.transaction_height
			self.blockchain_height = heights.blockchain_height
			//
			// unpacking totals
			const totals = plaintextDocument.totals
			// console.log("totals " , totals)
			self.total_received = new JSBigInt(totals.total_received) // persisted as string
			self.locked_balance = new JSBigInt(totals.locked_balance) // persisted as string
			self.total_sent = new JSBigInt(totals.total_sent) // persisted as string
			//
			self.spent_outputs = plaintextDocument.spent_outputs // no || [] because we always persist at least []
			//
			__proceedTo_validateHydration()
		}
		function __proceedTo_validateHydration()
		{
			function _failWithValidationErr(errStr)
			{
				const err = new Error(errStr)
				console.error(errStr)
				failure_cb(err)
			}
			if (self.isLoggedIn !== true) {
				return _failWithValidationErr("Reconstituted wallet had non-true isLoggedIn")
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
			//
			// finally
			_trampolineFor_successfullyInstantiated_cb() // all done
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public

	IsTransactionConfirmed(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_wallet_utils.IsTransactionConfirmed(tx, blockchain_height)
	}
	IsTransactionUnlocked(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_wallet_utils.IsTransactionUnlocked(tx, blockchain_height)
	}
	TransactionLockedReason(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_wallet_utils.TransactionLockedReason(tx, blockchain_height)
	}
	//
	IsAccountCatchingUp()
	{
		const self = this
		//
		return (self.blockchain_height - self.account_scanned_block_height) >= 10
	}
	//
	Balance()
	{
		const self = this
		//
		return self.total_received.subtract(self.total_sent)
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Logging in/Creating accounts
	
	logIn_creatingNewWallet(
		informingAndVerifyingMnemonic_cb,
		fn
	)
	{ // informingAndVerifyingMnemonic_cb: (mnemonicString, confirmation_cb) -> Void
		// confirmation_cb: (userConfirmed_mnemonicString) -> Void
	  // fn: (err?) -> Void
	  //
	  // To use this function, you must supply a informingAndVerifyingMnemonic_cb.
	  // Your supplied cb will be called with the generated mnemonicString and another
	  // _cb, which you must call after you get the user to confirm their mnemonicString.
	  // This function will proceed to verify the confirmation mnemonic string and 
	  // then log into the hosted node server to create an account
	  //	
		const self = this
		//
		const walletDescription = monero_wallet_utils.NewlyCreatedWallet(self.mnemonic_wordsetName)
		const seed = walletDescription.seed
		const mnemonicString = walletDescription.mnemonicString
		const keys = walletDescription.keys
		//
		// Now we must have the user confirm they wrote down their seed correctly
		if (typeof informingAndVerifyingMnemonic_cb === 'undefined') {
			const errStr = "❌  informingAndVerifyingMnemonic_cb was undefined."
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		informingAndVerifyingMnemonic_cb(
			mnemonicString,
			function(userConfirmed_mnemonicString)
			{
				var trimmed_userConfirmed_mnemonicString = userConfirmed_mnemonicString.trim()
				if (trimmed_userConfirmed_mnemonicString === '') {
					const errStr = "❌  Please enter a private login key"
					const err = new Error(errStr)
					fn(err)
					return
				}
				if (trimmed_userConfirmed_mnemonicString.toLocaleLowerCase() !== mnemonicString.trim().toLocaleLowerCase()) {
					const errStr = "❌  Private login key does not match"
					const err = new Error(errStr)
					fn(err)
					return
				}
				// Now we can proceed
				_proceedTo_logIn()
			}
		)
		function _proceedTo_logIn()
		{
			// pretty sure this is redundant, so commenting:
			// var keys = monero_utils.create_address(seed)
			const address = keys.public_addr
			const view_key__private = keys.view.sec
			const spend_key__private = keys.spend.sec
			const wasAGeneratedWallet = true // true, in this case
			//
			self._logIn(
				address,
				view_key__private,
				spend_key__private,
				seed,
				wasAGeneratedWallet,
				fn
			)
		}
	}	
	
	logIn_mnemonic(mnemonicString, wordsetName, fn)
	{ // fn: (err?) -> Void
		const self = this
		monero_wallet_utils.SeedAndKeysFromMnemonic(
			mnemonicString,
			wordsetName,
			function(err, seed, keys)
			{
				if (err) {
					fn(err)
					return
				}
				// console.log("keys" , keys)
				const address = keys.public_addr
				const view_key__private = keys.view.sec
				const spend_key__private = keys.spend.sec
				const wasAGeneratedWallet = false
				self._logIn(
					address,
					view_key__private,
					spend_key__private,
					seed,
					wasAGeneratedWallet,
					fn
				)
			}
		)
	}
	logIn_keys(address, view_key__private, spend_key__private, fn)
	{ // fn: (err?) -> Void
		const self = this
		const seed = undefined
		const wasAGeneratedWallet = false
		self._logIn(
			address,
			view_key__private,
			spend_key__private,
			seed, // seed
			wasAGeneratedWallet,
			fn
		)
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Account registration with hosted node API

	_logOut()
	{
		const self = this
		//
		self.isLoggingIn = false
		self.isLoggedIn = false
		//
		self.account_seed = null
		self.public_keys = null
		self.private_keys = null
		self.isInViewOnlyMode = null
		//
		self.account_scanned_height = null
		self.account_scanned_block_height = null
		self.account_scanned_tx_height = null
		self.account_scan_start_height = null
		self.transaction_height = null
		self.blockchain_height = null
		self.transactions = null
		// more fields?
		// TODO: emit event?
	}

	_logIn(
		address, 
		view_key, 
		spend_key_orUndefinedForViewOnly, 
		seed_orUndefined, 
		wasAGeneratedWallet, 
		fn
	)
	{
		const self = this
		//
		self.isLoggingIn = true
		//
		monero_wallet_utils.VerifiedComponentsForLogIn(
			address, 
			view_key, 
			spend_key_orUndefinedForViewOnly, 
			seed_orUndefined, 
			wasAGeneratedWallet,
			function(
				err,
				address, 
				account_seed, 
				public_keys, 
				private_keys,
				isInViewOnlyMode
			)
			{
				if (err) {
					self._logOut()
					fn(err)
					return
				}
				__proceedTo_loginViaHostedAPI(
					account_seed, 
					public_keys, 
					private_keys,
					isInViewOnlyMode,
					fn
				)
			}
		)
		function __proceedTo_loginViaHostedAPI(
			account_seed,  // these arguments only get passed through 
			public_keys,  // so they can be set in one place below
			private_keys,
			isInViewOnlyMode,
			fn
		)
		{
			self.context.hostedMoneroAPIClient.LogIn(
				address,
				view_key,
				function(err, new_address)
				{
					if (err) {
						self._logOut()
						fn(err)
						return
					}
					self.public_address = address
					self.account_seed = account_seed
					self.public_keys = public_keys
					self.private_keys = private_keys
					self.isInViewOnlyMode = isInViewOnlyMode
					//
					self.isLoggingIn = false
					self.isLoggedIn = true
					//
					const shouldDisplayImportAccountOption = !wasAGeneratedWallet && new_address
					// console.log("SUCCESS… shouldDisplayImportAccountOption", shouldDisplayImportAccountOption)
					self.shouldDisplayImportAccountOption = shouldDisplayImportAccountOption
					//
					self.saveToDisk(
						function(err)
						{
							if (err) {
								fn(err)
								return
							}
							// TODO: emit event that login status changed?
							fn(err)
						}
					)
				}
			)
		}
	}	
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Sending funds
	
	SendFunds(
		target_address, // currency-ready wallet public address or OpenAlias address
		amount, // number
		mixin, 
		payment_id,
		fn,
		// fn: (
		//		err?,
		//		currencyReady_targetDescription_address?,
		//		sentAmount?,
		//		targetDescription_domain_orNone?,
		//		final__payment_id?,
		//		tx_hash?,
		//		tx_fee?
		// )
		confirmWithUser_openAliasAddress_cb
	)
	{
		const self = this
		//
		// state-lock function
		if (self.isSendingFunds === true) {
			const errStr = "Currently already sending funds. Please try again when complete."
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		self.isSendingFunds = true
		//
		// some callback trampoline function declarations…
		// these are important for resetting self's state,
		// which is done in ___aTrampolineForFnWasCalled below
		function __trampolineFor_success(
			currencyReady_targetDescription_address,
			sentAmount,
			targetDescription_domain_orNone,
			final__payment_id,
			tx_hash,
			tx_fee
		)
		{
			___aTrampolineForFnWasCalled()
			//
			console.log("✅  Successfully sent funds.")
			//
			fn(
				null,
				currencyReady_targetDescription_address,
				sentAmount,
				targetDescription_domain_orNone,
				final__payment_id,
				tx_hash,
				tx_fee
			)
		}
		function __trampolineFor_err_withErr(err)
		{
			___aTrampolineForFnWasCalled()
			//
			console.error(err)
			fn(err)
		}
		function __trampolineFor_err_withStr(errStr)
		{
			__trampolineFor_err_withErr(new Error(errStr))
		}
		function ___aTrampolineForFnWasCalled()
		{ // private - no need to call this yourself unless you're writing a trampoline function
			self.isSendingFunds = false
		}
		//
		monero_sendingFunds_utils.SendFunds(
			target_address,
			amount,
			self.public_address,
			self.private_keys,
			self.public_keys,
			self.context.hostedMoneroAPIClient,
			mixin,
			payment_id,
			__trampolineFor_success,
			__trampolineFor_err_withErr,
			confirmWithUser_openAliasAddress_cb
		)
	}

	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Persistence
	
	saveToDisk(fn)
	{
		const self = this
		console.log("> saveToDisk", self)
		//
		const persistencePassword = self.persistencePassword
		if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
			const errStr = "❌  Cannot save wallet to disk as persistencePassword was missing."
			const err = new Error(errStr)
			fn(err)
			return
		}
		//
		const heights = {} // to construct:
		if (self.account_scanned_tx_height !== null && typeof self.account_scanned_tx_height !== 'undefined') {
			heights["account_scanned_tx_height"] = self.account_scanned_tx_height
		}
		if (self.account_scanned_height !== null && typeof self.account_scanned_height !== 'undefined') {
			heights["account_scanned_height"] = self.account_scanned_height
		}
		if (self.account_scanned_block_height !== null && typeof self.account_scanned_block_height !== 'undefined') {
			heights["account_scanned_block_height"] = self.account_scanned_block_height
		}
		if (self.account_scan_start_height !== null && typeof self.account_scan_start_height !== 'undefined') {
			heights["account_scan_start_height"] = self.account_scan_start_height
		}
		if (self.transaction_height !== null && typeof self.transaction_height !== 'undefined') {
			heights["transaction_height"] = self.transaction_height
		}
		if (self.blockchain_height !== null && typeof self.blockchain_height !== 'undefined') {
			heights["blockchain_height"] = self.blockchain_height
		}
		//
		const totals = {} // we store all of these as strings since the totals are JSBigInts
		if (self.total_received !== null && typeof self.total_received !== 'undefined') {
			totals["total_received"] = self.total_received.toString()
		}
		if (self.locked_balance !== null && typeof self.locked_balance !== 'undefined') {
			totals["locked_balance"] = self.locked_balance.toString()
		}
		if (self.total_sent !== null && typeof self.total_sent !== 'undefined') {
			totals["total_sent"] = self.total_sent.toString()
		}		
		//
		if (typeof self.dateWalletFirstSavedLocally === 'undefined') {
			self.dateWalletFirstSavedLocally = new Date()
		}
		//
		const plaintextDocument =
		{
			wallet_currency: self.wallet_currency,
			mnemonic_wordsetName: self.mnemonic_wordsetName,
			//
			account_seed: self.account_seed,
			private_keys: self.private_keys,
			public_address: self.public_address,
			public_keys: self.public_keys,
			//
			isLoggedIn: self.isLoggedIn,
			dateThatLast_fetchedAccountInfo: self.dateThatLast_fetchedAccountInfo,
			dateThatLast_fetchedAccountTransactions: self.dateThatLast_fetchedAccountTransactions,
			dateWalletFirstSavedLocally: self.dateWalletFirstSavedLocally,
			//
			isInViewOnlyMode: self.isInViewOnlyMode,
			//
			transactions: self.transactions || [], // maybe not fetched yet
			heights: heights,
			totals: totals,
			spent_outputs: self.spent_outputs || [] // maybe not fetched yet
		}
		// console.log("debug info: going to save plaintextDocument", plaintextDocument)
		// console.log("type of account_scanned_height", typeof plaintextDocument.heights.account_scanned_height)
		// console.log("totals", JSON.stringify(plaintextDocument.totals))
		// console.log("parsed", JSON.parse(JSON.stringify(plaintextDocument.totals)))
		//
		const encryptedDocument = document_cryptor.New_EncryptedDocument(
			plaintextDocument, 
			documentCryptScheme, 
			persistencePassword
		)
		// console.log("debug info: going to save encryptedDocument", encryptedDocument)
		//
		// insert & update fn declarations for imminent usage…
		function _proceedTo_insertExistingDocument()
		{
			self.context.persister.InsertDocument(
				CollectionName,
				encryptedDocument,
				function(
					err,
					newDocument
				)
				{
					if (err) {
						console.error("Error while saving wallet:", err)
						fn(err)
						return
					} 
					if (newDocument._id === null) { // not that this would happen…
						const errStr = "❌  Inserted wallet but _id after saving was null"
						const err = new Error(errStr)
						fn(err)
						return // bail
					}
					self._id = newDocument._id // so we have it in runtime memory now…
					console.log("✅  Saved newly inserted wallet with _id " + self._id + ".")
					fn()
				}
			)
		}
		function _proceedTo_updateExistingDocument()
		{
			var query =
			{
				_id: self._id // we want to update the existing one
			}
			var update = encryptedDocument
			var options =
			{
				multi: false,
				upsert: false, // we are only using .update because we know the document exists
				returnUpdatedDocs: true
			}
			self.context.persister.UpdateDocuments(
				CollectionName,
				query,
				update,
				options,
				function(
					err,
					numAffected,
					affectedDocuments,
					upsert
				)
				{

					if (err) {
						console.error("Error while saving wallet:", err)
						fn(err)
						return
					} 
					var affectedDocument
					if (Array.isArray(affectedDocuments)) {
						affectedDocument = affectedDocuments[0]
					} else {
						affectedDocument = affectedDocuments
					}
					if (affectedDocument._id === null) { // not that this would happen…
						const errStr = "❌  Updated wallet but _id after saving was null"
						const err = new Error(errStr)
						fn(err)
						return // bail
					}
					if (affectedDocument._id !== self._id) {
						const errStr = "❌  Updated wallet but _id after saving was not equal to non-null _id before saving"
						const err = new Error(errStr)
						fn(err)
						return // bail
					}
					if (numAffected === 0) {
						const errStr = "❌  Number of documents affected by _id'd update was 0"
						const err = new Error(errStr)
						fn(err)
						return // bail
					}
					console.log("✅  Saved update to wallet with _id " + self._id + ".")
					fn()
				}
			)
		}
		//
		if (self._id === null) {
			_proceedTo_insertExistingDocument()
		} else {
			_proceedTo_updateExistingDocument()
		}

	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing password
	
	ChangePasswordFromTo(
		testWithExisting_persistencePassword,
		changeTo_persistencePassword,
		fn
	)
	{
		const self = this
		if (typeof self.persistencePassword === 'undefined' || self.persistencePassword === null || self.persistencePassword == '') {
			return fn(new Error("Invalid self.persistencePassword"))
		}
		if (self.persistencePassword !== testWithExisting_persistencePassword) {
			return fn(new Error("Unable to unlock wallet with that password"))
		}
		if (changeTo_persistencePassword.length < 5) {
			return fn(new Error("New password must be more than 5 characters"))
		}
		console.log("Wallet changing password.")
		self.persistencePassword = changeTo_persistencePassword
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to change password with error", err)
				} else {
					console.log("Successfully changed password.")
				}
				fn(err)
			}
		)

	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Account info & tx history fetch/sync
	
	_fetch_accountInfo(fn)
	{
		const self = this
		var __debug_fnName = "_fetch_accountInfo"
		if (self.isLoggedIn !== true) {
			const errStr = "❌  Unable to " + __debug_fnName + " as isLoggedIn !== true"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.public_address === 'undefined' && self.public_address === null || self.public_address === '') {
			const errStr = "❌  Unable to " + __debug_fnName + " as no public_address"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.private_keys === 'undefined' && self.private_keys === null) {
			const errStr = "❌  Unable to " + __debug_fnName + " as no private_keys"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		self.context.hostedMoneroAPIClient.AddressInfo(
			self.public_address,
			self.private_keys.view,
			self.public_keys.spend,
			self.private_keys.spend,
			function(
				err,
				total_received,
				locked_balance,
				total_sent,
				spent_outputs,
				account_scanned_tx_height,
				account_scanned_block_height,
				account_scan_start_height,
				transaction_height,
				blockchain_height
			)
			{
				if (err) {
					console.error(err.toString())
					fn(err)
					return
				}
				//
				self.__didFetch_accountInfo(
					total_received,
					locked_balance,
					total_sent,
					spent_outputs,
					account_scanned_tx_height,
					account_scanned_block_height,
					account_scan_start_height,
					transaction_height,
					blockchain_height
				)
			}
		)
	}
		
	_fetch_transactionHistory(fn)
	{ // fn: (err?) -> Void
		const self = this
		var __debug_fnName = "_fetch_transactionHistory"
		if (self.isLoggedIn !== true) {
			const errStr = "❌  Unable to " + __debug_fnName + " as isLoggedIn !== true"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.public_address === 'undefined' && self.public_address === null || self.public_address === '') {
			const errStr = "❌  Unable to " + __debug_fnName + " as no public_address"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.private_keys === 'undefined' && self.private_keys === null) {
			const errStr = "❌  Unable to " + __debug_fnName + " as no private_keys"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		self.context.hostedMoneroAPIClient.AddressTransactions(
			self.public_address,
			self.private_keys.view,
			self.public_keys.spend,
			self.private_keys.spend,
			function(
				err,
				account_scanned_height, 
				account_scanned_block_height, 
				account_scan_start_height,
				transaction_height, 
				blockchain_height, 
				transactions
			)
			{
				if (err) {
					console.error(err)
					fn(err)
					return
				}
				//
				self.__didFetch_transactionHistory(
					account_scanned_height, 
					account_scanned_block_height, 
					account_scan_start_height,
					transaction_height, 
					blockchain_height, 
					transactions
				)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private - Account info & tx history fetch/save/sync

	__didFetch_accountInfo(
		total_received,
		locked_balance,
		total_sent,
		spent_outputs,
		account_scanned_tx_height,
		account_scanned_block_height,
		account_scan_start_height,
		transaction_height,
		blockchain_height
	)
	{
		const self = this
		// console.log("_didFetchTransactionHistory")
		//
		self.total_received = total_received
		self.locked_balance = locked_balance
		self.total_sent = total_sent
		self.spent_outputs = spent_outputs
		self.account_scanned_tx_height = account_scanned_tx_height
		self.account_scanned_block_height = account_scanned_block_height
		self.account_scan_start_height = account_scan_start_height
		self.transaction_height = transaction_height
		self.blockchain_height = blockchain_height
		//
		self.dateThatLast_fetchedAccountInfo = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					self.___didReceiveAndSaveUpdateTo_accountInfo()	
				}
			}
		)
	}
	___didReceiveAndSaveUpdateTo_accountInfo()
	{
		const self = this
		if (typeof self.options.didReceiveUpdateToAccountInfo === 'function') {
			self.options.didReceiveUpdateToAccountInfo()
		}
		// todo: emit event?
	}
	//
	//
	__didFetch_transactionHistory(
		account_scanned_height, 
		account_scanned_block_height, 
		account_scan_start_height,
		transaction_height, 
		blockchain_height, 
		transactions
	)
	{
		const self = this
		// console.log("_didFetchTransactionHistory")
		//
		self.account_scanned_height = account_scanned_height
		self.account_scanned_block_height = account_scanned_block_height
		self.account_scan_start_height = account_scan_start_height
		self.transaction_height = transaction_height
		self.blockchain_height = blockchain_height 
		self.transactions = transactions
		//
		self.dateThatLast_fetchedAccountTransactions = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					self.___didReceiveAndSaveUpdateTo_accountTransactions()	
				}
			}
		)
	}
	___didReceiveAndSaveUpdateTo_accountTransactions()
	{
		const self = this
		if (typeof self.options.didReceiveUpdateToAccountTransactions === 'function') {
			self.options.didReceiveUpdateToAccountTransactions()
		}
		// todo: emit event?
	}
}
module.exports = SecretPersistingHostedWallet