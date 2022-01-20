"use strict"

const BackgroundTaskExecutor = require('../Concurrency/BackgroundTaskExecutor.electron')

class BackgroundStringCryptor extends BackgroundTaskExecutor
{
	constructor(options, context)
	{
		options = options || {}
		options.absolutePathToChildProcessSourceFile = __dirname + '/./BackgroundStringCryptor.electron.child.js'
		//
		const electron = require('electron')
		const app = electron.app || electron.remote.app
		const forReporting_appVersion = app.getVersion()
		options.argsForChild = [ forReporting_appVersion ]
		//
		super(options, context)
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
		const self = this
		self.executeBackgroundTaskNamed(
			'New_EncryptedBase64String__Async',
			fn, // fn goes as second arg
			[
				plaintextDocument, 
				password
			]
		)
	}
	New_DecryptedString__Async(
		encryptedDocument,
		password,
		fn // fn: (err?, decryptedDocument) -> Void
	) {
		const self = this
		self.executeBackgroundTaskNamed(
			'New_DecryptedString__Async',
			fn, // fn goes as second arg
			[
				encryptedDocument, 
				password
			]
		)
	}
}
module.exports = BackgroundStringCryptor