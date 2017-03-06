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
class CreateRequestView extends View
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
		self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		self.layer.style.position = "relative"
		self.layer.style.width = "calc(100% - 20px)"
		self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		self.layer.style.padding = "0 10px 40px 10px" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		self.layer.style.overflowY = "scroll"
		//
		self.layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		self.layer.style.color = "#c0c0c0" // temporary
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
			self._setup_form_resolvedPaymentID_containerLayer()
			self._setup_form_createNewRecordNamedButton_aLayer()
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_form_walletSelectLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
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
	{ // Request funds from sender
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
		div.style.display = "block"
		div.style.width = "210px"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("AMOUNT", self.context)
			div.appendChild(labelLayer)
			// ^ block
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "00.00"
			})
			valueLayer.style.textAlign = "right"
			valueLayer.float = "left" // because we want it to be on the same line as the "XMR" label
			valueLayer.style.display = "inline-block" // so we can have the XMR label on the right
			valueLayer.style.width = "128px"
			self.amountInputLayer = valueLayer
			{
				valueLayer.addEventListener(
					"keyup",
					function(event)
					{
						if (event.keyCode === 13) {
							self._tryToGenerateSend()
							return
						}
					}
				)
			}
			div.appendChild(valueLayer)
			//
			const currencyLabel = document.createElement("span")
			currencyLabel.display = "inline-block"
			currencyLabel.innerHTML = "XMR"
			currencyLabel.style.marginLeft = "5px"
			currencyLabel.style.fontSize = "11px"
			currencyLabel.style.color = "#eee"
			currencyLabel.style.fontFamily = "monospace"
			currencyLabel.style.verticalAlign = "middle"
			div.appendChild(currencyLabel)
		}
		div.appendChild(commonComponents_tables.New_clearingBreakLayer())
		const td = document.createElement("td")
		td.style.width = "100px"
		td.style.verticalAlign = "top"
		td.appendChild(div)
		tr.appendChild(td)
	}
	_setup_form_memoInputLayer()
	{ // Memo
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("MEMO", self.context)
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
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
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_contactPickerLayer()
	{ // Request funds from sender
		const self = this
		const layer = commonComponents_contactPicker.New_contactPickerLayer(
			"Enter contact's name",
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
				if (clearedContact && clearedContact.HasOpenAliasAddress() === true) {
					self.memoInputLayer.value = "" // we're doing this here to avoid stale state and because implementing proper detection of which memo the user intends to leave in there for this particular request is quite complicated. see note in _didPickContact… but hopefully checking having /come from/ an OA contact is good enough
				}
				self.pickedContact = null
			}
		)
		self.contactPickerLayer = layer
		self.form_containerLayer.appendChild(layer)
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
	_setup_form_resolving_activityIndicatorLayer()
	{
		const self = this
		const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicator()
		layer.style.display = "none" // initial state
		self.resolving_activityIndicatorLayer = layer
		self.form_containerLayer.appendChild(layer)
	}
	_setup_form_resolvedPaymentID_containerLayer()
	{ // TODO: factor this into a commonComponent file
		const self = this
		const containerLayer = commonComponents_forms.New_fieldContainerLayer()
		containerLayer.style.display = "none" // initial state
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PAYMENT ID", self.context)
			containerLayer.appendChild(labelLayer)
			//
			const valueLayer = document.createElement("div")
			valueLayer.style.borderRadius = "4px"
			valueLayer.style.backgroundColor = "#ccc"
			valueLayer.style.color = "#737073"
			self.resolvedPaymentID_valueLayer = valueLayer
			containerLayer.appendChild(valueLayer)
			//
			const detectedMessage = document.createElement("div")
			detectedMessage.innerHTML = '<img src="detectedCheckmark.png" />&nbsp;<span>Detected</span>'
			containerLayer.appendChild(detectedMessage)
		}
		self.resolvedPaymentID_containerLayer = containerLayer
		self.form_containerLayer.appendChild(containerLayer)
	}
	_setup_form_createNewRecordNamedButton_aLayer()
	{
		const self = this
		const layer = commonComponents_tables.New_createNewRecordNamedButton_aLayer("CONTACT")
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
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
				return false
			}
		)
		self.createNewRecordNamedButton_aLayer = layer
		self.form_containerLayer.appendChild(layer)
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
			const buttonLayer = self.rightBarButtonView.layer
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
	//
	// Runtime - Imperatives - Element visibility
	//
	_displayResolvedPaymentID(payment_id)
	{
		const self = this
		if (!payment_id) {
			throw "nil payment_id passed to _displayResolvedPaymentID"
		}
		if (typeof self.resolvedPaymentID_containerLayer === 'undefined' || !self.resolvedPaymentID_containerLayer) {
			throw "_displayResolvedPaymentID expects a non-nil self.resolvedPaymentID_containerLayer"
		}
		self.resolvedPaymentID_valueLayer.innerHTML = payment_id
		self.resolvedPaymentID_containerLayer.style.display = "block"
	}
	_hideResolvedPaymentID()
	{
		const self = this
		if (typeof self.resolvedPaymentID_containerLayer !== 'undefined' && self.resolvedPaymentID_containerLayer) {
			self.resolvedPaymentID_containerLayer.style.display = "none"
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
				self.validationMessageLayer.SetValidationError("Please enter a Monero amount to send.")
				return
			}
			amount_Number = +raw_amount_String // turns into Number, apparently
			if (isNaN(amount_Number)) {
				self.validationMessageLayer.SetValidationError("Please enter a valid amount.")
				return
			}
			if (amount_Number === 0) {
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
		if (hasPickedAContact === true) { // we have already re-resolved the payment_id
			if (self.pickedContact.HasIntegratedAddress() === true) {
				payment_id = null // we don't want to use this because it's a compact payment_id which isn't appropriate for a request... TODO?
				console.warn("⚠️  Ignoring Contact's integrated address payment ID.", self.pickedContact)
			} else {
				payment_id = self.pickedContact.payment_id
				if (!payment_id || typeof payment_id === 'undefined') {
					// not throwing
				}
			}
		}
		self.__generateRequestWith(
			hasPickedAContact ? self.pickedContact.fullname : null,// from_fullname
			wallet.swatch,
			wallet.public_address,
			payment_id,
			"" + amount_Number,
			self.memoInputLayer.value, // request description, AKA memo or label
			undefined // "message"; no support yet 
		)
	}
	__generateRequestWith(
		optl__from_fullname,
		optl__to_walletHexColorString,
		receiveTo_address,
		payment_id,
		amount_String,
		memo,
		message
	)
	{
		const self = this
		self.context.fundsRequestsListController.WhenBooted_AddFundsRequest(
			optl__from_fullname,
			optl__to_walletHexColorString,
			receiveTo_address,
			payment_id,
			amount_String,
			memo, // description, AKA memo or label
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
					record: fundsRequest
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
	//
	//
	// Runtime/Setup - Delegation - Contact selection
	//
	_didPickContact(contact)
	{
		const self = this
		self.pickedContact = contact
		{ // payment id - if we already have one
			if (self.pickedContact.HasOpenAliasAddress() === false) {
				const payment_id = contact.payment_id
				if (payment_id && typeof payment_id !== 'undefined') {
					self._displayResolvedPaymentID(payment_id)
				} else {
					self._hideResolvedPaymentID() // in case it's visible… although it wouldn't be
				}
				// and exit early
				//
				return // no need to re-resolve what is not an OA addr
			} else { // they're using an OA addr, so we still need to check if they still have one
				self._hideResolvedPaymentID() // in case it's visible… although it wouldn't be
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
						self._displayResolvedPaymentID(payment_id)
					} else {
						// we already hid it above
					}
				}
			}
		)
	}
}
module.exports = CreateRequestView