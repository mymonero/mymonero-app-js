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
			console.log("✅  Tests completed without error.")
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
		symmetric_string_cryptor.EncryptedBase64String__Async(
			plaintextMessage, 
			password,
			function(err, returned_encryptedString)
			{
				if (err) {
					console.error("❌  Error: Test failed", err)
					fn(err)
					return
				}
				encryptedString = returned_encryptedString
				// ^ kinda brittle - would be nice to pass directly to next test as arg 
				console.log("✅  Encrypted message to obtain:", encryptedString)
				//
				fn()
			}
		)
	}
	function __proceedTo_test_string_decryption(fn)
	{
		if (encryptedString === null) {
			var errStr = "❌  Cannot decrypt message as encrypt didn't succeed"
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
			return
		}
		symmetric_string_cryptor.DecryptedPlaintextString__Async(encryptedString, password, function(err, decryptedString)
		{
			if (err) {
				console.log("Decryption err", err.toString())
			} else if (decryptedString === plaintextMessage) {
				console.log("✅  Successfully decrypted message to obtain:", decryptedString)
			} else {
				var errStr = "❌  Error: Test failed. Decrypted message did not match original plaintext message."
				err = new Error(errStr)
				console.log(errStr)
			}
			fn(err)
		})
	}
	function __proceedTo_test_string_decryption_withBadPassword(fn)
	{
		if (encryptedString === null) {
			var errStr = "❌  Cannot decrypt message as encrypt didn't succeed"
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
			return
		}
		symmetric_string_cryptor.DecryptedPlaintextString__Async(
			encryptedString, 
			"obviously wrong password", 
			function(err, decryptedString)
			{
				if (err) {
					console.log("✅  Correctly caught decryption error while trying to decrypt with bad password: ", err)
				} else if (decryptedString === plaintextMessage) {
					const errStr = "❌  Despite having bad password, incorrectly successfully decrypted message to obtain: " + decryptedString
					const err = new Error(errStr)
					console.error(errStr)
					fn(err)
				} else {
					var errStr = "❌  Despite having bad password, incorrectly was able to decrypt text... even though decrypted message did not match original plaintext message."
					const err = new Error(errStr)
					console.error(errStr)
					fn(err)
				}
			}
		)
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
		document_cryptor.New_EncryptedDocument__Async(
			plaintextDocument, 
			documentCryptScheme, 
			password,
			function(err, returned_encryptedDocument)
			{
				if (err) {
					fn(err)
				} else {
					encryptedDocument = returned_encryptedDocument
					// ^ using a parent scope reference like this is kinda brittle - would be nice to pass directly to next test as arg 
					console.log("Encrypted document to obtain:", JSON.stringify(encryptedDocument, null, '  '))
					//
					fn()
				}
			}
		)
	}
	function __proceedTo_test_string_decryption(fn)
	{
		if (encryptedDocument === null) {
			var errStr = "Cannot decrypt document as encrypt didn't succeed"
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
			return
		}
		document_cryptor.New_DecryptedDocument(
			encryptedDocument, 
			documentCryptScheme, 
			password,
			function(err, decryptedDocument)
			{
				if (err) {
					console.error("Test failed: ", err)
					fn(err)
					return
				}
				if (JSON.stringify(decryptedDocument) !== JSON.stringify(plaintextDocument)) {
					var errStr = "Error: Test failed. Decrypted document did not match original plaintext document."
					err = new Error(errStr)
					console.log(errStr)
					fn(err)
					return
				}
				console.log("Successfully decrypted document to obtain:", decryptedDocument)
				//
				fn()
			}
		)
	}
}
