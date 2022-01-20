"use strict"
//
// The only reason this class exists is because I don't want to complicate the app code with checks
// for whether encryption should be enabled.
//
class BackgroundStringCryptor
{
	constructor(options, context)
	{
	}
	//
	// Runtime - Accessors - Interface
	New_EncryptedBase64String__Async(
		plaintextDocument, 
		password, 
		fn // fn: (err?, encryptedDocument) -> Void
	) {
		const self = this
		setTimeout(function() {
			fn(null, plaintextDocument)
		})
	}
	New_DecryptedString__Async(
		encryptedDocument,
		password,
		fn // fn: (err?, decryptedDocument) -> Void
	) {
		const self = this
		setTimeout(function() {
			fn(null, encryptedDocument)
		})
	}
}
module.exports = BackgroundStringCryptor