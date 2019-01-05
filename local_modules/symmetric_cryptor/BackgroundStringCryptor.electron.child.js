// Copyright (c) 2014-2019, MyMonero.com
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
"use strict"
//
const string_cryptor = require('./symmetric_string_cryptor')
const child_ipc = require('../Concurrency/ipc.electron.child')
//
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