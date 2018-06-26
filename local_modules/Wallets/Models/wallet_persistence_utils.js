// Copyright (c) 2014-2018, MyMonero.com
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
//
const persistable_object_utils = require('../../DocumentPersister/persistable_object_utils')
const JSBigInt = require('../../mymonero_core_js/cryptonote_utils/biginteger').BigInteger
//
const CollectionName = "Wallets"
exports.CollectionName = CollectionName
//
// Utility functions
function HydrateInstance(
	walletInstance,
	plaintextDocument
) {
	const self = walletInstance
	//
	// console.log("plaintextDocument", plaintextDocument)
	self.isLoggedIn = plaintextDocument.isLoggedIn
	self.isInViewOnlyMode = plaintextDocument.isInViewOnlyMode
	self.shouldDisplayImportAccountOption = plaintextDocument.shouldDisplayImportAccountOption
	function _isNonNil_dateStr(v) { return v && typeof v !== 'undefined' && v !== "" }
	{
		const dateStr = plaintextDocument.dateThatLast_fetchedAccountInfo
		self.dateThatLast_fetchedAccountInfo = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null 
	}
	{
		const dateStr = plaintextDocument.dateThatLast_fetchedAccountTransactions
		self.dateThatLast_fetchedAccountTransactions = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null 
	}
	{
		const dateStr = plaintextDocument.dateWalletFirstSavedLocally
		self.dateWalletFirstSavedLocally = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null 
	}
	//
	self.walletLabel = plaintextDocument.walletLabel
	self.wallet_currency = plaintextDocument.wallet_currency
	self.swatch = plaintextDocument.swatch
	//
	// console.log("plaintextDocument", plaintextDocument)
	self.mnemonic_wordsetName = plaintextDocument.mnemonic_wordsetName
	self.account_seed = plaintextDocument.account_seed !== "" ? plaintextDocument.account_seed : null // do not ever want to have empty string 
	self.private_keys = plaintextDocument.private_keys
	self.public_address = plaintextDocument.public_address
	self.public_keys = plaintextDocument.public_keys
	self.isInViewOnlyMode = plaintextDocument.isInViewOnlyMode
	//
	self.transactions = plaintextDocument.transactions // no || [] because we always persist at least []
	self.transactions.forEach(
		function(tx, i) { // we must fix up what JSON stringifying did to the data
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
exports.HydrateInstance = HydrateInstance
//
//
function SaveToDisk(
	walletInstance,
	fn
) {
	const self = walletInstance
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
	persistable_object_utils.write(
		self.context.string_cryptor__background,
		self.context.persister,
		self, // for reading and writing the _id
		CollectionName,
		plaintextDocument, // _id will get generated for this if self does not have an _id
		persistencePassword,
		fn
	);
}
exports.SaveToDisk = SaveToDisk
//
function DeleteFromDisk(
	instance,
	fn
) {
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
