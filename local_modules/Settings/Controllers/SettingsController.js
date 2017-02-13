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
//
const SettingsRecord = require('../Models/SettingsRecord')
const settings_persistence_utils = require('../Models/settings_persistence_utils')
//
class SettingsController extends EventEmitter
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		super() // must call super before we can access `this`
		//
		const self = this
		self.options = options
		self.context = context
		//
		self.hasBooted = false
		//
		self.setup()
	}
	setup()
	{
		const self = this
		self._setup_fetchAndReconstituteExistingRecords()
	}
	_setup_didBoot()
	{ // pre-emptive declaration
		const self = this
		{
			self.hasBooted = true
		}
		{ // start observing (but not redundantly because we call _stopObserving_passwordController if we need to call _setup_didBoot again)
			{ // passwordController
				const controller = self.context.passwordController
				{ // EventName_ChangedPassword
					if (self._passwordController_EventName_ChangedPassword_listenerFn !== null && typeof self._passwordController_EventName_ChangedPassword_listenerFn !== 'undefined') {
						throw "self._passwordController_EventName_ChangedPassword_listenerFn not nil in _setup_didBoot of " + self.constructor.name
					}
					self._passwordController_EventName_ChangedPassword_listenerFn = function()
					{
						self._passwordController_EventName_ChangedPassword()
					}
					controller.on(
						controller.EventName_ChangedPassword(),
						self._passwordController_EventName_ChangedPassword_listenerFn
					)
				}
				{ // EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword
					if (self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn !== null && typeof self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn !== 'undefined') {
						throw "self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn not nil in _setup_didBoot of " + self.constructor.name
					}
					self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn = function()
					{
						self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword()
					}
					controller.on(
						controller.EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword(),
						self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn
					)
				}
				{ // EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword
					if (self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn !== null && typeof self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn !== 'undefined') {
						throw "self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn not nil in _setup_didBoot of " + self.constructor.name
					}
					self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn = function()
					{
						self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword()
					}
					controller.on(
						controller.EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword(),
						self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn
					)
				}
			}
		}
		setTimeout(function()
		{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
			self.emit(self.EventName_booted())
		})
	}
	_setup_fetchAndReconstituteExistingRecords()
	{
		const self = this
		{ // load
			self._new_idsOfPersisted_records(
				function(err, ids)
				{
					if (err) {
						console.error("Error fetching list of saved records: " + err.toString())
						setTimeout(function()
						{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
							self.emit(self.EventName_errorWhileBooting(), err)
						})
						return
					}
					__proceedTo_load_recordsWithIds(ids)
				}
			)
		}
		function __proceedTo_load_recordsWithIds(ids)
		{
			self.records = []
			//
			if (ids.length === 0) { // then don't cause the pw to be requested yet
				self._setup_didBoot()
				return
			}
			self.context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
				function(obtainedPasswordString, userSelectedTypeOfPassword)
				{
					__proceedTo_loadAndBootAllExtantRecordsWithPassword(ids, obtainedPasswordString)
				}
			)
		}
		function __proceedTo_loadAndBootAllExtantRecordsWithPassword(ids, persistencePassword)
		{
	
			async.eachSeries(
				ids,
				function(_id, cb)
				{
					const options =
					{
						_id: _id,
						persistencePassword: persistencePassword
					}
					const instance = new SettingsRecord(options, self.context)
					instance.on(instance.EventName_booted(), function()
					{
						// we are going to take responsibility to manually add record and emit event below when all done
						self.records.push(instance)
						cb()
					})
					instance.on(instance.EventName_errorWhileBooting(), function(err)
					{
						console.error("Failed to read record ", err)
						//
						// we're not going to pass this err through though because it will prevent booting... we'll mark the instance as 'errored'
						self.records.push(instance)
						cb() 
					})
				},
				function(err)
				{
					if (err) {
						console.error("Error while loading saved records: " + err.toString())
						setTimeout(function()
						{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
							self.emit(self.EventName_errorWhileBooting(), err)
						})
						return
					}
					//
					self._setup_didBoot()
					//
					setTimeout(function()
					{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
						self.__listUpdated() // emit after booting so this becomes an at-runtime emission
					})
				}
			)
		}
	}
	//
	//
	// Lifecycle/Runtime - Teardown
	//
	_stopObserving_passwordController()
	{
		const self = this
		const controller = self.context.passwordController
		{ // EventName_ChangedPassword
			if (typeof self._passwordController_EventName_ChangedPassword_listenerFn === 'undefined' || self._passwordController_EventName_ChangedPassword_listenerFn === null) {
				throw "self._passwordController_EventName_ChangedPassword_listenerFn undefined"
			}
			controller.removeListener(
				controller.EventName_ChangedPassword(),
				self._passwordController_EventName_ChangedPassword_listenerFn
			)
			self._passwordController_EventName_ChangedPassword_listenerFn = null
		}
		{ // EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword
			if (typeof self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn === 'undefined' || self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn === null) {
				throw "self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn undefined"
			}
			controller.removeListener(
				controller.EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword(),
				self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn
			)
			self._passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword_listenerFn = null
		}
		{ // EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword
			if (typeof self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn === 'undefined' || self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn === null) {
				throw "self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn undefined"
			}
			controller.removeListener(
				controller.EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword(),
				self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn
			)
			self._passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword_listenerFn = null
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Deferring control til boot

	ExecuteWhenBooted(fn)
	{
		const self = this
		if (self.hasBooted === true) {
			fn()
			return
		}
		setTimeout(
			function()
			{
				self.ExecuteWhenBooted(fn)
			},
			50 // ms
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Public - Runtime - Accessors - Event names

	EventName_booted()
	{
		return "EventName_booted"
	}
	EventName_errorWhileBooting()
	{
		return "EventName_errorWhileBooting"
	}
	EventName_listUpdated()
	{
		return "EventName_listUpdated"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Public - Runtime - State - Accessing settings record

	WhenBooted_SettingsRecord(fn)
	{
		const self = this
		self.ExecuteWhenBooted(
			function()
			{
				if (self.records.length > 0) {
					fn(self.records[0])
				} else {
					fn({})
				}
			}
		)
	}

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private

	_new_idsOfPersisted_records(
		fn // (err?, ids?) -> Void
	)
	{
		const self = this
		self.context.persister.DocumentsWithQuery(
			settings_persistence_utils.CollectionName,
			{}, // blank query - find all
			{},
			function(err, docs)
			{
				if (err) {
					console.error(err.toString())
					fn(err)
					return
				}
				const ids = []
				docs.forEach(function(el, idx)
				{
					ids.push(el._id)
				})
				fn(null, ids)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

	_atRuntime_record_wasSuccessfullySetUp(instance)
	{
		const self = this
		self.records.push(instance)
		self.__listUpdated() // ensure delegate notified
	}
	__listUpdated()
	{
		const self = this
		self.emit(self.EventName_listUpdated())
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime/Boot - Delegation - Private
	
	_passwordController_EventName_ChangedPassword()
	{
		const self = this
		// change all records passwords:
		const toPassword = self.context.passwordController.password // we're just going to directly access it here because getting this event means the passwordController is also saying it's ready
		self.records.forEach(
			function(record, i)
			{
				if (record.didFailToInitialize_flag !== true && record.didFailToBoot_flag !== true) {
					record.ChangePasswordTo(
						toPassword,
						function(err)
						{
							// err is logged in ChangePasswordTo
							// TODO: is there any sensible strategy to handle failures here?
						}
					)
				} else {
					console.warn("This record failed to boot. Not messing with its saved data")
				}
			}
		)
	}
	_passwordController_EventName_userBecameIdle_willDeconstructBootedStateAndClearPassword()
	{
		const self = this
		self.records.forEach(
			function(instance, i)
			{
				instance.TearDown()
			}
		)
		self.records = []
		self.hasBooted = false
	}
	_passwordController_EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword()
	{
		const self = this
		{ // now that we're gotten the final notification in the password reset process we can stop observing w/o missing the "did" event
			self._stopObserving_passwordController() // this prevents duplicative observation when we boot up again - as well as illegal stuff like trying to change the pw when not booted
		}
		{ // this will re-request the pw and lead to loading records & booting self 
			self._setup_fetchAndReconstituteExistingRecords()
		}
		{ // and then at the end we're going to emit so that the UI updates to empty list after the pw entry screen is shown
			self.__listUpdated()
		}
	}
}
module.exports = SettingsController