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
const tests_config = require('./tests_config.js')
if (typeof tests_config === 'undefined' || tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/Contacts/tests/ in order to run this test.")
	process.exit(1)
	return
}
//
const context = require('./tests_context').NewHydratedContext()
//
var contactsListController; // to initialize…
//
async.series(
	[
		_proceedTo_test_bootController,
		//
		_proceedTo_test_createNewContact
	],
	function(err)
	{
		if (err) {
			console.log("Error while performing tests: ", err)
			process.exit(0)
		} else {
			console.log("✅  Tests completed without error.")
			process.exit(1)
		}
	}
)
//
//
function _proceedTo_test_bootController(fn)
{
	console.log("> _proceedTo_test_bootController")
	//
	const options =
	{
		didInitializeSuccessfully_cb: function()
		{
			console.log("Contacts: ")
			contactsListController.contacts.forEach(
				function(el, idx)
				{ // just logging them out…
					console.log(el.Description())
				}
			)
			//
			fn()
		},
		failedToInitializeSuccessfully_cb: function(err)
		{
			fn(err)			
		}
	}
	const Class = require('../ContactsListController')
	contactsListController = new Class(
		options,
		context
	)
}
function _proceedTo_test_createNewContact(fn)
{
	if (typeof contactsListController === 'undefined' || contactsListController === null) {
		// but techically async ought not to let this test be executed if controller boot failed
		fn(new Error("contactsListController undefined or null"))
		return
	}
	//
	contactsListController.AddContact(
		tests_config.fullname,
		tests_config.address__XMR,
		function(err, instance)
		{
			if (err) {
				fn(err)
			} else {
				console.log("Successfully added new contact", instance)
				fn()
			}
		}
	)
}