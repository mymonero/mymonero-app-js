const uuidV1 = require('uuid/v1')
const string_cryptor = require('../symmetric_cryptor/symmetric_string_cryptor')

function read(persister, CollectionName, persistableObject,	fn) {
	const self = persistableObject
	persister.DocumentsWithIds(CollectionName, [ self._id ])
	.then( (docs) => {
		if (docs.length === 0) {
			const errStr = "❌  Record with that _id not found."
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		const encryptedDocument = docs[0]
		__proceedTo_decryptEncryptedDocument(encryptedDocument)
	})
	.catch((err) => {
		console.error(err.toString())
			fn(err)
	})

	function __proceedTo_decryptEncryptedDocument(encryptedBase64String) {
		string_cryptor.New_DecryptedString__Async(encryptedBase64String, self.persistencePassword)
		.then( (plaintextString) => {
			var plaintextDocument;
			try {
				plaintextDocument = JSON.parse(plaintextString)
			} catch (e) {
				let errStr = "Error while parsing JSON: " + e
				console.error("❌  " + errStr)
				fn(errStr)
				return
			}
			fn(null, plaintextDocument)
		})
		.catch( (err) => {
			console.error("❌  Decryption err: " + err.toString())
			fn(err)
		})
	}
}
exports.read = read

function write(persister, persistableObject, CollectionName, plaintextDocument, persistencePassword, fn) {
	const self = persistableObject
	var _id = plaintextDocument._id
	if (typeof _id === 'undefined' || _id == null || _id == "") {
		_id = uuidV1()
		plaintextDocument._id = _id
	}
	const plaintextJSONString = JSON.stringify(plaintextDocument)
	string_cryptor.New_EncryptedBase64String__Async(plaintextJSONString, persistencePassword)
	.then( (encryptedBase64String) => {
		if (self._id === null) {
			_proceedTo_insertNewDocument(encryptedBase64String)
		} else {
			_proceedTo_updateExistingDocument(encryptedBase64String)
		}
	})
	.catch( (err) => {
		console.error("Error while saving :", err)
			fn(err)
	})

	function _proceedTo_insertNewDocument(encryptedBase64String) {
		persister.InsertDocument(CollectionName, plaintextDocument._id, encryptedBase64String)
		.then( (documentToWrite) => {
			self._id = plaintextDocument._id // so we have it in runtime memory now…
			console.log("✅  Saved newly inserted object with _id " + self._id + ".")
			fn()
		})
		.catch( (err) => {
			console.error("Error while saving object:", err)
			fn(err)
		})
	}

	function _proceedTo_updateExistingDocument(encryptedBase64String) {
		persister.UpdateDocumentWithId(CollectionName, self._id, encryptedBase64String)
		.then( (documentToWrite) => {
			console.log("✅  Saved update to object with _id " + self._id + ".")
			fn()
		})
		.catch( (err) => {
			console.error("Error while saving record:", err)
			fn(err)
		})
	}
}
exports.write = write