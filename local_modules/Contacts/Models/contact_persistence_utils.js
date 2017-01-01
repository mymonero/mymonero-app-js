//
const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
const CryptSchemeFieldValueTypes = document_cryptor.CryptSchemeFieldValueTypes
//
// Constants
//
const CollectionName = "Contacts"
exports.CollectionName = CollectionName
//
const documentCryptScheme =
{
	fullname: { type: CryptSchemeFieldValueTypes.String },
	address__XMR: { type: CryptSchemeFieldValueTypes.String },
	payment_id: { type: CryptSchemeFieldValueTypes.String },
	emoji: { type: CryptSchemeFieldValueTypes.String }
}
exports.DocumentCryptScheme = documentCryptScheme
//
// Utility functions
function HydrateInstance(
	instance,
	plaintextDocument
)
{
	const self = instance
	//
	// console.log("plaintextDocument", plaintextDocument)
	self.fullname = plaintextDocument.fullname
	self.address__XMR = plaintextDocument.address__XMR
	self.payment_id = plaintextDocument.payment_id
	self.emoji = plaintextDocument.emoji
}
exports.HydrateInstance = HydrateInstance
//
function SaveToDisk(
	instance,
	fn
)
{
	const self = instance
	const document_cryptor__background = self.context.document_cryptor__background
	console.log("📝  Saving contact to disk ", self.Description())
	//
	fn = fn || function(err) { console.error(err); console.trace("No fn provided to SaveToDisk") }
	//
	const persistencePassword = self.persistencePassword
	if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
		const errStr = "❌  Cannot save contact to disk as persistencePassword was missing."
		const err = new Error(errStr)
		fn(err)
		return
	}
	//
	const plaintextDocument =
	{
		fullname: self.fullname,
		address__XMR: self.address__XMR,
		payment_id: self.payment_id,
		emoji: self.emoji
	}
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
			if (self._id === null || typeof self._id === 'undefined') {
				_proceedTo_insertNewDocument(encryptedDocument)
			} else {
				_proceedTo_updateExistingDocument(encryptedDocument)
			}
		}
	)
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
					console.error("Error while saving contact:", err)
					fn(err)
					return
				}
				if (newDocument._id === null) { // not that this would happen…
					fn(new Error("❌  Inserted contact but _id after saving was null"))
					return // bail
				}
				self._id = newDocument._id // so we know it at runtime now
				console.log("✅  Saved newly inserted contact with _id " + self._id + ".")
				fn()
			}
		)
	}
	function _proceedTo_updateExistingDocument(encryptedDocument)
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
					console.error("Error while saving contact:", err)
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
					fn(new Error("❌  Updated contact but _id after saving was null"))
					return // bail
				}
				if (affectedDocument._id !== self._id) {
					fn(new Error("❌  Updated contact but _id after saving was not equal to non-null _id before saving"))
					return // bail
				}
				if (numAffected === 0) {
					fn(new Error("❌  Number of documents affected by _id'd update was 0"))
					return // bail
				}
				console.log("✅  Saved update to contact with _id " + self._id + ".")
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
	console.log("📝  Deleting contact ", self.Description())
	const query =
	{
		_id: self._id
	}
	const options = {}
	self.context.persister.RemoveDocuments(
		CollectionName,
		query,
		options,
		function(
			err,
			numRemoved
		)
		{
			if (err) {
				console.error("Error while removing contact:", err)
				fn(err)
				return
			}
			if (numRemoved === 0) {
				fn(new Error("❌  Number of documents removed by _id'd remove was 0"))
				return // bail
			}
			console.log("🗑  Deleted saved contact with _id " + self._id + ".")
			fn()
		}
	)
}
exports.DeleteFromDisk = DeleteFromDisk
