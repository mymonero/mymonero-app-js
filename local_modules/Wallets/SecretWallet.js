"use strict"
//
const monero_wallet_utils = require('../monero_utils/monero_wallet_utils')
const document_cryptor = require('../symmetric_cryptor/document_cryptor')
const CryptSchemeFieldValueTypes = document_cryptor.CryptSchemeFieldValueTypes
//
const cryptScheme =
{
	wallet_currency: { type: CryptSchemeFieldValueTypes.String },
	account_seed: { type: CryptSchemeFieldValueTypes.String },
	public_keys: { type: CryptSchemeFieldValueTypes.JSON },
	  // view
	  // spend
	private_keys: { type: CryptSchemeFieldValueTypes.JSON },
	  // view
	  // spend
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
    constructor(options, context)
    {
        var self = this
        self.options = options
        self.context = context
        //
        self.setup()
		//
		// TODO: load record from database if key provided in options.... maybe SecretWallet shouldn't really handle 
		self.wallet_currency = 'xmr' // default // TODO: persist in db
		// TODO: abstract out currency from this 
		self.mnemonic_wordsetName = 'english' // default // TODO: store in and hydrate from db; TODO: declare & lookup language constants in monero_utils_instance
		self.isLoggingIn = false // not persisted in DB
		self.isLoggedIn = false // TODO: toggle this based on what is persisted in the DB -- the wallet needs to be imported to MyMonero for the hosted API stuff to work
		//
		self._id = self.options._id || null
		//
		self.persistencePassword = self.options.persistencePassword || null
		//
		// TODO: hydrate all these from db
		self.account_seed = null
		self.public_keys = null
		self.private_keys = null
		self.isInViewOnlyMode = null
		//
		self.transactions = null
		//
		// TODO: unpack these from persisted 'heights'
		self.account_scanned_height = null
		self.account_scanned_block_height = null
		self.account_scan_start_height = null
		self.transaction_height = null
		self.blockchain_height = null
    }
    setup()
    {
        var self = this
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Public
	
    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Public - Logging in/Creating accounts
	
	LogIn_creatingNewWallet(
		informingAndVerifyingMnemonic_cb,
		fn
	)
	{ // informingAndVerifyingMnemonic_cb: (mnemonicString, confirmation_cb) -> Void
		// confirmation_cb: (userConfirmed_mnemonicString) -> Void
	  // fn: (err?, …) -> Void (see _logIn)
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
	
	LogIn_mnemonic(mnemonicString, language, fn)
	{ // fn: (err?, …) -> Void (see _logIn)
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
    LogIn_keys(address, view_key__private, spend_key__private)
	{
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
					fn(err, null)
					return
				}
				__proceedTo_loginViaHostedAPI(
					account_seed, 
					public_keys, 
					private_keys,
					isInViewOnlyMode
				)
			}
		)
		function __proceedTo_loginViaHostedAPI(
			account_seed,  // these arguments only get passed through 
			public_keys,  // so they can be set in one place below
			private_keys,
			isInViewOnlyMode
		)
		{
			self.context.hostedMoneroAPIClient.LogIn(
				address,
				view_key,
				function(err, new_address)
				{
					if (err) {
						self._logOut()
						fn(err, null)
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
					self.saveToDisk()
					//
					// TODO: emit event that login status changed?
					//
					fn(null)
				}
			)
		}
    }

	
    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Private
	
	saveToDisk()
	{
		console.log("> saveToDisk")
		const self = this
		const persistencePassword = self.persistencePassword
		if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
			console.error("Cannot save wallet to disk as persistencePassword was missing.")
			return
		}
		const heights = {} // to construct:
		if (account_scanned_height !== null && typeof account_scanned_height !== 'undefined') {
			heights["account_scanned_height"] = account_scanned_height
		}
		if (account_scanned_block_height !== null && typeof account_scanned_block_height !== 'undefined') {
			heights["account_scanned_block_height"] = account_scanned_block_height
		}
		if (account_scan_start_height !== null && typeof account_scan_start_height !== 'undefined') {
			heights["account_scan_start_height"] = account_scan_start_height
		}
		if (transaction_height !== null && typeof transaction_height !== 'undefined') {
			heights["transaction_height"] = transaction_height
		}
		if (blockchain_height !== null && typeof blockchain_height !== 'undefined') {
			heights["blockchain_height"] = blockchain_height
		}
		const plaintextDocument =
		{
			wallet_currency: self.wallet_currency,
			//
			account_seed: self.account_seed,
			public_keys: self.public_keys,
			private_keys: self.private_keys,
			//
			transactions: self.transactions || [], // maybe not fetched yet
			heights: heights
		}
		if (self._id !== null) {
			plaintextDocument._id = self._id
		}
		//
		const encryptedDocument = document_cryptor.New_EncryptedDocument(
			plaintextDocument, 
			documentCryptScheme, 
			persistencePassword
		)
		//
		var query =
		{
			account_seed: encryptedDocument.account_seed
		}
		var update = encryptedDocument
		var options =
		{
			upsert: true,
			multi: false,
			returnUpdatedDocs: true
		}
		self.context.persister.updateDocuments(
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
		self.saveToDisk()
		//
		// TODO: emit event 
	}

}
module.exports = SecretWallet