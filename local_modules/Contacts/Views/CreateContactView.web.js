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
const View = require('../../Views/View.web')
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web.js')
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web.js')
//
class CreateContactView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		{
			self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
			//
			self.layer.style.width = "calc(100% - 20px)"
			self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
			//
			self.layer.style.backgroundColor = "#282527" // so we don't get a strange effect when pushing self on a stack nav view
			//
			self.layer.style.color = "#c0c0c0" // temporary
			//
			self.layer.style.overflowY = "scroll"
			self.layer.style.padding = "0 10px 40px 10px" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
			//
			self.layer.style.wordBreak = "break-all" // to get the text to wrap
		}
		{ // validation message
			const layer = commonComponents_tables.New_inlineMessageDialogLayer("")
			layer.ClearAndHideMessage()
			self.validationMessageLayer = layer
			self.layer.appendChild(layer)				
		}
		{ // inputs
			const containerLayer = document.createElement("div")
			{ // hierarchy
				
			}
			self.layer.appendChild(containerLayer)
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "New Contact"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
					}
					return false
				}
			)
		}
		return view
	}
	//
	//
	// Runtime - Imperatives - Request generation
	//
	_tryToGenerateRequest()
	{
		const self = this
		//
		const wallet = self.walletSelectLayer.CurrentlySelectedWallet
		const amount = self.amountInputLayer.value
		const memo = self.memoInputLayer.value
		const contact_id = self.contactInputLayer.value // TODO when picker built
		//
		if (typeof wallet === 'undefined' || !wallet) {
			self.validationMessageLayer.SetValidationError("Please create a wallet to create a request.")
			return
		}
		if (typeof amount === 'undefined' || !amount) {
			self.validationMessageLayer.SetValidationError("Please enter a Monero amount to request.")
			return
		}
		if (self.hasAnalyzedAndResolveAmountInfo === false) {
			// TODO: validate amount here
			const amount_isValid = true // TODO: just for now
			if (amount_isValid !== true) {
				self.validationMessageLayer.SetValidationError("Please enter a valid amount.")
				return
			}
		}
		//
		// We can assume that we have a password by this point, because we have a wallet (above)
		//
		var payment_id = null
		const contact = null // TODO: resolve contact from contact_id -- or just get the contact objs directly 
		if (typeof contact !== 'undefined' && contact) {
			payment_id = contact.payment_id
		}
		//
		const message = undefined // no support yet?
		//
		self.context.fundsRequestsListController.WhenBooted_AddFundsRequest(
			wallet.public_address,
			payment_id,
			amount,
			memo, // description, AKA memo or label; no support yet?
			message,
			function(err, fundsRequest)
			{
				if (err) {
					console.error("Error while creating funds request", err)
					// TODO: show "validation" error here
					return
				}
				{
					self.validationMessageLayer.ClearAndHideMessage()
					//
					self.hasAnalyzedAndResolveAmountInfo = undefined // reset
					//
					// TODO: reset wallet to first choice?…… do we even need to reset these fields? this will probably be presented as a modal and so will be dismissed and then torn down – and so it wouldn't be self which is doing the PushView of the below GeneratedRequestView
					self.amountInputLayer.value = ""
					self.memoInputLayer.value = ""
					self.contactInputLayer.value = "" // TODO: update this when we build the contacts selector
				}
				const GeneratedRequestView = require('./GeneratedRequestView.web')
				const options = 
				{
					fundsRequest: fundsRequest
				}
				const view = new GeneratedRequestView(options, self.context)
				self.navigationController.PushView(
					view,
					true
				)
			}
		)
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		// teardown any child/referenced stack navigation views if necessary…
	}
}
module.exports = CreateContactView