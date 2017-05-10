// Constants

const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
const CryptSchemeFieldValueTypes = document_cryptor.CryptSchemeFieldValueTypes
const JSBigInt = require('../../cryptonote_utils/biginteger').BigInteger
//
//
const documentCryptScheme =
{
	walletLabel: { type: CryptSchemeFieldValueTypes.String },
	wallet_currency: { type: CryptSchemeFieldValueTypes.String },
	swatch: { type: CryptSchemeFieldValueTypes.String },
	//
	public_address: { type: CryptSchemeFieldValueTypes.String },
	mnemonic_wordsetName: { type: CryptSchemeFieldValueTypes.String },
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
exports.DocumentCryptScheme = documentCryptScheme
//
const CollectionName = "Wallets"
exports.CollectionName = CollectionName


// Utility functions
function HydrateInstance_withUnencryptedValues(
	walletInstance,
	encryptedDocument
)
{
	const self = walletInstance
	//
	// console.log("encryptedDocument", encryptedDocument)
	self.isLoggedIn = encryptedDocument.isLoggedIn
	self.isInViewOnlyMode = encryptedDocument.isInViewOnlyMode
	self.shouldDisplayImportAccountOption = encryptedDocument.shouldDisplayImportAccountOption
	{
		function _isNonNil_dateStr(v)
		{
			return v && typeof v !== 'undefined' && v !== ""
		}
		{
			const dateStr = encryptedDocument.dateThatLast_fetchedAccountInfo
			self.dateThatLast_fetchedAccountInfo = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null 
		}
		{
			const dateStr = encryptedDocument.dateThatLast_fetchedAccountTransactions
			self.dateThatLast_fetchedAccountTransactions = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null 
		}
		{
			const dateStr = encryptedDocument.dateWalletFirstSavedLocally
			self.dateWalletFirstSavedLocally = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null 
		}
	}
}
exports.HydrateInstance_withUnencryptedValues = HydrateInstance_withUnencryptedValues
//
function HydrateInstance_withDecryptedValues(
	walletInstance,
	plaintextDocument
)
{
	const self = walletInstance
	//
	self.walletLabel = plaintextDocument.walletLabel
	self.wallet_currency = plaintextDocument.wallet_currency
	self.swatch = plaintextDocument.swatch
	//
	// console.log("plaintextDocument", plaintextDocument)
	self.mnemonic_wordsetName = plaintextDocument.mnemonic_wordsetName
	self.account_seed = plaintextDocument.account_seed
	self.private_keys = plaintextDocument.private_keys
	self.public_address = plaintextDocument.public_address
	self.public_keys = plaintextDocument.public_keys
	self.isInViewOnlyMode = plaintextDocument.isInViewOnlyMode
	//
	self.transactions = plaintextDocument.transactions // no || [] because we always persist at least []
	self.transactions.forEach(
		function(tx, i)
		{ // we must fix up what JSON stringifying did to the data
			tx.timestamp = new Date(tx.timestamp)
		}
	)
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
	// unpacking totals -- these are stored as strings
	const totals = plaintextDocument.totals
	self.total_received = new JSBigInt(totals.total_received) // persisted as string
	self.locked_balance = new JSBigInt(totals.locked_balance) // persisted as string
	self.total_sent = new JSBigInt(totals.total_sent) // persisted as string
	//
	self.spent_outputs = plaintextDocument.spent_outputs // no || [] because we always persist at least []
}
exports.HydrateInstance_withDecryptedValues = HydrateInstance_withDecryptedValues
//
//
function SaveToDisk(
	walletInstance,
	fn
)
{
	const self = walletInstance
	const document_cryptor__background = self.context.document_cryptor__background
	// console.log("📝  Saving wallet to disk ", self.Description())
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
		walletLabel: self.walletLabel,
		wallet_currency: self.wallet_currency,
		swatch: self.swatch,
		mnemonic_wordsetName: self.mnemonic_wordsetName,
		//
		account_seed: self.account_seed,
		private_keys: self.private_keys,
		public_address: self.public_address,
		public_keys: self.public_keys,
		//
		isLoggedIn: self.isLoggedIn,
		dateThatLast_fetchedAccountInfo: self.dateThatLast_fetchedAccountInfo ? self.dateThatLast_fetchedAccountInfo.toString() : undefined, // must convert to string else will get exception on encryption
		dateThatLast_fetchedAccountTransactions: self.dateThatLast_fetchedAccountTransactions ? self.dateThatLast_fetchedAccountTransactions.toString() : undefined,  // must convert to string else will get exception on encryption
		dateWalletFirstSavedLocally: self.dateWalletFirstSavedLocally ? self.dateWalletFirstSavedLocally.toString() : undefined, // must convert to string else will get exception on encryption
		//
		isInViewOnlyMode: self.isInViewOnlyMode,
		shouldDisplayImportAccountOption: self.shouldDisplayImportAccountOption,
		//
		transactions: self.transactions || [], 
		heights: heights,
		totals: totals,
		spent_outputs: self.spent_outputs || [] // maybe not fetched yet
	}
	// console.log("debug info: going to save plaintextDocument", JSON.stringify(plaintextDocument, null, '\t'))
	// console.log("type of account_scanned_height", typeof plaintextDocument.heights.account_scanned_height)
	// console.log("totals", JSON.stringify(plaintextDocument.totals))
	// console.log("parsed", JSON.parse(JSON.stringify(plaintextDocument.totals)))
	
	document_cryptor__background.New_EncryptedDocument__Async(
		plaintextDocument,
		documentCryptScheme,
		persistencePassword,
		function(err, encryptedDocument)
		{
			if (err) {
				console.error("Error while saving :", err)
				fn(err)
				return
			}

			if (self._id === null) {
				_proceedTo_insertNewDocument(encryptedDocument)
			} else {
				_proceedTo_updateExistingDocument(encryptedDocument)
			}
		}
	)
	// console.log("debug info: going to save encryptedDocument", encryptedDocument)
	//
	// insert & update fn declarations for imminent usage…
	function _proceedTo_insertNewDocument(encryptedDocument)
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
					fn(new Error("❌  Inserted wallet but _id after saving was null"))
					return // bail
				}
				self._id = newDocument._id // so we have it in runtime memory now…
				console.log("✅  Saved newly inserted wallet with _id " + self._id + ".")
				fn()
			}
		)
	}
	function _proceedTo_updateExistingDocument(encryptedDocument)
	{
		var update = encryptedDocument
		self.context.persister.UpdateDocumentWithId(
			CollectionName,
			self._id,
			update,
			function(err)
			{
				if (err) {
					console.error("Error while saving record:", err)
					fn(err)
					return
				}
				console.log("✅  Saved update to record with _id " + self._id + ".")
				fn()
			}
		)
	}
}
exports.SaveToDisk = SaveToDisk
//
function DeleteFromDisk(
	instance,
	fn
)
{
	const self = instance
	console.log("📝  Deleting wallet ", self.Description())
	self.context.persister.RemoveDocumentsWithIds(
		CollectionName,
		[ self._id ],
		function(
			err,
			numRemoved
		)
		{
			if (err) {
				console.error("Error while removing wallet:", err)
				fn(err)
				return
			}
			if (numRemoved === 0) {
				fn(new Error("❌  Number of documents removed by _id'd remove was 0"))
				return // bail
			}
			console.log("🗑  Deleted saved wallet with _id " + self._id + ".")
			fn()
		}
	)
}
exports.DeleteFromDisk = DeleteFromDisk
