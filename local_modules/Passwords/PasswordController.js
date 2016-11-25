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
const symmetric_string_cryptor = require('../symmetric_cryptor/symmetric_string_cryptor')
//
const CollectionName = "PasswordMeta"
const plaintextMessageToSaveForUnlockChallenges = "this is just a string that we'll use for checking whether a given password can unlock an encrypted version of this very message"
const _userSelectedTypesOfPassword =
{
	SixCharPIN: "SixCharPIN",
	FreeformStringPW: "FreeformStringPW"
} // TODO: add hash with human readable labels for each type
//
////////////////////////////////////////////////////////////////////////////////
// Principal class
//
class PasswordController
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.hasBooted = false
		self._password = undefined // it's not been obtained from the user yet - we only store it in memory
		self.obtainPasswordFromUser_wOptlValidationErrMsg_cb = self.options.obtainPasswordFromUser_wOptlValidationErrMsg_cb
		// obtainPasswordFromUser_wOptlValidationErrMsg_cb: (controller, obtainedErrOrPwAndType_cb, showingValidationErrMsg_orUndefined) -> Void
		//	obtainedErrOrPwAndType_cb: (err?, obtainedPasswordString?, userSelectedTypeOfPassword: AvailableUserSelectableTypesOfPassword?) -> Void // you can send an err to say the user cancelled pw entry. this controller doesn't do anything to the pw if there's an err and if the pw isn't changed, the didChange callback(s) are not notified/called
		if (typeof self.obtainPasswordFromUser_wOptlValidationErrMsg_cb === 'undefined' || self.obtainPasswordFromUser_wOptlValidationErrMsg_cb === null) {
			const errStr = "You must supply a obtainPasswordFromUser_wOptlValidationErrMsg_cb function in the options of PasswordController. See type definition comment in constructor() of PasswordController"
			console.error(errStr)
			throw errStr
			return
		}
		self.didSetFirstPasswordDuringThisRuntime_cb = self.options.didSetFirstPasswordDuringThisRuntime_cb || function(controller, password) {}
		self.didChangePassword_cb = self.options.didChangePassword_cb || function(controller, password) {}
		//
		self.setupAndBoot()
	}
	setupAndBoot()
	{ // we can afford to do this w/o any callback saying "success" because we defer execution of
	  // things which would rely on boot-time info till we've booted
		const self = this
		//
		// first, check if any password model has been stored
		self.context.persister.DocumentsWithQuery(
			CollectionName,
			{}, // all objects - tho we're expecting 0 or 1
			{}, // opts
			function(err, docs)
			{
				if (err) {
					console.error("Error while fetching existing", CollectionName, err)
					throw err
					return
				}
				const docs_length = docs.length
				if (docs_length === 0) { //
					const mocked_doc =
					{
						userSelectedTypeOfPassword: self.AvailableUserSelectableTypesOfPassword().SixCharPIN // default
					}
					_proceedTo_loadStateFromModel(
						false, // never entered pw before
						mocked_doc
					)
					return
				}
				if (docs_length > 1) {
					const errStr = "Error while fetching existing " + CollectionName + "... more than one PasswordModel found. Selecting first."
					console.error(errStr)
					// this is indicative of a code fault
				}
				const doc = docs[0]
				console.log("💬  Found existing saved password model with _id", doc._id)
				_proceedTo_loadStateFromModel(
					true,
					doc
				)
			}
		)
		function _proceedTo_loadStateFromModel(
			hasUserEverEnteredPassword,
			passwordModel_doc
		)
		{
			self.hasUserEverEnteredPassword = hasUserEverEnteredPassword
			//
			self._id = passwordModel_doc._id || undefined
			self.userSelectedTypeOfPassword = passwordModel_doc.userSelectedTypeOfPassword
			self.encryptedMessageForUnlockChallenge = passwordModel_doc.encryptedMessageForUnlockChallenge
			if (self._id !== null && typeof self._id !== 'undefined') { // existing doc
				if (typeof self.encryptedMessageForUnlockChallenge === 'undefined' || !self.encryptedMessageForUnlockChallenge) { // but it was saved w/o an encrypted challenge str
					const errStr = "Found undefined encrypted msg for unlock challenge in saved password model document" // TODO: not sure how to handle this case. delete all local info? would suck
					console.error(errStr)
					throw errStr
					return
				}
			}
			//
			self.hasBooted = true // all done!
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public

	AvailableUserSelectableTypesOfPassword()
	{
		return _userSelectedTypesOfPassword
	}
	HasUserEnteredPasswordYet()
	{
		const self = this
		if (typeof self._password === 'undefined' || self._password === null || self._password === "") {
			return false
		} else {
			return true
		}
	}
	WhenBooted_PasswordAndType(obtainedErrOrPwAndType_cb) // obtainedErrOrPwAndType_cb: (err?, obtainedPasswordString?, userSelectedTypeOfPassword?) -> Void
	{ // this function is asynchronous because it needs the option of requesting the PW from the user (it's basically a lazy accessor)
		const self = this
		self._executeWhenBooted(function()
		{
			if (self.HasUserEnteredPasswordYet() === false) {
				self._obtainNewPasswordFromUser(obtainedErrOrPwAndType_cb)
				return
			}
			obtainedErrOrPwAndType_cb(null, self._password, self.userSelectedTypeOfPassword)
		})
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Imperatives - Public

	InitiateChangePassword(
		getUserToEnterExistingPassword_cb,
		// ^-- (userSelectedTypeOfPassword, errOrUserEnteredExistingPW_cb) -> Void
		// ^-- supply this and have the user enter their existing PIN/PW so we can check
		// <- there's no need to supply a function here for getting the user to enter their pw
		obtainedErrOrPwAndType_cb // (err?, obtainedPasswordString?, userSelectedTypeOfPassword?) -> Void
	)
	{
		const self = this
		self._executeWhenBooted(function()
		{
			if (self.HasUserEnteredPasswordYet() === false) {
				const errStr = "InitiateChangePassword called but HasUserEnteredPasswordYet === false. This should be disallowed in the UI"
				throw errStr
				return
			}
			getUserToEnterExistingPassword_cb(
				self.userSelectedTypeOfPassword,
				function(err, userEnteredPassword)
				{
					if (err) {
						console.error("Failed to verify existing password for password change")
						obtainedErrOrPwAndType_cb(err)
						return
					}
					// we're relying on having checked above that user has entered a valid pw already
					if (typeof self._id !== 'undefined' || self._id !== null) { // if the user is unlocking an already pw-protected app
						// we need to check whether the password the user entered is actually the correct password to unlock the app
						if (typeof self.encryptedMessageForUnlockChallenge === 'undefined' && !self.encryptedMessageForUnlockChallenge) {
							const errStr = "Code fault: Existing document but no encryptedMessageForUnlockChallenge"
							console.error(errStr)
							throw errStr
							fn(new Error(errStr)) // this won't really get called - just including for completeness
							return
						}
						//
						var decryptedMessageForUnlockChallenge;
						try {
							decryptedMessageForUnlockChallenge = symmetric_string_cryptor.DecryptedPlaintextString(
								self.encryptedMessageForUnlockChallenge,
								userEnteredPassword
							)
						} catch (e) {
							const errStr = "Unable to unlock data with that password" // incorrect password, basically
							console.error(errStr, "e", e)
							const err = new Error(errStr)
							obtainedErrOrPwAndType_cb(err)
							return
						}
						if (decryptedMessageForUnlockChallenge !== plaintextMessageToSaveForUnlockChallenges) {
							const errStr = "Incorrect password"
							const err = new Error(errStr)
							obtainedErrOrPwAndType_cb(err)
							return
						}
					}
					//
					// passwords match or no match check necessary and we can proceed
					self._obtainNewPasswordFromUser(obtainedErrOrPwAndType_cb)
				}
			)
		})
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Imperatives - Private - Deferring until booted

	_executeWhenBooted(fn)
	{
		const self = this
		if (self.hasBooted === false) {
			// console.log("Deferring execution of function until booted.")
			setTimeout(function()
			{
				self._executeWhenBooted(fn)
			}, 50) // ms
			return
		}
		fn() // ready to execute
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Imperatives - Private - Setting/changing Password

	_obtainNewPasswordFromUser(obtainedErrOrPwAndType_cb) // obtainedErrOrPwAndType_cb: (err?, obtainedPasswordString?, userSelectedTypeOfPassword?) -> Void
	{
		const self = this
		if (self.hasBooted === false) {
			const errStr = "Code fault: _obtainNewPasswordFromUser called when hasBooted=false"
			console.error(errStr)
			throw errStr
			return
		}
		const initialValidationErrorMessage = undefined // initially, no validation err msg
		self.__obtainNewPasswordFromUser_wOptlValidationErrMsg(
			obtainedErrOrPwAndType_cb,
			initialValidationErrorMessage
		)
	}
	__obtainNewPasswordFromUser_wOptlValidationErrMsg(
		obtainedErrOrPwAndType_cb,
		showingValidationErrMsg_orUndefined
	)
	{
		const self = this
		const wasFirstSetOfPasswordAtRuntime = self.HasUserEnteredPasswordYet() === false // it's ok if we derive this here instead of in _obtainNewPasswordFromUser because this fn will only be called, if setting the pw for the first time, if we have not yet accepted a valid PW yet
		self.obtainPasswordFromUser_wOptlValidationErrMsg_cb(
			self,
			function(err, obtainedPasswordString, userSelectedTypeOfPassword)
			{
				if (err) {
					obtainedErrOrPwAndType_cb(err)
					return
				}
				// I. Validate features of pw before trying and accepting
				if (userSelectedTypeOfPassword === self.AvailableUserSelectableTypesOfPassword().SixCharPIN) {
					if (obtainedPasswordString.length != 6) { // this is too short. get back to them with a validation err by re-entering obtainPasswordFromUser_cb
						self.__obtainNewPasswordFromUser_wOptlValidationErrMsg(
							obtainedErrOrPwAndType_cb, // passing the same obtainedErrOrPwAndType_cb
							"Invalid PIN length" // but also passing this
						)
						return // bail as we are re-entering
					}
					// TODO: check if all numbers
					// TODO: check that numbers are not all just one number
				} else if (userSelectedTypeOfPassword === self.AvailableUserSelectableTypesOfPassword().FreeformStringPW) {
					if (obtainedPasswordString.length < 6) { // this is too short. get back to them with a validation err by re-entering obtainPasswordFromUser_cb
						self.__obtainNewPasswordFromUser_wOptlValidationErrMsg(
							obtainedErrOrPwAndType_cb, // passing the same obtainedErrOrPwAndType_cb
							"Password too short" // but also passing this
						)
						return // bail as we are re-entering
					}
					// TODO: check if password content too weak?
				} else {
					const errStr = "Code fault or cracking attempt: Unrecognized userSelectedTypeOfPassword"
					console.error(errStr)
					throw errStr
					fn(new Error(errStr)) // this won't really get called - just including for completeness
					return
				}
				console.log("💬  Obtained " + userSelectedTypeOfPassword + " '" + obtainedPasswordString + "'")
				// II. hang onto new pw, pw type, and state(s)
				self._password = obtainedPasswordString
				self.userSelectedTypeOfPassword = userSelectedTypeOfPassword
				self.hasUserEverEnteredPassword = true // we can now flip this to true
				//
				// III. finally, save doc so we know a pw has been entered once before
				self.saveToDisk(
					function(err)
					{
						if (err) {
							self._password = undefined // they'll have to try again
							obtainedErrOrPwAndType_cb(err)
							return
						}
						// broadcast on next tick but before yield
						setTimeout(function()
						{
							if (wasFirstSetOfPasswordAtRuntime === true) {
								self.didSetFirstPasswordDuringThisRuntime_cb(self, self._password, self.userSelectedTypeOfPassword)
							} else {
								self.didChangePassword_cb(self, self._password, self.userSelectedTypeOfPassword)
							}
							//
							// yield
							obtainedErrOrPwAndType_cb(null, obtainedPasswordString, userSelectedTypeOfPassword)
						})
					}
				)

			},
			showingValidationErrMsg_orUndefined // we pass this back to the UI/consumer so they can show it if they need to, like on a pw was too short
		)
	}



	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Imperatives - Private - Persistence

	saveToDisk(fn)
	{
		const self = this
		console.log("📝  Saving password model to disk.")
		//
		if (self._password === null || typeof self._password === 'undefined') {
			const errStr = "Code fault: saveToDisk musn't be called until a password has been set"
			console.error(errStr)
			throw errStr
			fn(new Error(errStr))
			return
		}
		const encryptedMessageForUnlockChallenge = symmetric_string_cryptor.EncryptedBase64String(
			plaintextMessageToSaveForUnlockChallenges,
			self._password
		)
		self.encryptedMessageForUnlockChallenge = encryptedMessageForUnlockChallenge // it's important that we hang onto this in memory so we can access it if we need to change the password later
		const persistableDocument =
		{
			userSelectedTypeOfPassword: self.userSelectedTypeOfPassword,
			encryptedMessageForUnlockChallenge: self.encryptedMessageForUnlockChallenge
		}
		// console.log("modelObject" , modelObject)
		// insert & update fn declarations for imminent usage…
		function _proceedTo_insertNewDocument()
		{
			self.context.persister.InsertDocument(
				CollectionName,
				persistableDocument,
				function(
					err,
					newDocument
				)
				{
					if (err) {
						console.error("Error while saving password model:", err)
						fn(err)
						return
					}
					if (newDocument._id === null) { // not that this would happen…
						fn(new Error("Inserted password model but _id after saving was null"))
						return // bail
					}
					self._id = newDocument._id // so we have it in runtime memory now…
					console.log("✅  Saved newly inserted password model with _id " + self._id + ".")
					fn()
				}
			)
		}
		function _proceedTo_updateExistingDocument()
		{
			var query =
			{
				_id: self._id // we want to update the existing one
			}
			var update = persistableDocument
			var options =
			{
				multi: false,
				upsert: false, // we are only using .update because we know the document exists
				returnUpdatedDocs: true
			}
			self.context.persister.UpdateDocuments(
				CollectionName,
				query,
				update,
				options,
				function(
					err,
					numAffected,
					affectedDocuments,
					upsert
				)
				{

					if (err) {
						console.error("Error while saving password model:", err)
						fn(err)
						return
					}
					var affectedDocument
					if (Array.isArray(affectedDocuments)) {
						affectedDocument = affectedDocuments[0]
					} else {
						affectedDocument = affectedDocuments
					}
					if (affectedDocument._id === null) { // not that this would happen…
						fn(new Error("Updated password model but _id after saving was null"))
						return // bail
					}
					if (affectedDocument._id !== self._id) {
						fn(new Error("Updated password model but _id after saving was not equal to non-null _id before saving"))
						return // bail
					}
					if (numAffected === 0) {
						fn(new Error("Number of documents affected by _id'd update was 0"))
						return // bail
					}
					console.log("✅  Saved update to password model with _id " + self._id + ".")
					fn()
				}
			)
		}
		//
		if (self._id === null || typeof self._id === 'undefined') {
			_proceedTo_insertNewDocument()
		} else {
			_proceedTo_updateExistingDocument()
		}
	}
}
module.exports = PasswordController
