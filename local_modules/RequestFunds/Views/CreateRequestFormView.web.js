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
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_contactPicker = require('../../MMAppUICommonComponents/contactPicker.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
//
const WalletsSelectView = require('../../WalletsList/Views/WalletsSelectView.web')
//
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const AddContactFromOtherTabView = require('../../Contacts/Views/AddContactFromOtherTabView.web')
//
class CreateRequestFormView extends View
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
		{
			self.isSubmitButtonDisabled = false
		}
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
		//
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%"
		layer.style.height = "100%"
		layer.style.padding = "0 0 40px 0" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		if (self.context.Cordova_isMobile === true) {
			layer.style.paddingBottom = "300px" // very hacky, but keyboard UX takes dedication to get right, and would like to save that effort for native app
		}
		layer.style.overflowY = "auto"
		layer.classList.add( // so that we get autoscroll to form field inputs on mobile platforms
			commonComponents_forms.ClassNameForScrollingAncestorOfScrollToAbleElement()
		)
		// layer.style.webkitOverflowScrolling = "touch"
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	_setup_validationMessageLayer()
	{ // validation message
		const self = this
		const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, "")
		layer.style.width = "calc(100% - 48px)"
		layer.style.marginLeft = "24px"
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
			{
				const table = document.createElement("table")
				table.style.width = "100%"
				const tr_1 = document.createElement("tr")
				self._setup_form_amountInputLayer(tr_1)
				table.appendChild(tr_1)
				self.form_containerLayer.appendChild(table)
			}
			self._setup_form_memoInputLayer()
			self._setup_form_contactPickerLayer()
			self._setup_form_resolving_activityIndicatorLayer()
			self._setup_form_createNewRecordNamedButtonView()
			self._setup_form_addPaymentIDButtonView()
			self._setup_form_manualPaymentIDInputLayer()
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_form_walletSelectLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.display = "block"
		div.style.padding = "0 24px 0 24px"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("TO", self.context)
			div.appendChild(labelLayer)
			//
			const view = new WalletsSelectView({}, self.context)
			self.walletSelectView = view
			const valueLayer = view.layer
			div.appendChild(valueLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_amountInputLayer(tr)
	{ // Request funds amount from sender
		const self = this
		const pkg = commonComponents_forms.New_AmountInputFieldPKG(
			self.context,
			"XMR", // TODO: grab, update from selected wallet
			function()
			{ // enter btn pressed
				self._tryToGenerateRequest()
			}
		)		
		const div = pkg.containerLayer
		self.amountInputLayer = pkg.valueLayer
		//
		const td = document.createElement("td")
		td.style.width = "100px"
		td.style.verticalAlign = "top"
		td.appendChild(div)
		tr.appendChild(td)
	}
	_setup_form_memoInputLayer()
	{ // Memo
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingTop = "31px"
		div.style.paddingBottom = "0"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("MEMO", self.context)
			labelLayer.style.float = "left"
			div.appendChild(labelLayer)
			//
			const accessoryLabel = commonComponents_forms.New_fieldTitle_rightSide_accessoryLayer("optional", self.context)
			div.appendChild(accessoryLabel)
			//
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "A description for this Monero request"
			})
			self.memoInputLayer = valueLayer
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
			div.appendChild(valueLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_contactPickerLayer()
	{ // Request funds from sender
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingTop = "9px"
		div.style.paddingBottom = "0"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("REQUEST FROM", self.context)
			labelLayer.style.float = "left"
			div.appendChild(labelLayer)
			//
			const accessoryLabel = commonComponents_forms.New_fieldTitle_rightSide_accessoryLayer("optional", self.context)
			div.appendChild(accessoryLabel)
			//
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
			//
			const layer = commonComponents_contactPicker.New_contactPickerLayer(
				self.context,
				"Enter contact name",
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

					self.addPaymentIDButtonView.layer.style.display = "block" // hide if showing
					self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // hide if showing
					self.manualPaymentIDInputLayer.value = ""

					if (clearedContact && clearedContact.HasOpenAliasAddress() === true) {
						self.memoInputLayer.value = "" // we're doing this here to avoid stale state and because implementing proper detection of which memo the user intends to leave in there for this particular request is quite complicated. see note in _didPickContact… but hopefully checking having /come from/ an OA contact is good enough
					}
					self.pickedContact = null
					self.createNewRecordNamedButtonView.layer.style.display = "block"
				}
			)
			self.contactPickerLayer = layer
			div.appendChild(layer)
			{ // initial config
				if (self.fromContact !== null) {
					setTimeout( // must do this on the next tick so that we are already set on the navigation controller 
						function()
						{
							self.contactPickerLayer.ContactPicker_pickContact(self.fromContact) // simulate user picking the contact
						},
						1
					)
				}
			}
		}
		self.form_containerLayer.appendChild(div)
	}	
	_setup_form_resolving_activityIndicatorLayer()
	{
		const self = this
		const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicatorLayer(self.context)
		layer.style.display = "none" // initial state
		self.resolving_activityIndicatorLayer = layer
		self.form_containerLayer.appendChild(layer)
	}
	_setup_form_createNewRecordNamedButtonView()
	{
		const self = this
		const view = commonComponents_tables.New_createNewRecordNamedButtonView(
			"CONTACT", 
			self.context, 
			function()
			{
				const view = new AddContactFromOtherTabView({
					emitNewlySavedContact_fn: function(contact)
					{
						self.contactPickerLayer.ContactPicker_pickContact(contact) // not going to call AtRuntime_reconfigureWith_fromContact because that's for user actions like Request where they're expecting the contact to be the initial state of self instead of this, which is initiated by their action from a modal that is nested within self
					}
				}, self.context)
				const navigationView = new StackAndModalNavigationView({}, self.context)
				navigationView.SetStackViews([ view ])
				self.navigationController.PresentView(navigationView, true)
			}
		)
		view.layer.style.marginTop = "16px"
		view.layer.style.marginLeft = "32px"
		self.createNewRecordNamedButtonView = view
		self.form_containerLayer.appendChild(view.layer)
	}
	_setup_form_addPaymentIDButtonView()
	{
		const self = this		
		const view = commonComponents_tables.New_clickableLinkButtonView(
			"+ ADD PAYMENT ID", 
			self.context, 
			function()
			{
				if (self.isFormDisabled !== true) {
					self.manualPaymentIDInputLayer_containerLayer.style.display = "block"
					self.addPaymentIDButtonView.layer.style.display = "none"
				}
			}
		)
		view.layer.style.marginTop = "16px"
		view.layer.style.marginLeft = "32px"
		self.addPaymentIDButtonView = view
		self.form_containerLayer.appendChild(view.layer)
	}
	_setup_form_manualPaymentIDInputLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.display = "none" // initial
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PAYMENT ID", self.context)
			labelLayer.style.marginTop = "16px"
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "A specific payment ID"
			})
			self.manualPaymentIDInputLayer = valueLayer
			valueLayer.addEventListener(
				"keyup",
				function(event)
				{
					if (event.keyCode === 13) { // return key
						self._tryToGenerateSend()
						return
					}
				}
			)
			valueLayer.autocorrect = "off"
			valueLayer.autocomplete = "off"
			valueLayer.autocapitalize = "none"
			valueLayer.spellcheck = "false"
			div.appendChild(valueLayer)
		}
		self.manualPaymentIDInputLayer_containerLayer = div
		//
		self.form_containerLayer.appendChild(div)
	}
	//
	//
	// Lifecycle - Teardown - Overrides
	//
	TearDown()
	{
		const self = this
		{ // cancel any requests
			self.cancelAny_requestHandle_for_oaResolution()
		}
		{ // Tear down components that require us to call their TearDown
			// // important! so they stop observing… really wish there were a way to do a JS -dealloc analogue
			self.walletSelectView.TearDown()
			self.contactPickerLayer.Component_TearDown()
		}
		super.TearDown()
	}
	cancelAny_requestHandle_for_oaResolution()
	{
		const self = this
		//
		let req = self.requestHandle_for_oaResolution
		if (typeof req !== 'undefined' && req !== null) {
			console.log("💬  Aborting requestHandle_for_oaResolution")
			req.abort()
		}
		self.requestHandle_for_oaResolution = null
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "New Request"
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
	{		
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
		self.rightBarButtonView = view
		const layer = view.layer
		layer.innerHTML = "Save"
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					self._tryToGenerateRequest() // ok to call directly w/o checking enabled as method will chk
				}
				return false
			}
		)
		return view
	}
	//
	//
	// Runtime - Imperatives - Submit button enabled state
	//
	disable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== true) {
			self.isSubmitButtonDisabled = true
			self.rightBarButtonView.SetEnabled(false)
		}
	}
	enable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== false) {
			self.isSubmitButtonDisabled = false
			self.rightBarButtonView.SetEnabled(true)
		}
	}
	//
	_dismissValidationMessageLayer()
	{
		const self = this
		self.validationMessageLayer.SetValidationError("") 
		self.validationMessageLayer.style.display = "none"
	}	
	//
	//
	// Runtime - Imperatives - Request generation
	//
	_tryToGenerateRequest()
	{
		const self = this
		if (self.isSubmitButtonDisabled) {
			console.warn("Submit button currently disabled with isSubmitButtonDisabled",self.isSubmitButtonDisabled)
			return
		}
		self.validationMessageLayer.ClearAndHideMessage()
		//
		const wallet = self.walletSelectView.CurrentlySelectedRowItem
		{
			if (typeof wallet === 'undefined' || !wallet) {
				self.validationMessageLayer.SetValidationError("Please create a wallet to create a request.")
				return
			}
		}
		const raw_amount_String = self.amountInputLayer.value
		var amount_Number = null;
		{
			if (typeof raw_amount_String === 'undefined' || !raw_amount_String) {
				self.validationMessageLayer.SetValidationError("Please enter an amount to request.")
				return
			}
			amount_Number = +raw_amount_String // turns into Number, apparently
			if (isNaN(amount_Number)) {
				self.validationMessageLayer.SetValidationError("Please enter a valid amount of Monero.")
				return
			}
			if (amount_Number <= 0) {
				self.validationMessageLayer.SetValidationError("Please enter an amount greater than zero.")
				return
			}
		}
		const hasPickedAContact = typeof self.pickedContact !== 'undefined' && self.pickedContact ? true : false
		{
			if (self.contactPickerLayer.ContactPicker_inputLayer.value !== "" 
				// ^-- they have entered something but not picked a contact
				&& hasPickedAContact == false 
				// ^-- not strictly necessary to check hasPickedAContact, but for clarity and safety
			) {
				self.validationMessageLayer.SetValidationError("Please select a contact or clear the contact field below to generate this request.")
				return
			}
		}
		var payment_id = null
		if (self.manualPaymentIDInputLayer_containerLayer.style.display == "block") {
			payment_id = self.manualPaymentIDInputLayer.value
		}
		self.__generateRequestWith({
			optl__from_fullname: hasPickedAContact ? self.pickedContact.fullname : null,// from_fullname
			optl__to_walletHexColorString: wallet.swatch,
			receiveTo_address: wallet.public_address,
			payment_id: payment_id,
			amount_String: "" + amount_Number,
			memo: self.memoInputLayer.value, // request description, AKA memo or label
			message: undefined // "message"; no support yet 
		})
	}
	__generateRequestWith(params)
	{
		const optl__from_fullname = params.optl__from_fullname
		const optl__to_walletHexColorString = params.optl__to_walletHexColorString
		const receiveTo_address = params.receiveTo_address
		const payment_id = params.payment_id
		const amount_String = params.amount_String
		const memo = params.memo
		const message = params.message
		//
		const self = this
		self.disable_submitButton() // for slow frameworks like Cordova (or maybe slow computers)
		self.context.fundsRequestsListController.WhenBooted_AddFundsRequest(
			optl__from_fullname,
			optl__to_walletHexColorString,
			receiveTo_address,
			payment_id,
			amount_String,
			memo, // description, AKA memo or label
			message,
			function(err, record)
			{
				if (err) {
					self.enable_submitButton()
					console.error("Error while creating funds request", err)
					// TODO: show "validation" error here
					return
				}
				//
				// no need to re-enable form here cause we're about to dismiss self
				//
				_proceedTo_pushViewForRecord(record)
			}
		)
		function _proceedTo_pushViewForRecord(record)
		{
			const FundsRequestDetailsView = require('./FundsRequestDetailsView.web')
			const options = 
			{
				record: record // the fundsRequest
			}
			const view = new FundsRequestDetailsView(options, self.context)
			const modalParentView = self.navigationController.modalParentView
			const underlying_navigationController = modalParentView
			underlying_navigationController.PushView(view, false) // not animated
			setTimeout(function()
			{ // on next tick just to make sure the PushView finished
				modalParentView.DismissTopModalView(true)
			})
		}
	}
	//
	//
	// Runtime - Imperatives - Public - Using a new fromContact when a self had already been presented
	//
	AtRuntime_reconfigureWith_fromContact(fromContact)
	{
		const self = this
		{ // figure that since this method is called when user is trying to initiate a new request we should clear the amount
			self.amountInputLayer.value = ""
		}
		{
			self.fromContact = fromContact
			self.contactPickerLayer.ContactPicker_pickContact(fromContact) // simulate user picking the contact
		}
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
			self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
		}
	}
	//
	//
	// Runtime/Setup - Delegation - Contact selection
	//
	_didPickContact(contact)
	{
		const self = this
		//
		self.createNewRecordNamedButtonView.layer.style.display = "none"
		//
		self.pickedContact = contact
		{ // payment id - if we already have one
			if (self.pickedContact.HasOpenAliasAddress() === false) {
				const payment_id = contact.payment_id

				// NOTE: This may seem unusual not to show as a 'detected' payment ID
				// here but unlike on the Send page, Requests (I think) must be able to be created
				// with an empty / nil payment ID field even though the user picked a contact.

				if (payment_id && typeof payment_id !== 'undefined') {
					self.addPaymentIDButtonView.layer.style.display = "none" // hide if showing
					self.manualPaymentIDInputLayer_containerLayer.style.display = "block" // show if hidden
					self.manualPaymentIDInputLayer.value = payment_id
				} else {
					self.addPaymentIDButtonView.layer.style.display = "block" // hide if showing
					self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // hide if showing
					self.manualPaymentIDInputLayer.value = "" 
				}
				// and exit early
				//
				return // no need to re-resolve what is not an OA addr
			} else { // they're using an OA addr, so we still need to check if they still have one
				self.addPaymentIDButtonView.layer.style.display = "block" // hide if showing
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // hide if showing
				self.manualPaymentIDInputLayer.value = "" 
			}
		}
		// look up the payment ID again 
		{ // (and show the "resolving UI")
			self.resolving_activityIndicatorLayer.style.display = "block"
			self.disable_submitButton()
			//
			self._dismissValidationMessageLayer() // assuming it's okay to do this here - and need to since the coming callback can set the validation msg
		}
		{
			self.cancelAny_requestHandle_for_oaResolution()
		}
		self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
			contact.address,
			function(
				err,
				addressWhichWasPassedIn,
				moneroReady_address,
				payment_id, // may be undefined
				tx_description,
				openAlias_domain,
				oaRecords_0_name,
				oaRecords_0_description,
				dnssec_used_and_secured
			)
			{
				self.resolving_activityIndicatorLayer.style.display = "none"
				self.enable_submitButton()
				//
				if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
					console.warn("⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.")
					return
				}
				self.requestHandle_for_oaResolution = null
				//
				if (typeof self.pickedContact === 'undefined' || !self.pickedContact) {
					console.warn("⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.pickedContact. Bailing")
					return
				}
				if (self.pickedContact.address !== addressWhichWasPassedIn) {
					console.warn("⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the currently selected self.pickedContact.address. Bailing")
					return
				}
				if (err) {
					self.validationMessageLayer.SetValidationError(err.toString())
					return
				}
				{ // memo field
					tx_description = tx_description || "" // to facilitate clearing the memo field 
					self.memoInputLayer.value = tx_description // even if one was already entered; this is tbh an approximation of the behavior we want; ideally we'd try to detect and track whether the user intended to use/type their own custom memo – but that is surprisingly involved to do well enough! at least for now.				
				}
				{ // there is no need to tell the contact to update its address and payment ID here as it will be observing the emitted event from this very request to .Resolve
					if (typeof payment_id !== 'undefined' && payment_id) {
						self.addPaymentIDButtonView.layer.style.display = "none" // hide if showing
						self.manualPaymentIDInputLayer_containerLayer.style.display = "block" // show if hidden
						self.manualPaymentIDInputLayer.value = payment_id
					} else {
						// we already hid it above… but jic
						self.addPaymentIDButtonView.layer.style.display = "block" // hide if showing
						self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // hide if showing
						self.manualPaymentIDInputLayer.value = "" 
					}
				}
			}
		)
	}
}
module.exports = CreateRequestFormView