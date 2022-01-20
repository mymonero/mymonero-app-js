"use strict"

const string_cryptor = require('./symmetric_string_cryptor')

class BackgroundStringCryptor 
{ // NOTE: This is not really a "background" processor - just a way to access the same functionality for tests in Node.JS
	constructor(options, context)
	{
		const self = this
		{
			self.options = options
			self.context = context
		}
	}
	//
	//
	// Runtime - Accessors - Interface
	//
	New_EncryptedBase64String__Async(
		plaintextDocument, 
		password, 
		fn // fn: (err?, encryptedDocument) -> Void
	)
	{
		string_cryptor.New_EncryptedBase64String__Async(
			plaintextDocument, 
			password,
			fn
		)
	}
	New_DecryptedString__Async(
		encryptedDocument,
		password,
		fn // fn: (err?, decryptedDocument) -> Void
	)
	{
		string_cryptor.New_DecryptedString__Async(
			encryptedDocument,
			password,
			fn
		)
	}
}
module.exports = BackgroundStringCryptor