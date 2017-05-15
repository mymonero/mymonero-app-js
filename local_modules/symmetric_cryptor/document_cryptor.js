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

"use strict"
//
const async = require('async')
//
var symmetric_string_cryptor = require('./symmetric_string_cryptor')
//
//
// Public constants:
//
var CryptSchemeFieldValueTypes =
{
	String: "String",
	Array: "Array",
	JSON: "JSON"
}
exports.CryptSchemeFieldValueTypes = CryptSchemeFieldValueTypes
//
//
// Internal constants:
//
var __wrappedDataValueRootKey = 
{
	Array: "__array"
}
//
//
// These functions return shallow copies of all but en/decrypted key values
//
function New_EncryptedDocument__Async(
	plaintextDocument, 
	documentCryptScheme, 
	password,
	fn
)
{
	var encryptedDocument = {}
	//	
	const plaintextDocument_keys = Object.keys(plaintextDocument)
	async.each(
		plaintextDocument_keys,
		function(documentKey, cb)
		{
			function __storeFinalizedValue_andCallBack(finalizedValue)
			{
				encryptedDocument[documentKey] = finalizedValue
				cb()
			}
			let documentCryptScheme_forKey = documentCryptScheme[documentKey]
			var plaintextValue = plaintextDocument[documentKey]
			if (typeof documentCryptScheme_forKey === 'undefined') {
				// not-encrypted value
				async.setImmediate(
					function()
					{ // ^- to avoid blowing the stack
						const finalizedValue = plaintextValue // just use plaintext
						__storeFinalizedValue_andCallBack(finalizedValue)
					}
				)
				// prevent fallthrough
				return
			}
			var keyValue_plaintextType = documentCryptScheme_forKey.type
			var finalizedPlaintextStringToEncrypt // to derive 
			// TODO: assert type not nil here?
			if (keyValue_plaintextType === "String") {
				finalizedPlaintextStringToEncrypt = plaintextValue
			} else if (keyValue_plaintextType === "Array") {
				// wrap in dictionary at __array and patch to JSON codepath
				var wrappedArray = {}
				wrappedArray[__wrappedDataValueRootKey.Array] = plaintextValue
				// store as JSON:
				finalizedPlaintextStringToEncrypt = JSON.stringify(wrappedArray)
			} else if (keyValue_plaintextType === "JSON") {
				finalizedPlaintextStringToEncrypt = JSON.stringify(plaintextValue)
			} else {
				const errStr = "Error: Unrecognized document_cryptor key value type" + keyValue_plaintextType
				console.error(errStr)
				const err = new Error(errStr)
				async.setImmediate(
					function()
					{ // ^- to avoid blowing the stack
						cb(err)
					}
				)
				return
			}
			if (typeof finalizedPlaintextStringToEncrypt === 'undefined' || finalizedPlaintextStringToEncrypt === null) {
				const finalizedValue = finalizedPlaintextStringToEncrypt // do not attempt to encrypt
				__storeFinalizedValue_andCallBack(finalizedValue)
				return
			}
			symmetric_string_cryptor.EncryptedBase64String__Async(
				finalizedPlaintextStringToEncrypt, 
				password,
				function(err, encryptedStorableValue)
				{
					if (err) {
						console.error("Error encrypted value: ", err)
						cb(err)
						return
					}
					const finalizedValue = encryptedStorableValue
					__storeFinalizedValue_andCallBack(finalizedValue)
				}
			)
		},
		function(err)
		{
			// console.log("encryptedDocument" , encryptedDocument)
			fn(err, err ? null : encryptedDocument)
		}
	)
}
exports.New_EncryptedDocument__Async = New_EncryptedDocument__Async
//
function New_DecryptedDocument__Async(
	encryptedDocument, 
	documentCryptScheme, 
	password,
	fn
)
{
	var decryptedDocument = {}
	//	
	const encryptedDocument_keys = Object.keys(encryptedDocument)
	async.each(
		encryptedDocument_keys,
		function(documentKey, cb)
		{
			function __storeFinalizedValue_andCallBack(finalizedValue)
			{
				decryptedDocument[documentKey] = finalizedValue
				cb()
			}
			const documentCryptScheme_forKey = documentCryptScheme[documentKey]
			const potentiallyEncryptedValue = encryptedDocument[documentKey]
			if (typeof documentCryptScheme_forKey !== 'undefined') {
				const keyValue_plaintextType = documentCryptScheme_forKey.type
				if (potentiallyEncryptedValue === null || potentiallyEncryptedValue === "" || typeof potentiallyEncryptedValue === 'undefined') {
					async.setImmediate(
						function()
						{ // ^ so as not to blow the stack
							// console.log("immediately returning nil/zero val", potentiallyEncryptedValue)
							__storeFinalizedValue_andCallBack(potentiallyEncryptedValue)
						}
					)
					return
				}
				symmetric_string_cryptor.DecryptedPlaintextString__Async(
					potentiallyEncryptedValue, 
					password,
					function(err, decryptedStoredValue)
					{
						if (err) {
							console.error("Error while decrypting document:", err)
							cb(err)
							return
						}
						var finalizedValue;
						// TODO: assert type not nil here?
						if (keyValue_plaintextType === "String") {
							finalizedValue = decryptedStoredValue
						} else if (keyValue_plaintextType === "Array") {
							// wrap in dictionary at __array and patch to JSON codepath
							var json = JSON.parse(decryptedStoredValue)
							finalizedValue = json[__wrappedDataValueRootKey.Array]
						} else if (keyValue_plaintextType === "JSON") {
							finalizedValue = JSON.parse(decryptedStoredValue)
						} else {
							const errStr = "Error: Unrecognized document_cryptor key value type: " + keyValue_plaintextType
							const err = new Error(errStr)
							console.error(errStr)
							fn(err)
							return
						}
						// console.log("received finalizedValue", finalizedValue)
						__storeFinalizedValue_andCallBack(finalizedValue)
					}
				)
				// prevent fallthrough to not-encrypted case
				return
			}
			// v-- just use potentiallyEncryptedValue as it should be plaintext
			const finalizedValue = potentiallyEncryptedValue 
			async.setImmediate(
				function()
				{ // ^ so as not to blow the stack
					// console.log("immediately returning not-encrypted val")
					__storeFinalizedValue_andCallBack(finalizedValue)
				}
			)
		},
		function(err)
		{
			// console.log("decryptedDocument" , decryptedDocument)
			fn(err, err ? null : decryptedDocument)
		}
	)
}
exports.New_DecryptedDocument__Async = New_DecryptedDocument__Async