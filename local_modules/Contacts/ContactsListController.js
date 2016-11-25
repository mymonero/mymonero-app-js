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
const Contact = require('./Contact')
const contact_persistence_utils = require('./contact_persistence_utils')
//
class ContactsListController
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
		//
		self.setup()
	}
	setup()
	{
		const self = this
		const context = self.context
		//
		// reconstitute existing contacts
		self._new_idsOfPersisted_contacts(
			function(err, ids)
			{
				if (err) {
					const exStr = "Error fetching list of saved contacts"
					const errStr = exStr + ": " + err.toString()
					console.error(errStr)
					throw exStr
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
				self.hasBooted = true // nothing to do to boot
				return
			}
			self.context.passwordController.WhenBooted_PasswordAndType( // this will block until we have access to the pw
				function(err, obtainedPasswordString, userSelectedTypeOfPassword)
				{
					if (err) {
						throw err
						return
					}
					__proceedTo_loadAndBootAllExtantWalletsWithPassword(ids, obtainedPasswordString)
				}
			)
		}
		function __proceedTo_loadAndBootAllExtantWalletsWithPassword(ids, persistencePassword)
		{
			async.eachSeries(
				ids,
				function(_id, cb)
				{
					var instance;
					const options =
					{
						_id: _id,
						persistencePassword: persistencePassword,
					}
					try {
						instance = new Contact(options, context)
					} catch (e) {
						console.error("Failed to read contact ", err)
						cb(e)
						return
					}
					self._contact_wasSuccessfullySetUp(instance)
					cb()
				},
				function(err)
				{
					if (err) {
						const exStr = "Error while loading saved contacts"
						const errStr = exStr + ": " + err.toString()
						console.error(errStr)
						throw exStr
						return
					}
					//
					self.hasBooted = true // all done!
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
				self.context.passwordController.WhenBooted_PasswordAndType( // this will block until we have access to the pw
					function(err, obtainedPasswordString, userSelectedTypeOfPassword)
					{
						if (err) {
							fn(err)
							return
						}
						var instance;
						const options =
						{
							persistencePassword: obtainedPasswordString,
							//
							fullname: fullname,
							address__XMR: address__XMR,
							//
							failedSetUp_cb: function(err)
							{
								fn(err)
							},
							successfullySetUp_cb: function()
							{
								self._contact_wasSuccessfullySetUp(instance)
								//
								fn(null)
							}
						}
						instance = new Contact(options, context)
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
					console.error(err.toString)
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

	_contact_wasSuccessfullySetUp(instance)
	{
		const self = this
		self.contacts.push(instance)
		self.__listUpdated_contacts() // ensure delegate notified
	}

	__listUpdated_contacts()
	{
		//
		// todo: fire event/call cb that new contact added to list
	}

}
module.exports = ContactsListController
