"use strict"
//
const monero_wallet_utils = require('../monero_utils/monero_wallet_utils')
const document_cryptor = require('../symmetric_cryptor/document_cryptor')
const CryptSchemeFieldValueTypes = document_cryptor.CryptSchemeFieldValueTypes
//
const documentCryptScheme =
{
	wallet_currency: { type: CryptSchemeFieldValueTypes.String },
	mnemonic_wordsetName: { type: CryptSchemeFieldValueTypes.String },
	//
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
		// account_scanned_block_height
		// account_scan_start_height
		// transaction_height
		// blockchain_height
	transactions: { type: CryptSchemeFieldValueTypes.Array }
}
const CollectionName = "Wallets"
//
class SecretWallet
{
    constructor(
		options, 
		context
	)
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
		self._id = self.options._id || null // initialize to null if creating wallet
		self.persistencePassword = self.options.persistencePassword || null
		if (self.persistencePassword === null) {
			const errStr = "You must supply a persistencePassword in the options of your SecretWallet instantiation call"
			console.error(errStr)
			failure_cb(new Error(errStr))
			return
		}
		//
		self.isLoggingIn = false // not persisted in DB
		self.isLoggedIn = false // TODO: toggle this based on what is persisted in the DB -- the wallet needs to be imported to MyMonero for the hosted API stuff to work
		//
		self.mustCreateNewWalletAndAccount = false
		if (self._id === null) {
			//
			// TODO: implement all other import cases like having addr + keys, as well as wallet import w/fee
			//
			if (typeof ifNewWallet__informingAndVerifyingMnemonic_cb === 'undefined' || ifNewWallet__informingAndVerifyingMnemonic_cb === null) {
				const errStr = "You must supply a ifNewWallet__informingAndVerifyingMnemonic_cb as an argument to you SecretWallet instantiation call"
				console.error(errStr)
				failure_cb(new Error(errStr))
				return
			}
			self.mustCreateNewWalletAndAccount = true
			//
			// TODO: load record from database if key provided in options.... maybe SecretWallet shouldn't really handle 
			self.wallet_currency = 'xmr' // default // TODO: persist in db
			// TODO: abstract out currency from this 
			self.mnemonic_wordsetName = 'english' // default // TODO: store in and hydrate from db; TODO: declare & lookup language constants in monero_utils_instance
			//
			console.log("Creating new wallet.")
			self.logIn_creatingNewWallet(
				ifNewWallet__informingAndVerifyingMnemonic_cb, // this is passed straight through from the initializer
				function(err)
				{
					if (err) {
						const errStr = "Failed to instantiate a SecretWallet by creating new wallet and account with error… " + err.toString()
						console.error(errStr)
						failure_cb(err)
					} else {
						console.log("success")
						successfullyInstantiated_cb()
					}
				}
			)
			//
			return
		}
		// Wallet supposedly already exists. Let's look it up…
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
					const errStr = "Wallet with that _id not found."
					const err = new Error(errStr)
					console.error(errStr)
					failure_cb(err)
					return
				}
				const encryptedDocument = docs[0]
				//
				//
				// decryption
				var plaintextDocument
				try {
					plaintextDocument = document_cryptor.New_DecryptedDocument(
						encryptedDocument, 
						documentCryptScheme, 
						self.persistencePassword
					)
				} catch (e) {
					const errStr = "Decryption err: " + e.toString()
					const err = new Error(errStr)
					console.error(errStr)
					failure_cb(err)
					return
				}
				//
				//
				// reconstituting state…
				self.isLoggedIn = plaintextDocument.isLoggedIn
				//
				self.account_seed = plaintextDocument.account_seed
				self.public_keys = plaintextDocument.public_keys
				self.private_keys = plaintextDocument.private_keys
				self.isInViewOnlyMode = plaintextDocument.isInViewOnlyMode
				//
				self.transactions = plaintextDocument.transactions // no || [] because we always persist at least []
				//
				// unpacking heights…
				const heights = plaintextDocument.heights // no || {} because we always persist at least {}
				self.account_scanned_height = heights.account_scanned_height
				self.account_scanned_block_height = heights.account_scanned_block_height
				self.account_scan_start_height = heights.account_scan_start_height
				self.transaction_height = heights.transaction_height
				self.blockchain_height = heights.blockchain_height
				//
				//
				// validation
				function _failWithValidationErr(errStr)
				{
					const err = new Error(errStr)
					console.error(errStr)
					failure_cb(err)
				}
				if (self.isLoggedIn !== true) {
					return _failWithValidationErr("Reconstituted wallet had non-true isLoggedIn")
				}
				if (self.account_seed === null || typeof self.account_seed === 'undefined' || self.account_seed === '') {
					return _failWithValidationErr("Reconstituted wallet had no valid account_seed")
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
				successfullyInstantiated_cb() // all done
			}
		)
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Public
	
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
			const errStr = "informingAndVerifyingMnemonic_cb was undefined."
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
					const errStr = "Please enter a private login key"
					const err = new Error(errStr)
					fn(err)
		            return
		        }
		        if (trimmed_userConfirmed_mnemonicString.toLocaleLowerCase() !== mnemonicString.trim().toLocaleLowerCase()) {
					const errStr = "Private login key does not match"
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
	        // var keys = cnUtil.create_address(seed)
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
	
	logIn_mnemonic(mnemonicString, language, fn)
	{ // fn: (err?) -> Void
		const self = this
		monero_wallet_utils.SeedAndKeysFromMnemonic(
			mnemonicString,
			self.mnemonic_wordsetName,
			function(err, seed, keys)
			{
				if (err) {
					fn(err)
					return
				}
				console.log("keys" , keys)
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
    logIn_keys(address, view_key__private, spend_key__private)
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
    // Runtime - Imperatives - Public - Sending funds
	
	// TODO
	
	

    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Private
	

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
		console.log("_logIn")
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
					self.account_seed = account_seed
					self.public_keys = public_keys
					self.private_keys = private_keys
					self.isInViewOnlyMode = isInViewOnlyMode
					//
					self.isLoggingIn = false
			        self.isLoggedIn = true
					//
		            const wasAccountImported = !wasAGeneratedWallet && new_address
					// console.log("SUCCESS… wasAccountImported", wasAccountImported)
					self.wasAccountImported = wasAccountImported
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
    // Runtime - Imperatives - Private
	
	saveToDisk(fn)
	{
		console.log("> saveToDisk")
		const self = this
		const persistencePassword = self.persistencePassword
		if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
			const errStr = "Cannot save wallet to disk as persistencePassword was missing."
			const err = new Error(errStr)
			fn(err)
			return
		}
		const heights = {} // to construct:
		if (self.account_scanned_height !== null && typeof self.account_scanned_height !== 'undefined') {
			heights["account_scanned_height"] = account_scanned_height
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
		const plaintextDocument =
		{
			wallet_currency: self.wallet_currency,
			mnemonic_wordsetName: self.mnemonic_wordsetName,
			//
			account_seed: self.account_seed,
			public_keys: self.public_keys,
			private_keys: self.private_keys,
			//
			isLoggedIn: self.isLoggedIn,
			isInViewOnlyMode: self.isInViewOnlyMode,
			//
			transactions: self.transactions || [], // maybe not fetched yet
			heights: heights
		}
		if (self._id !== null) {
			plaintextDocument._id = self._id
		}
		// console.log("debug info: going to save plaintextDocument", plaintextDocument)
		//
		const encryptedDocument = document_cryptor.New_EncryptedDocument(
			plaintextDocument, 
			documentCryptScheme, 
			persistencePassword
		)
		// console.log("debug info: going to save encryptedDocument", encryptedDocument)
		//
		var query =
		{
			account_seed: encryptedDocument.account_seed
		}
		if (self._id !== null) {
			query._id = self._id // not strictly necessary
		}
		var update = encryptedDocument
		var options =
		{
			upsert: true,
			multi: false,
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

				console.log("Saved Walleterr,  numAffected,  affectedDocuments,  upsert,",
							err,
							numAffected,
							affectedDocuments,
							upsert)
				if (err) {
					fn(err)
					return
				} 
				var affectedDocument
				if (Array.isArray(affectedDocuments)) {
					affectedDocument = affectedDocuments[0]
				} else {
					affectedDocument = affectedDocuments
				}
				if (self._id === null) {
					if (affectedDocument._id === null) { // not that this would happen…
						const errStr = "Saved wallet but _id after saving was null"
						const err = new Error(errStr)
						fn(err)
						return // bail
					}
					self._id = affectedDocument._id // so we have it in runtime memory now…
				} else {
					if (affectedDocument._id !== self._id) {
						const errStr = "Saved wallet but _id after saving was not equal to non-null _id before saving"
						const err = new Error(errStr)
						fn(err)
						return // bail
					}
				}
				fn()
			}
		)
	}
	
	
    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Private - Tx history sync
	
	_fetchTransactionHistory(fn)
	{ // fn: (err?) -> Void
		const self = this
		var __debug_fnName = "_fetchTransactionHistory"
		if (self.isLoggedIn !== true) {
			const errStr = "Unable to " + __debug_fnName + " as isLoggedIn !== true"
			console.error(errStr)
			fn(err)
			return
		}
		if (typeof self.account_seed === 'undefined' && self.account_seed === null || self.account_seed === '') {
			const errStr = "Unable to " + __debug_fnName + " as no account_seed"
			console.error(errStr)
			fn(err)
			return
		}
		if (typeof self.private_keys === 'undefined' && self.private_keys === null) {
			const errStr = "Unable to " + __debug_fnName + " as no private_keys"
			console.error(errStr)
			fn(err)
			return
		}
		self.context.hostedMoneroAPIClient.AddressTransactions(
			self.account_seed,
			self.private_keys.view,
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
				self.__didFetchTransactionHistory(
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
    // Runtime - Delegation - Private - Tx history sync

	__didFetchTransactionHistory(
		account_scanned_height, 
		account_scanned_block_height, 
		account_scan_start_height,
		transaction_height, 
		blockchain_height, 
		transactions
	)
	{
		const self = this
		console.log("_didFetchTransactionHistory")
		//
		self.account_scanned_height = account_scanned_height
		self.account_scanned_block_height = account_scanned_block_height
		self.account_scan_start_height = account_scan_start_height
		self.transaction_height = transaction_height
		self.blockchain_height = blockchain_height 
		self.transactions = transactions
		//
		self.saveToDisk(
			function(err)
			{
				// anything to do here?
				//
				// TODO: emit event 
			}
		)
	}

}
module.exports = SecretWallet