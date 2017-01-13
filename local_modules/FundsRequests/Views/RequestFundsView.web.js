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
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web')
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
const commonComponents_contactPicker = require('../../WalletAppCommonComponents/contactPicker.web')
//
class RequestFundsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
		{
			self.fromContact = options.fromContact || null
		}
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
		self._setup_self_layer()
		self._setup_validationMessageLayer()
		self._setup_form_containerLayer()
	}
	_setup_self_layer()
	{
		const self = this

		self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		self.layer.style.position = "relative"
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
	_setup_validationMessageLayer()
	{ // validation message
		const self = this
		const layer = commonComponents_tables.New_inlineMessageDialogLayer("")
		layer.ClearAndHideMessage()
		self.validationMessageLayer = layer
		self.layer.appendChild(layer)				
	}
	_setup_form_containerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		self.form_containerLayer = containerLayer
		{
			self._setup_form_walletSelectLayer()
			self._setup_form_amountInputLayer()
			self.form_containerLayer.appendChild(commonComponents_tables.New_spacerLayer())
			self._setup_form_memoInputLayer()
			self._setup_form_contactPickerLayer()
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_form_walletSelectLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("To Wallet")
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_walletSelectLayer({
				walletsListController: self.context.walletsListController,
				didChangeWalletSelection_fn: function(selectedWallet) { /* nothing to do */ }
			})
			self.walletSelectLayer = valueLayer
			div.appendChild(valueLayer)
		}
		{ // to get the height
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_amountInputLayer()
	{ // Request funds from sender
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("Amount") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "XMR"
			})
			self.amountInputLayer = valueLayer
			{
				valueLayer.addEventListener(
					"keyup",
					function(event)
					{
						if (event.keyCode === 13) {
							self._tryToGenerateRequest()
							return
						}
					}
				)
			}
			div.appendChild(valueLayer)
		}
		{ // to get the height
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_memoInputLayer()
	{ // Memo
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("Memo") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "A description for this Monero request"
			})
			self.memoInputLayer = valueLayer
			{
				valueLayer.addEventListener(
					"keyup",
					function(event)
					{
						if (event.keyCode === 13) { // return key
							self._tryToGenerateRequest()
							return
						}
					}
				)
			}
			div.appendChild(valueLayer)
		}
		{ // to get the height
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_contactPickerLayer()
	{ // Request funds from sender
		const self = this
		const layer = commonComponents_contactPicker.New_contactPickerLayer(
			"Enter contact name",
			self.context.contactsListController,
			self.fromContact,
			function(contact)
			{ // did pick
				self.pickedContact = contact
			},
			function()
			{
				self.pickedContact = null
			}
		)
		// if (self.fromContact && typeof self.fromContact !== 'undefined') {
		// 	layer.SelectContact(self.fromContact)
		// }
		self.contactPickerLayer = layer
		self.form_containerLayer.appendChild(layer)
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Request Monero"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{ // v--- self.navigationController because self is presented packaged in a StackNavigationView
						self.navigationController.modalParentView.DismissTopModalView(true)
					}
					return false
				}
			)
		}
		return view
	}
	Navigation_New_RightBarButtonView()
	{ // TODO: factor/encapsulate in navigationBarButtons.web
		const self = this
		const view = new View({ tag: "a" }, self.context)
		const layer = view.layer
		{ // setup/style
			layer.href = "#" // to make it clickable
			layer.innerHTML = "Save"
			//
			layer.style.display = "block"
			layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
			layer.style.marginTop = "10px"
			layer.style.width = "90px"
			layer.style.height = "24px"
			layer.style.borderRadius = "2px"
			layer.style.backgroundColor = "#18bbec"
			layer.style.textDecoration = "none"
			layer.style.fontSize = "22px"
			layer.style.lineHeight = "112%" // % extra to get + aligned properly
			layer.style.color = "#ffffff"
			layer.style.fontWeight = "bold"
			layer.style.textAlign = "center"
		}
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						self._tryToGenerateRequest()
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
		const wallet = self.walletSelectLayer.CurrentlySelectedWallet
		{
			if (typeof wallet === 'undefined' || !wallet) {
				self.validationMessageLayer.SetValidationError("Please create a wallet to create a request.")
				return
			}
		}
		const amount = self.amountInputLayer.value
		{
			if (typeof amount === 'undefined' || !amount) {
				self.validationMessageLayer.SetValidationError("Please enter a Monero amount to request.")
				return
			}
			// TODO: validate amount here
			const amount_isValid = true // TODO: just for now
			if (amount_isValid !== true) {
				self.validationMessageLayer.SetValidationError("Please enter a valid amount.")
				return
			}
		}
		const hasPickedAContact = typeof self.pickedContact !== 'undefined' && self.pickedContact
		if (
			self.contactPickerLayer.ContactPicker_inputLayer.value !== "" // they have entered something but not picked a contact
			&& hasPickedAContact == false // not strictly necessary to check hasPickedAContact, but for clarity
		) {
			self.validationMessageLayer.SetValidationError("Please select a contact or clear the contact field below to generate this request.")
			return
		}
		var payment_id = null
		if (hasPickedAContact === true) {
			// TODO: detect whether this is an OA address. if it is, look up the payment ID again (and show the "resolving UI")
			payment_id = self.pickedContact.payment_id
			if (!payment_id || typeof payment_id === 'undefined') {
				throw "Payment ID was null despite user having selected a contact"
			}
		}
		const memo = self.memoInputLayer.value
		const message = undefined // no support yet?
		self.__generateRequestWith(
			wallet.public_address,
			payment_id,
			amount,
			memo, // description, AKA memo or label; no support yet?
			message
		)
	}
	__generateRequestWith(
		receiveTo_address,
		payment_id,
		amount,
		memo,
		message
	)
	{
		const self = this
		self.context.fundsRequestsListController.WhenBooted_AddFundsRequest(
			receiveTo_address,
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
				}
				const GeneratedRequestView = require('./GeneratedRequestView.web')
				const options = 
				{
					fundsRequest: fundsRequest
				}
				const view = new GeneratedRequestView(options, self.context)
				const modalParentView = self.navigationController.modalParentView
				const underlying_navigationController = modalParentView
				underlying_navigationController.PushView(view, false) // not animated
				setTimeout(function()
				{ // just to make sure the PushView finished
					modalParentView.DismissTopModalView(true)
				})
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
module.exports = RequestFundsView