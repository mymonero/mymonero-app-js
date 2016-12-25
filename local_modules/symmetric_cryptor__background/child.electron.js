// Copyright (c) 2014-2017, MyMonero.com
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
const document_cryptor = require('../symmetric_cryptor/document_cryptor')
const tasksByName =
{
	New_EncryptedDocument__Async: function(
		taskUUID,
		plaintextDocument, 
		documentCryptScheme, 
		password
	)
	{
		console.time("encrypting " + taskUUID)
		document_cryptor.New_EncryptedDocument__Async(
			plaintextDocument, 
			documentCryptScheme, 
			password,
			function(err, encryptedDocument)
			{
				console.timeEnd("encrypting " + taskUUID)
				callBack(taskUUID, err, encryptedDocument)
			}
		)
	},
	New_DecryptedDocument__Async: function(
		taskUUID,
		encryptedDocument, 
		documentCryptScheme, 
		password
	)
	{
		console.time("decrypting " + taskUUID)
		document_cryptor.New_DecryptedDocument__Async(
			encryptedDocument,
			documentCryptScheme,
			password,
			function(err, plaintextDocument)
			{
				console.timeEnd("decrypting " + taskUUID)
				callBack(taskUUID, null, plaintextDocument)
			}
		)
	}
}
function callBack(taskUUID, err, returnValue)
{
	const payload =
	{
		eventName: 'FinishedTask', 
		taskUUID: taskUUID, 
		err: err, 
		returnValue: returnValue
	}
	process.send(payload)
}	
function _didReceivePayload(payload)
{
	const taskName = payload.taskName
	const taskUUID = payload.taskUUID
	const payload_args = payload.args
	const argsToCallWith = payload_args.slice() // copy
	{ // finalize:
		argsToCallWith.unshift(taskUUID) // prepend with taskUUID
	}
	const taskFn = tasksByName[taskName]
	taskFn.apply(this, argsToCallWith)
}
{ // start observing incoming messages
	process.on('message', function(m)
	{
		var payload;
		if (typeof m === 'string') {
			try {
				payload = JSON.parse(m)
			} catch (e) {
				console.error("Child couldn't parse incoming message with error" , e, "\n\nmessage:", m)
				throw e
				process.exit(1)
			}
		} else if (typeof m === 'object') {
			payload = m
		} else {
			console.error("Child couldn't parse unrecognized typeof incoming message:", m)
			throw e
			process.exit(1)
		}
		//
		_didReceivePayload(payload)
	})
}
{ // ack boot
	process.send("child is up")
}