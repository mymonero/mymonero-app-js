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
const ListBaseController = require('../../Lists/Controllers/ListBaseController')
//
const FundsRequest = require('../Models/FundsRequest')
const fundsRequest_persistence_utils = require('../Models/fundsRequest_persistence_utils')
//
class FundsRequestsListController extends ListBaseController
{
	constructor(options, context)
	{
		super(options, context)
	}
	//
	//
	// Overrides
	//
	override_CollectionName()
	{
		return fundsRequest_persistence_utils.CollectionName
	}
	override_lookup_RecordClass()
	{
		return FundsRequest
	}
	override_booting_reconstituteRecordInstanceOptionsWithBase(
		optionsBase, // _id is already supplied in this
		persistencePassword,
		forOverrider_instance_didBoot_fn,
		forOverrider_instance_didFailBoot_fn
	)
	{
		const self = this
		optionsBase.persistencePassword = persistencePassword
		//
		// now supply actual callbacks
		optionsBase.failedToInitialize_cb = function(err, returnedInstance)
		{
			console.error("Failed to initialize funds request ", err, returnedInstance)
			// we're not going to pass this err through though because it will prevent booting... we mark the instance as 'errored'
			forOverrider_instance_didBoot_fn(err, returnedInstance)
		}
		optionsBase.successfullyInitialized_cb = function(returnedInstance)
		{
			forOverrider_instance_didBoot_fn(null, returnedInstance) // no err
		}
	}
	overridable_sortRecords(fn) // () -> Void; we must call this!
	{
		const self = this
		// do not call on `super` of fn could be called redundantly
		self.records = self.records.sort(
			function(a, b)
			{
				return b.dateCreated - a.dateCreated
			}
		)
		fn() // ListBaseController overriders must call this!
	}
	//
	//
	// Booted - Imperatives - Public - List management
	//
	WhenBooted_AddFundsRequest(
		optl__from_fullname,
		optl__to_walletHexColorString,
		to_address,
		payment_id,
		amount_StringOrNil,
		amountCcySymbol,
		message,
		description,
		fn // fn: (err: Error?, instance: FundsRequest?) -> Void
	)
	{
		const self = this
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
							from_fullname: optl__from_fullname || "",
							to_walletHexColorString: optl__to_walletHexColorString || "",
							to_address: to_address,
							payment_id: payment_id,
							amount_StringOrNil: amount_StringOrNil,
							amountCcySymbol: amountCcySymbol,
							message: message,
							description: description
						}
						options.failedToInitialize_cb = function(err, returnedInstance)
						{
							console.error("Failed to initialize funds request ", err, returnedInstance)
							// we're not going to pass this err through though because it will prevent booting... we mark the instance as 'errored'
							fn(err)
						}
						options.successfullyInitialized_cb = function(returnedInstance)
						{
							self._atRuntime__record_wasSuccessfullySetUpAfterBeingAdded(returnedInstance)
							fn(null, returnedInstance)
						}
						const instance = new FundsRequest(options, self.context)
					}
				)
			}
		)
	}
}
module.exports = FundsRequestsListController
