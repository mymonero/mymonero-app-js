"use strict"

const string_cryptor = require('./symmetric_string_cryptor')
const child_ipc = require('../Concurrency/ipc.electron.child')

const reporting_appVersion = process.argv[2]
if (typeof reporting_appVersion === 'undefined' || !reporting_appVersion) {
	throw "BackgroundStringCryptor.electron.child.js requires argv[2] reporting_appVersion"
}
//
//
// Declaring tasks:
//
const tasksByName =
{
	New_EncryptedBase64String__Async: function(
		taskUUID,
		plaintextDocument, 
		password
	) {
		// console.time("encrypting " + taskUUID)
		string_cryptor.New_EncryptedBase64String__Async(
			plaintextDocument, 
			password,
			function(err, encryptedDocument)
			{
				// console.timeEnd("encrypting " + taskUUID)
				child_ipc.CallBack(taskUUID, err, encryptedDocument)
			}
		)
	},
	New_DecryptedString__Async: function(
		taskUUID,
		encryptedDocument, 
		password
	) {
		// console.time("decrypting " + taskUUID)
		string_cryptor.New_DecryptedString__Async(
			encryptedDocument,
			password,
			function(err, plaintextDocument)
			{
				// console.timeEnd("decrypting " + taskUUID)
				child_ipc.CallBack(taskUUID, err, plaintextDocument)
			}
		)
	}
}
//
//
// Kicking off runtime:
//
child_ipc.InitWithTasks_AndStartListening(tasksByName, "BackgroundStringCryptor.electron.child", reporting_appVersion)