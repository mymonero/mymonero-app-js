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
function New_EncryptedDocument(plaintextDocument, documentCryptScheme, password)
{
	var encryptedDocument = {}
	//	
	const plaintextDocument_keys = Object.keys(plaintextDocument)
	for (let documentKey of plaintextDocument_keys) {
		let documentCryptScheme_forKey = documentCryptScheme[documentKey]
		var plaintextValue = plaintextDocument[documentKey]
		var finalizedValue // to derive
		if (typeof documentCryptScheme_forKey !== 'undefined') {
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
				// TODO: assert false/fatalerror
				console.log("Error: Unrecognized document_cryptor key value type", keyValue_plaintextType)
				process.exit(1)
			}
			finalizedValue = symmetric_string_cryptor.EncryptedBase64String(
				finalizedPlaintextStringToEncrypt, 
				password
			)
		} else {
			finalizedValue = plaintextValue // just use plaintext
		}
		//
		encryptedDocument[documentKey] = finalizedValue
	}
	//
	return encryptedDocument
}
exports.New_EncryptedDocument = New_EncryptedDocument
//
function New_DecryptedDocument(encryptedDocument, documentCryptScheme, password)
{
	var decryptedDocument = {}
	//	
	const encryptedDocument_keys = Object.keys(encryptedDocument)
	for (let documentKey of encryptedDocument_keys) {
		let documentCryptScheme_forKey = documentCryptScheme[documentKey]
		var potentiallyEncryptedValue = encryptedDocument[documentKey]
		var finalizedValue // to derive
		if (typeof documentCryptScheme_forKey !== 'undefined') {
			var keyValue_plaintextType = documentCryptScheme_forKey.type
			var decryptedStoredValue = symmetric_string_cryptor.DecryptedPlaintextString(
				potentiallyEncryptedValue, 
				password
			)
			// TODO: check null/undefined here?
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
				// TODO: assert false/fatalerror
				console.log("Error: Unrecognized document_cryptor key value type", keyValue_plaintextType)
				process.exit(1)
			}
		} else {
			finalizedValue = potentiallyEncryptedValue // just use potentiallyEncryptedValue as it should be plaintext
		}
		//
		decryptedDocument[documentKey] = finalizedValue
	}
	//
	return decryptedDocument
}
exports.New_DecryptedDocument = New_DecryptedDocument