"use strict"
//
const async = require('async')
//
async.series(
	[
		_proceedTo_test_stringCryptor,
		// _proceedTo_test_documentCryptor
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
	console.log(Function)
	//
	const symmetric_string_cryptor = require('../symmetric_string_cryptor')
	//
	const password = "super secret words!"
	const plaintextMessage = "this is the plaintext message"
	var encryptedString = null
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
		encryptedString = symmetric_string_cryptor.EncryptedBase64String(plaintextMessage, password)
		// ^ kinda brittle - would be nice to pass directly to next test as arg 
		console.log("Encrypted message to obtain:", encryptedString)
		//
		fn()
	}
	function __proceedTo_test_string_decryption(fn)
	{
		if (encryptedString === null) {
			var errStr = "Cannot decrypt as encrypt didn't succeed"
			var err = new Error(errStr)
			console.log(errStr)
			//
			fn(err)
			return
		}
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
	}
}
