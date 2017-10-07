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
const SendFundsView_Base = require('./SendFundsView_Base.web')
const commonComponents_contactPicker = require('../../MMAppUICommonComponents/contactPicker.web')
//
class SendFundsView extends SendFundsView_Base
{
	constructor(options, context)
	{
		super(options, context)
	}
	//
	// Overrides - Setup - Imperatives

	//
	startObserving()
	{
		const self = this
		super.startObserving() // must call
		{ // urlOpeningController
			const controller = self.context.urlOpeningController
			controller.on(
				controller.EventName_ReceivedURLToOpen_FundsRequest(),
				function(url)
				{
					self.DismissModalViewsToView( // dismissing these b/c of checks in __shared_isAllowedToPerformDropOrURLOpeningOps
						null, // null -> to top stack view
						false // not animated
					)
					self.PopToRootView(false) // in case they're not on root
					//
					if (self.__shared_isAllowedToPerformDropOrURLOpeningOps() != true) {
						console.warn("Not allowed to perform URL opening ops yet.")
						return false
					}
					self._shared_didPickRequestURIStringForAutofill(url)
				}
			)
		}
	}
	//
	// Overrides - Required - Setup - Accessors
	_new_required_contactPickerLayer()
	{
		const self = this
		const layer = commonComponents_contactPicker.New_contactPickerLayer(
			self.context,
			"Contact name, or address/domain",
			self.context.contactsListController,
			function(contact)
			{ // did pick
				self._didPickContact(contact)
			},
			function(clearedContact)
			{
				self.cancelAny_requestHandle_for_oaResolution()
				//
				self._dismissValidationMessageLayer() // in case there was an OA addr resolve network err sitting on the screen
				self._hideResolvedPaymentID()
				self._hideResolvedAddress()
				//
				self.addPaymentIDButtonView.layer.style.display = "block" // can re-show this
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // just in case
				self.manualPaymentIDInputLayer.value = ""
				//
				self.pickedContact = null
			},
			function(event)
			{ // didFinishTypingInInput_fn
				self._didFinishTypingInContactPickerInput(event)
			}
		)
		return layer
	}
}
module.exports = SendFundsView