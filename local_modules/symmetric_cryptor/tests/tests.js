"use strict"
//
const async = require('async')
//
async.series(
	[
		_proceedTo_test_stringCryptor,
		_proceedTo_test_documentCryptor
	],
	function(err)
	{
		if (err) {
			console.log("Error while performing tests: ", err)
		} else {
			console.log("Tests completed without error.")
		}
	}
)

//
function _proceedTo_test_stringCryptor(fn)
{
	const symmetric_string_cryptor = require('../symmetric_string_cryptor')
	//
	const password = "super secret words!"
	const plaintextMessage = "this is the plaintext message"
	var encryptedString = null
	//
	async.series(
		[
			__proceedTo_test_string_encryption,
			__proceedTo_test_string_decryption,
			__proceedTo_test_string_decryption_withBadPassword
		],
		function(err)
		{
			fn(err)
		}
	)
	//
	function __proceedTo_test_string_encryption(fn)
	{
		encryptedString = symmetric_string_cryptor.EncryptedBase64String(plaintextMessage, password)
		// ^ kinda brittle - would be nice to pass directly to next test as arg 
		console.log("Encrypted message to obtain:", encryptedString)
		//
		fn()
	}
	function __proceedTo_test_string_decryption(fn)
	{
		if (encryptedString === null) {
			var errStr = "Cannot decrypt message as encrypt didn't succeed"
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
			return
		}
		try {
			var decryptedString = symmetric_string_cryptor.DecryptedPlaintextString(encryptedString, password)
			if (decryptedString === plaintextMessage) {
				console.log("Successfully decrypted message to obtain:", decryptedString)
				//
				fn()
			} else {
				var errStr = "Error: Test failed. Decrypted message did not match original plaintext message."
				var err = new Error(errStr)
				console.log(errStr)
				//
				fn(err)
			}
		} catch (e) {
			var err = new Error(e)
			console.log("Decryption err", e)
			fn(err)
		}
	}
	function __proceedTo_test_string_decryption_withBadPassword(fn)
	{
		if (encryptedString === null) {
			var errStr = "Cannot decrypt message as encrypt didn't succeed"
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
			return
		}
		try {
			var decryptedString = symmetric_string_cryptor.DecryptedPlaintextString(encryptedString, "obviously wrong password")
			if (decryptedString === plaintextMessage) {
				const errStr = "Despite having bad password, successfully decrypted message to obtain: " + decryptedString
				const err = new Error(errStr)
				console.error(errStr)
				fn(err)
			} else {
				var errStr = "Despite having bad password, was able to decrypt text... even though decrypted message did not match original plaintext message."
				const err = new Error(errStr)
				console.error(errStr)
				fn(err)
			}
		} catch (e) {
			console.log("Caught decryption error while trying to decrypt with bad password: ", e)
			fn()
		}
	}
}
//
function _proceedTo_test_documentCryptor(fn)
{
	const document_cryptor = require('../document_cryptor')
	//
	const password = "super secret words!"
	const plaintextDocument =
	{
		"_id": 1,
		"plaintext_msg": "a plaintext message",
		"secret_msg": "here's a secret message!",
		"secrets": [
			{ "_id": 1, "msg": "abc" },
			{ "_id": 2, "msg": "def" }
		],
		"secretMsgs_by_id": {
			"1": "abc",
			"2": "def"
		}
	}
	var documentCryptScheme =
	{
		"secret_msg": { type: "String" },
		"secrets": { type: "Array" },
		"secretMsgs_by_id": { type: "JSON" }
	}
	var encryptedDocument = null
	//
	async.series(
		[
			__proceedTo_test_string_encryption,
			__proceedTo_test_string_decryption
		],
		function(err)
		{
			fn(err)
		}
	)
	//
	function __proceedTo_test_string_encryption(fn)
	{
		encryptedDocument = document_cryptor.New_EncryptedDocument(plaintextDocument, documentCryptScheme, password)
		// ^ using a parent scope reference like this is kinda brittle - would be nice to pass directly to next test as arg 
		console.log("Encrypted document to obtain:", JSON.stringify(encryptedDocument, null, '  '))
		//
		fn()
	}
	function __proceedTo_test_string_decryption(fn)
	{
		if (decryptedDocument === null) {
			var errStr = "Cannot decrypt document as encrypt didn't succeed"
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
			return
		}
		var decryptedDocument = document_cryptor.New_DecryptedDocument(encryptedDocument, documentCryptScheme, password)
		if (JSON.stringify(decryptedDocument) === JSON.stringify(plaintextDocument)) {
			console.log("Successfully decrypted document to obtain:", decryptedDocument)
			//
			fn()
		} else {
			var errStr = "Error: Test failed. Decrypted document did not match original plaintext document."
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
		}
	}
}
