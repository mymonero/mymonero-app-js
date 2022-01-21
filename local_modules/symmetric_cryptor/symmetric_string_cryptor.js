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
	algorithm: 'aes-256-cbc',
	options: 1, // this gets inserted into the format. should probably be renamed to something more concretely descriptive
	salt_length: 8,
	iv_length: 16,
	pbkdf2: 
	{
		iterations: 10000,
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
// Encryption
function New_EncryptedBase64String__Async(plaintext_msg, password) {
	return new Promise( (res, rej) => {
		if (typeof plaintext_msg === 'undefined') {
			rej(undefined)
		}
		if (plaintext_msg == null) {
			rej(null)
		}
		Buffer.isBuffer(plaintext_msg) || (plaintext_msg = new Buffer.from(plaintext_msg, 'utf8')) // we're expecting a string, but might as well check anyway
		Buffer.isBuffer(password) || (password = new Buffer.from(password, 'utf8')) // we're expecting a string, but might as well check anyway
		//
		const components = 
		{
			headers: 
			{
				version: new Buffer.from(String.fromCharCode(currentVersionCryptorFormatVersion)),
				options: new Buffer.from(String.fromCharCode(cryptor_settings.options))
			}
		}
		components.headers.encryption_salt = _new_random_salt()
		components.headers.hmac_salt = _new_random_salt()
		components.headers.iv = _new_random_iv_of_length(cryptor_settings.iv_length)
		//
		// TODO: maybe do the key gen here in parallel
		_new_calculated_pbkdf2_key__async(password, components.headers.encryption_salt, function(err, encryption_key)
			{
				if (err) {
					rej(err)
				}
				_new_calculated_pbkdf2_key__async(password, components.headers.hmac_salt, function(err, hmac_key)
					{
						if (err) {
							rej(err)
						}
						var iv = components.headers.iv
						if (Buffer.isBuffer(iv) == false) {
							throw "Expected Buffer.isBuffer(iv)";
						}
						if (Buffer.isBuffer(encryption_key) == false) {
							throw "Expected Buffer.isBuffer(encryption_key)";
						}
						if (cryptor_settings.iv_length !== components.headers.iv.length) {
							throw "Expected cryptor_settings.iv_length == components.headers.iv.length";
						}
						const cipher = crypto.createCipheriv(cryptor_settings.algorithm, encryption_key, iv);
						// pkcs padding is done automatically; see cipher.setAutoPadding
						components.cipher_text = Buffer.concat([
							cipher.update(plaintext_msg), 
							cipher.final()
						]);
						var data = Buffer.concat([
							components.headers.version,
							components.headers.options,
							components.headers.encryption_salt || new Buffer.from(''),
							components.headers.hmac_salt || new Buffer.from(''),
							components.headers.iv,
							components.cipher_text
						]);
						const hmac = _new_generated_hmac(components, hmac_key);
						const encryptedMessage_base64String = Buffer.concat([data, hmac]).toString('base64');
						//
						res(encryptedMessage_base64String)
					}
				)
			}
		)
	});
}
module.exports.New_EncryptedBase64String__Async = New_EncryptedBase64String__Async;
//
// Decryption
function New_DecryptedString__Async(encrypted_msg_base64_string, password) {
	return new Promise( (res, rej) => {
		Buffer.isBuffer(password) || (password = new Buffer.from(password, 'utf8'));

		if (!encrypted_msg_base64_string || typeof encrypted_msg_base64_string === 'undefined') {
			console.warn("New_DecryptedString__Async was passed nil encrypted_msg_base64_string")
			res(encrypted_msg_base64_string)
		}
		var unpacked_base64_components = _new_encrypted_base64_unpacked_components_object(encrypted_msg_base64_string)
		isHMACValidAsync(unpacked_base64_components, password).then( (isValid) => {
			if (isValid === false) {
				const err = new Error("HMAC is not valid.")
				rej(err)		
			}
			pbkdf2Async(password, unpacked_base64_components.headers.encryption_salt)
			.then((cipherKey_binaryBuffer) => {
				const deCipher = crypto.createDecipheriv(
					cryptor_settings.algorithm, 
					cipherKey_binaryBuffer, 
					unpacked_base64_components.headers.iv
				);
				// pkcs unpadding is done automatically; see cipher.setAutoPadding
				const unpadded_decrypted_buffer = Buffer.concat([
					deCipher.update(unpacked_base64_components.cipher_text), 
					deCipher.final()
				]);
				const decrypted_string = unpadded_decrypted_buffer.toString('utf8')
				//
				res(decrypted_string)
			})
			.catch((err) => {
				rej(err)
			})
		}).catch( (err) => {
			rej(err)
		})
	});
}
module.exports.New_DecryptedString__Async = New_DecryptedString__Async;

// Shared
function _new_encrypted_base64_unpacked_components_object(b64str) 
{
	if (!b64str || typeof b64str === 'undefined') { // prevent toString() exception
		throw "_new_encrypted_base64_unpacked_components_object was passed nil b64str"
		// return undefined
	}
	var data = new Buffer.from(b64str, 'base64')
	var components = 
	{
		headers: _new_parsed_headers_object(data),
		hmac: data.slice(data.length -cryptor_settings.hmac.length)
	}
	var header_length = components.headers.length
	var cipher_text_length = data.length - header_length - components.hmac.length
	components.cipher_text = data.slice(header_length, header_length + cipher_text_length) 
	//
	return components
}
function _new_parsed_headers_object(buffer_data) 
{
	var offset = 0;

	var version_char = buffer_data.slice(offset, offset + 1);
	offset += version_char.length;

	validate_schema_version(version_char.toString('binary').charCodeAt());

	var options_char = buffer_data.slice(offset, offset + 1);
	offset += options_char.length;

	var encryption_salt = buffer_data.slice(offset, offset + cryptor_settings.salt_length);
	offset += encryption_salt.length;

	var hmac_salt = buffer_data.slice(offset, offset + cryptor_settings.salt_length);
	offset += hmac_salt.length;

	var iv = buffer_data.slice(offset, offset + cryptor_settings.iv_length);
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
) {
	_new_calculated_pbkdf2_key__async(
		password, 
		components.headers.hmac_salt,
		function(err, hmac_key) 
		{
			if (err) {
				fn(err)
				return
			}
			var generated_hmac_buffer = _new_generated_hmac(components, hmac_key);
			// For 0.11+ we can use Buffer.compare
			const isValid = components.hmac.toString('hex') == generated_hmac_buffer.toString('hex');
			//
			fn(null, isValid)
		}
	)
}

function _new_calculated_pbkdf2_key__async(password, salt, fn) { // Apply pseudo-random function HMAC-SHA1 by default
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

function pbkdf2Async(password, salt) { // Apply pseudo-random function HMAC-SHA1 by default
	return new Promise( (res, rej) => {
		crypto.pbkdf2(password, salt, cryptor_settings.pbkdf2.iterations, cryptor_settings.pbkdf2.key_length, 'sha1', (err, key) => {
				err ? rej(err) : res(key)
		})
	});
}

function isHMACValidAsync(components, password) {
	return new Promise( (res, rej) => {
		pbkdf2Async(password, components.headers.hmac_salt)
		.then( (hmac_key) => {
			var generated_hmac_buffer = _new_generated_hmac(components, hmac_key);
			// For 0.11+ we can use Buffer.compare
			const isValid = components.hmac.toString('hex') == generated_hmac_buffer.toString('hex');
			
			res(isValid)
		})
		.catch( (err) => {
			rej(err)
		})
	});
}

var _new_generated_hmac = function(
	components, 
	hmac_key
) {
	var hmac_message = new Buffer.from('');
	if (cryptor_settings.hmac.includes_header) {
		hmac_message = Buffer.concat([
			hmac_message,
			components.headers.version,
			components.headers.options,
			components.headers.encryption_salt || new Buffer.from(''),
			components.headers.hmac_salt || new Buffer.from(''),
			components.headers.iv
		]);
	}
	hmac_message = Buffer.concat([hmac_message, components.cipher_text]);
	return crypto.createHmac(
		cryptor_settings.hmac.algorithm, 
		hmac_key
	).update(
		hmac_message
	).digest();
}
function _new_random_salt() 
{
	return _new_random_iv_of_length(cryptor_settings.salt_length);
}
function _new_random_iv_of_length(block_size) 
{
	try {
		var raw_ivBuffer = crypto.randomBytes(block_size);	
		var final_ivBuffer = raw_ivBuffer.slice(0, block_size); // not sure if this slice is actually necessary with the randomBytes call

		return final_ivBuffer;
	} catch (ex) {
		// TODO: handle error (this should be getting caught in consumer anyway)
		// most likely, entropy sources are drained
		throw ex
	}
}