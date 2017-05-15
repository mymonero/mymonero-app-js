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
const async = require('async')
const EventEmitter = require('events')
const CollectionName = "Settings"
//
const k_default_appTimeoutAfterS = 3 * 60 // 3 minutes
const k_defaults_record = 
{
	serverURL: "",
	appTimeoutAfterS: k_default_appTimeoutAfterS,
	notifyMeWhen: {},
	syncWithServer: {}
}
//
class SettingsController extends EventEmitter
{
	constructor(options, context)
	{
		super()
		// ^--- have to call super before can access `this`
		//
		const self = this
		self.options = options
		self.context = context
		//
		self.hasBooted = false
		self.password = undefined // it's not been obtained from the user yet - we only store it in memory
		//
		self.context.passwordController.AddRegistrantForDeleteEverything(self)
		//
		self._tryToBoot()
	}
	_tryToBoot()
	{	// we can afford to do this w/o any callback saying "success" because we defer execution of
		// things which would rely on boot-time info till we've booted
		const self = this
		//
		// first, check if any password model has been stored
		self.context.persister.AllDocuments(
			CollectionName,
			function(err, docs)
			{
				if (err) {
					console.error("Error while fetching existing", CollectionName, err)
					throw err
				}
				const docs_length = docs.length
				if (docs_length === 0) { //
					const mocked_doc = JSON.parse(JSON.stringify(k_defaults_record)) // hamfisted copy
					_proceedTo_loadStateFromRecord(mocked_doc)
					return
				}
				if (docs_length > 1) {
					const errStr = "Error while fetching existing " + CollectionName + "... more than one record found. Selecting first."
					console.error(errStr)
					// this is indicative of a code fault
				}
				const doc = docs[0]
				// console.log("💬  Found existing saved " + CollectionName + " with _id", doc._id)
				_proceedTo_loadStateFromRecord(doc)
			}
		)
		function _proceedTo_loadStateFromRecord(record_doc)
		{
			self._id = record_doc._id || undefined
			//
			self.serverURL = record_doc.serverURL
			self.appTimeoutAfterS = record_doc.appTimeoutAfterS
			self.notifyMeWhen = record_doc.notifyMeWhen
			self.syncWithServer = record_doc.syncWithServer
			//
			self.hasBooted = true // all done!
		}
	}
	//
	//
	// Runtime - Accessors
	//
	EventName_settingsChanged_serverURL()
	{
		return "EventName_settingsChanged_serverURL"
	}
	EventName_settingsChanged_appTimeoutAfterS()
	{
		return "EventName_settingsChanged_appTimeoutAfterS"
	}
	EventName_settingsChanged_notifyMeWhen()
	{
		return "EventName_settingsChanged_notifyMeWhen"
	}
	EventName_settingsChanged_syncWithServer()
	{
		return "EventName_settingsChanged_syncWithServer"
	}
	//
	AppTimeoutNeverValue()
	{
		return -1
	}
	//
	//
	// Runtime - Imperatives - Settings Values
	//
	Set_settings_valuesByKey(
		valuesByKey,
		fn // (err?) -> Void
	)
	{
		const self = this
		self._executeWhenBooted(
			function()
			{
				const valueKeys = Object.keys(valuesByKey)
				var didUpdate_serverURL = false
				var didUpdate_appTimeoutAfterS = false
				var didUpdate_notifyMeWhen = false
				var didUpdate_syncWithServer = false
				for (let valueKey of valueKeys) {
					const value = valuesByKey[valueKey]
					{ // validate / mark as updated for yield later
						if (valueKey === "serverURL") {
							didUpdate_serverURL = true
						} else if (valueKey === "appTimeoutAfterS") {
							didUpdate_appTimeoutAfterS = true
						} else if (valueKey === "notifyMeWhen") {
							didUpdate_notifyMeWhen = true
						} else if (valueKey === "syncWithServer") {
							didUpdate_syncWithServer = true
						}
					}
					{ // set
						self[valueKey] = value
					}
				}
				self.saveToDisk(
					function(err)
					{
						if (err) {
							console.error("Failed to save new valuesByKey", err)
						} else {
							console.log("📝  Successfully saved " + self.constructor.name + " update ", JSON.stringify(valuesByKey))
							if (didUpdate_serverURL) {
								self.emit(self.EventName_settingsChanged_serverURL(), self.serverURL)
							}
							if (didUpdate_appTimeoutAfterS) {
								self.emit(self.EventName_settingsChanged_appTimeoutAfterS(), self.appTimeoutAfterS)
							}
							if (didUpdate_notifyMeWhen) {
								self.emit(self.EventName_settingsChanged_notifyMeWhen(), self.notifyMeWhen)
							}
							if (didUpdate_syncWithServer) {
								self.emit(self.EventName_settingsChanged_syncWithServer(), self.syncWithServer)
							}
						}
						fn(err)
					}
				)
			}
		)
	}
	//
	//
	// Runtime - Imperatives - Private - Deferring until booted
	//
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
	//
	//
	// Runtime - Imperatives - Private - Persistence
	//
	saveToDisk(fn)
	{
		const self = this
		self._executeWhenBooted(
			function()
			{
				// console.log("📝  Saving " + CollectionName + " to disk.")
				const persistableDocument =
				{
					_id: self._id, // important to set for updates
					serverURL: self.serverURL,
					appTimeoutAfterS: self.appTimeoutAfterS,
					notifyMeWhen: self.notifyMeWhen,
					syncWithServer: self.syncWithServer
				}
				if (self._id === null || typeof self._id === 'undefined') {
					_proceedTo_insertNewDocument(persistableDocument)
				} else {
					_proceedTo_updateExistingDocument(persistableDocument)
				}
				function _proceedTo_insertNewDocument(persistableDocument)
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
								console.error("Error while saving " + CollectionName + ":", err)
								fn(err)
								return
							}
							if (newDocument._id === null) { // not that this would happen…
								fn(new Error("Inserted " + CollectionName + " record but _id after saving was null"))
								return // bail
							}
							self._id = newDocument._id // so we have it in runtime memory now…
							console.log("✅  Saved newly inserted " + CollectionName + " record with _id " + self._id + ".")
							fn()
						}
					)
				}
				function _proceedTo_updateExistingDocument(persistableDocument)
				{
					self.context.persister.UpdateDocumentWithId(
						CollectionName,
						self._id,
						persistableDocument,
						function(err)
						{
							if (err) {
								console.error("Error while saving update to Settings record:", err)
								fn(err)
								return
							}
							console.log("✅  Saved update to Settings record with _id " + self._id + ".")
							fn()
						}
					)
				}
			}
		)
	}
	//
	//
	// Delegation - 
	//
	passwordController_DeleteEverything(fn)
	{
		const self = this
		console.log(self.constructor.name + " passwordController_DeleteEverything")
		// we're not gonna delete the record and reboot - this controller is straightforward enough
		const defaultsValues = JSON.parse(JSON.stringify(k_defaults_record)) // a copy - tho prolly not necessary to do this
		self.Set_settings_valuesByKey(
			defaultsValues,
			function(err)
			{		
				fn(err) // must call back!
			}
		)
	}
}
module.exports = SettingsController