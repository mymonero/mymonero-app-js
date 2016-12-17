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
const EventEmitter = require('events')
//
const Contact = require('../Models/Contact')
const contact_persistence_utils = require('../Models/contact_persistence_utils')
//
class ContactsListController extends EventEmitter
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
		const context = self.context
		if (typeof context.persister === 'undefined') { // self should only be after persister in the context module load list
			throw "context.persister undefined in ContactsListController setup()"
		}
		//
		function _didBoot()
		{
			self.hasBooted = true // nothing to do to boot
			setTimeout(function()
			{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
				self.emit(self.EventName_booted())
			})
		}
		//
		// reconstitute existing contacts
		self._new_idsOfPersisted_contacts(
			function(err, ids)
			{
				if (err) {
					console.error("Error fetching list of saved contacts: " + err.toString())
					setTimeout(function()
					{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
						self.emit(self.EventName_errorWhileBooting(), err)
					})
					return
				}
				__proceedTo_load_contactsWithIds(ids)
			}
		)
		function __proceedTo_load_contactsWithIds(ids)
		{
			self.contacts = []
			//
			if (ids.length === 0) { // then don't cause the pw to be requested yet
				_didBoot()
				return
			}
			self.context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
				function(obtainedPasswordString, userSelectedTypeOfPassword)
				{
					__proceedTo_loadAndBootAllExtantWalletsWithPassword(ids, obtainedPasswordString)
				}
			)
		}
		function __proceedTo_loadAndBootAllExtantWalletsWithPassword(ids, persistencePassword)
		{
			// TODO: optimize by parallelizing and sorting after
			async.eachSeries(
				ids,
				function(_id, cb)
				{
					const options =
					{
						_id: _id,
						persistencePassword: persistencePassword
					}
					const instance = new Contact(options, context)
					instance.on(instance.EventName_booted(), function()
					{
						// we are going to take responsibility to manually add contact and emit event below when all done
						self.contacts.push(instance)
						cb()
					})
					instance.on(instance.EventName_errorWhileBooting(), function(err)
					{
						console.error("Failed to read contact ", err)
						//
						// we're not going to pass this err through though because it will prevent booting... we'll mark the instance as 'errored'
						self.contacts.push(instance)
						cb() 
					})
				},
				function(err)
				{
					if (err) {
						console.error("Error while loading saved contacts: " + err.toString())
						setTimeout(function()
						{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
							self.emit(self.EventName_errorWhileBooting(), err)
						})
						return
					}
					//
					_didBoot()
					//
					setTimeout(function()
					{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when this was called
						self.__listUpdated_contacts() // emit after booting so this becomes an at-runtime emission
					})
				}
			)
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
	// Booted - Accessors - Public

	WhenBooted_Contacts(fn)
	{
		const self = this
		self.ExecuteWhenBooted(
			function()
			{
				fn(self.contacts)
			}
		)
	}
	//
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
	// Booted - Imperatives - Public - List management

	WhenBooted_AddContact(
		fullname,
		address__XMR,
		fn // fn: (err: Error?, instance: Contact?) -> Void
	)
	{
		const self = this
		const context = self.context
		self.ExecuteWhenBooted(
			function()
			{
				self.context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
					function(obtainedPasswordString, userSelectedTypeOfPassword)
					{
						const options =
						{
							persistencePassword: obtainedPasswordString,
							//
							fullname: fullname,
							address__XMR: address__XMR,
						}
						const instance = new Contact(options, context)
						instance.on(instance.EventName_booted(), function()
						{
							self._atRuntime_contact_wasSuccessfullySetUp(instance)
							fn(null, instance)
						})
						instance.on(instance.EventName_errorWhileBooting(), function(err)
						{
							fn(err)
						})
					}
				)
			}
		)
	}
	WhenBooted_DeleteContactWithId(
		_id,
		fn // fn: (err: Error?) -> Void
	)
	{
		const self = this
		const contacts_length = self.contacts.length
		self.ExecuteWhenBooted(
			function()
			{
				var indexOfContact = null;
				var contactToDelete = null;
				console.log("_id" , _id)
				for (let i = 0 ; i < contacts_length ; i++) {
					const contact = self.contacts[i]
					if (contact._id === _id) {
						indexOfContact = i
						contactToDelete = contact
						break
					}
				}
				if (indexOfContact === null || contactToDelete === null) {
					fn(new Error("Contact not found"))
					return
				}
				//
				self.contacts.splice(indexOfContact, 1) // pre-emptively remove the contact from the list
				self.__listUpdated_contacts() // ensure delegate notified
				//
				contactToDelete.Delete(
					function(err)
					{
						if (err) {
							self.contacts.splice(indexOfContact, 0, contactToDelete) // revert deletion
							self.__listUpdated_contacts() // ensure delegate notified
							fn(err)
							return
						}
						contactToDelete = null // free
						fn()
					}
				)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private

	_new_idsOfPersisted_contacts(
		fn // (err?, ids?) -> Void
	)
	{
		const self = this
		self.context.persister.DocumentsWithQuery(
			contact_persistence_utils.CollectionName,
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

	_atRuntime_contact_wasSuccessfullySetUp(instance)
	{
		const self = this
		self.contacts.push(instance)
		self.__listUpdated_contacts() // ensure delegate notified
	}

	__listUpdated_contacts()
	{
		const self = this
		self.emit(self.EventName_listUpdated())
	}

}
module.exports = ContactsListController
