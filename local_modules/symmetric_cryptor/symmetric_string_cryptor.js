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
//
// NOTE:
// This module implements the RNCryptor version 3 scheme similarly to JSCryptor,
// but it uses the native Node.JS crypto, generates keys asynchronously, and changes
// cryptor_settings.pbkdf2.iterations from 10000 to 157 as an optimization.
//
var crypto = require('crypto');
//
var currentVersionCryptorFormatVersion = 3;
var cryptor_settings = 
{
	algorithm: 'aes256',
	options: 1, // this gets inserted into the format. should probably be renamed to something more concretely descriptive
	salt_length: 8,
	iv_length: 16,
	pbkdf2: 
	{
		iterations: 157, // 10k iterations is rather slow; srcs say you want well below 10k https://coolaj86.com/articles/symmetric-cryptography-aes-with-webcrypto-and-node-js/
		// This specific number was picked out of the air
		//
		key_length: 32
	},
	hmac: 
	{
		includes_header: true,
		algorithm: 'sha256',
		length: 32
	}
}
//
//
// Encryption
//
function EncryptedBase64String__Async(
	plaintext_msg, 
	password,
	fn
)
{
	if (typeof plaintext_msg === 'undefined') {
		return undefined
	}
	if (plaintext_msg == null) {
		return null
	}
	Buffer.isBuffer(plaintext_msg) || (plaintext_msg = new Buffer(plaintext_msg, 'utf8')) // we're expecting a string, but might as well check anyway
	//
	const components = 
	{
		headers: 
		{
			version: String.fromCharCode(currentVersionCryptorFormatVersion),
			options: String.fromCharCode(cryptor_settings.options)
		}
	}
	components.headers.encryption_salt = _new_random_salt()
	components.headers.hmac_salt = _new_random_salt()
	components.headers.iv = _new_random_iv_of_length(cryptor_settings.iv_length)
	//
	_new_calculated_pbkdf2_key__async(
		password, 
		components.headers.encryption_salt,
		function(err, encryption_key)
		{
			if (err) {
				fn(err)
				return
			}
			_new_calculated_pbkdf2_key__async(
				password, 
				components.headers.hmac_salt,
				function(err, hmac_key)
				{
					if (err) {
						fn(err)
						return
					}
					var iv = components.headers.iv
					Buffer.isBuffer(iv) || (iv = new Buffer(iv, 'binary'))
					Buffer.isBuffer(encryption_key) || (encryption_key = new Buffer(encryption_key, 'binary'))
					//
					const cipher = crypto.createCipheriv(cryptor_settings.algorithm, encryption_key, iv)
					const encrypted_cipherText = cipher.update(plaintext_msg, 'binary', 'binary') + cipher.final('binary')
					//
					components.cipher_text = encrypted_cipherText
					//
					var binary_data = ''
					binary_data += components.headers.version
					binary_data += components.headers.options
					binary_data += components.headers.encryption_salt ? components.headers.encryption_salt : ''
					binary_data += components.headers.hmac_salt ? components.headers.hmac_salt : ''
					binary_data += components.headers.iv
					binary_data += components.cipher_text
					//
					const hmac = _new_generated_hmac(components, hmac_key)
					const encryptedMessage_binaryBuffer = new Buffer(binary_data + hmac, 'binary')
					const encryptedMessage_base64String = encryptedMessage_binaryBuffer.toString('base64')
					//
					fn(null, encryptedMessage_base64String)
				}
			)
		}
	)
}
module.exports.EncryptedBase64String__Async = EncryptedBase64String__Async;
//
//
// Decryption
//
function DecryptedPlaintextString__Async(
	encrypted_msg_base64_string, 
	password, 
	fn
)
{
	if (!encrypted_msg_base64_string || typeof encrypted_msg_base64_string === 'undefined') {
		console.warn("DecryptedPlaintextString__Async was passed nil encrypted_msg_base64_string")
		return fn(null, encrypted_msg_base64_string)
	}
	var unpacked_base64_components = _new_encrypted_base64_unpacked_components_object(encrypted_msg_base64_string)
	_is_hmac_valid__async(
		unpacked_base64_components, 
		password,
		function(err, isValid)
		{
			if (err) {
				fn(err)
				return
			}
			if (isValid === false) {
				const err = new Error("HMAC is not valid.")
				fn(err)
				return				
			}
			_new_calculated_pbkdf2_key__async(
				password, 
				unpacked_base64_components.headers.encryption_salt,
				function(err, cipherKey) 
				{
					if (err) {
						fn(err)
						return
					}
					const cipherKey_binaryBuffer = new Buffer(cipherKey, 'binary')
					const iv_binaryBuffer = new Buffer(unpacked_base64_components.headers.iv, 'binary')
					const cipherText_binaryBuffer = new Buffer(unpacked_base64_components.cipher_text, 'binary')
					const deCipher = crypto.createDecipheriv(cryptor_settings.algorithm, cipherKey_binaryBuffer, iv_binaryBuffer)
					const decrypted = deCipher.update(cipherText_binaryBuffer, 'binary', 'utf8') + deCipher.final('utf8')
					fn(null, decrypted)
				}
			)
		}
	)
}
module.exports.DecryptedPlaintextString__Async = DecryptedPlaintextString__Async;
//
//
// Shared
//
function _new_encrypted_base64_unpacked_components_object(b64str) 
{
	if (!b64str || typeof b64str === 'undefined') { // prevent toString() exception
		throw "_new_encrypted_base64_unpacked_components_object was passed nil b64str"
		// return undefined
	}
	var binary_data = new Buffer(b64str, 'base64').toString('binary')
	var components = 
	{
		headers: _new_parsed_headers_object(binary_data),
		hmac: binary_data.substr(-cryptor_settings.hmac.length)
	}
	var header_length = components.headers.length
	var cipher_text_length = binary_data.length - header_length - components.hmac.length
	components.cipher_text = binary_data.substr(header_length, cipher_text_length)
	//
	return components
}
function _new_parsed_headers_object(bin_data) 
{
	var offset = 0;

	var version_char = bin_data[0];
	offset += version_char.length;

	validate_schema_version(version_char.charCodeAt());

	var options_char = bin_data[1];
	offset += options_char.length;

	var encryption_salt = bin_data.substr(offset, cryptor_settings.salt_length);
	offset += encryption_salt.length;

	var hmac_salt = bin_data.substr(offset, cryptor_settings.salt_length);
	offset += hmac_salt.length;

	var iv = bin_data.substr(offset, cryptor_settings.iv_length);
	offset += iv.length;

	var parsing_description = 
	{
		version: version_char,
		options: options_char,
		encryption_salt: encryption_salt,
		hmac_salt: hmac_salt,
		iv: iv,
		length: offset
	};

	return parsing_description;
}
function validate_schema_version(version)
{
	if (version !== currentVersionCryptorFormatVersion) {
		var err = "Unsupported schema version " + version
		throw err
	}
}
function _is_hmac_valid__async(
	components, 
	password, 
	fn // (err, isValid?) -> Void
)
{
	_new_calculated_pbkdf2_key__async(
		password, 
		components.headers.hmac_salt,
		function(err, hmac_key) 
		{
			if (err) {
				fn(err)
				return
			}
			var generated_hmac = _new_generated_hmac(components, hmac_key);
			var isValid = (components.hmac === generated_hmac);
			//
			fn(null, isValid)
		}
	)
}
function _new_calculated_pbkdf2_key__async(
	password, 
	salt, 
	fn
)
{ // Apply pseudo-random function HMAC-SHA1 by default
	crypto.pbkdf2(
		password, 
		salt, 
		cryptor_settings.pbkdf2.iterations, 
		cryptor_settings.pbkdf2.key_length,
		'sha1',
		function(err, key)
		{
			fn(err, key)
		}
	)
}
function _new_generated_hmac(components, hmac_key)
{
	var hmac_message = '';
	if (cryptor_settings.hmac.includes_header) {
		hmac_message += components.headers.version;
		hmac_message += components.headers.options;
		hmac_message += components.headers.encryption_salt ? components.headers.encryption_salt.toString('binary') : '';
		hmac_message += components.headers.hmac_salt ? components.headers.hmac_salt.toString('binary') : '';
		hmac_message += components.headers.iv.toString('binary');
	}
	hmac_message += components.cipher_text.toString('binary');
	
	var hmac_itself = crypto.createHmac(cryptor_settings.hmac.algorithm, hmac_key).update(hmac_message).digest('binary');
	
	return hmac_itself;
}
function _new_random_salt() 
{
	return _new_random_iv_of_length(cryptor_settings.salt_length);
}
function _new_random_iv_of_length(block_size) 
{
	try {
		var ivBuffer = crypto.randomBytes(block_size);	
		var ivString = ivBuffer.toString('binary', 0, block_size);

		return ivString;
	} catch (ex) {
		// TODO: handle error (this should be getting caught in consumer anyway)
		// most likely, entropy sources are drained
		throw ex
	}
}