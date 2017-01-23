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
const commonComponents_walletSelect = require('../../WalletAppCommonComponents/walletSelect.web')
const commonComponents_contactPicker = require('../../WalletAppCommonComponents/contactPicker.web')
const commonComponents_activityIndicators = require('../../WalletAppCommonComponents/activityIndicators.web')
//
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const AddContactFromSendTabView = require('./AddContactFromSendTabView.web')
const JustSentTransactionDetailsView = require('./JustSentTransactionDetailsView.web')
//
const monero_sendingFunds_utils = require('../../monero_utils/monero_sendingFunds_utils')
const monero_openalias_utils = require('../../OpenAlias/monero_openalias_utils')
const monero_paymentID_utils = require('../../monero_utils/monero_paymentID_utils')
const monero_config = require('../../monero_utils/monero_config')
const monero_utils = require('../../monero_utils/monero_cryptonote_utils_instance')
//
class SendFundsView extends View
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
		self.isSubmitButtonDisabled = false
		self.setup_views()
		self.startObserving()
		
	}
	setup_views()
	{
		const self = this
		{ // zeroing / initialization
			self.current_transactionDetailsView = null
		}
		self._setup_self_layer()
		self._setup_validationMessageLayer()
		self._setup_form_containerLayer()
		//
		// self.DEBUG_BorderChildLayers()
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
		self.layer.style.backgroundColor = "#282527" // so we don't get a strange effect when pushing self on a stack nav view
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
				self._setup_form_mixinSelectLayer(tr_1)
				table.appendChild(tr_1)
				self.form_containerLayer.appendChild(table)
			}
			self.form_containerLayer.appendChild(commonComponents_tables.New_clearingBreakLayer()) // as amt and mixin float
			self._setup_form_contactOrAddressPickerLayer()
			self._setup_form_resolving_activityIndicatorLayer()
			self._setup_form_resolvedAddress_containerLayer()
			self._setup_form_resolvedPaymentID_containerLayer()
			self._setup_form_addPaymentIDButton_aLayer()
			self._setup_form_manualPaymentIDInputLayer()
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_form_walletSelectLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("FROM")
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_walletSelect.New_fieldValue_walletSelectLayer({
				walletsListController: self.context.walletsListController,
				didChangeWalletSelection_fn: function(selectedWallet) { /* nothing to do */ }
			})
			self.walletSelectLayer = valueLayer
			div.appendChild(valueLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_amountInputLayer(tr)
	{ // Request funds from sender
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		div.style.display = "block"
		div.style.width = "210px"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("AMOUNT") // note use of _forms.
			div.appendChild(labelLayer)
			// ^ block
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
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
		{
			const layer = document.createElement("div")
			layer.style.textAlign = "left"
			layer.style.marginTop = "9px"
			layer.style.fontSize = "11px"
			layer.style.color = "#999"
			layer.style.fontFamily = "monospace"
			layer.innerHTML = self._new_estimatedTransactionFee_displayString()
			self.feeEstimateLayer = layer
			div.appendChild(layer)
		}
		const td = document.createElement("td")
		td.style.width = "100px"
		td.style.verticalAlign = "top"
		td.appendChild(div)
		tr.appendChild(td)
	}
	_setup_form_mixinSelectLayer(tr)
	{ // Mixin
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		div.style.width = "95px"
		div.style.display = "block"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("MIXIN") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_selectLayer({
				values: [
					"3",
					"6",
					"9"
				]
			})
			valueLayer.style.width = "63px"
			self.mixinSelectLayer = valueLayer
			{
				valueLayer.addEventListener(
					"change",
					function(event)
					{
						self.refresh_feeEstimateLayer()
					}
				)
			}
			div.appendChild(valueLayer)
		}
		const td = document.createElement("td")
		td.style.verticalAlign = "top"
		td.appendChild(div)
		// we are explicitly NOT going to add it to the DOM because
		// we don't want to show this to the user at this point in time. UX decision.
		// tr.appendChild(td)
	}
	_setup_form_contactOrAddressPickerLayer()
	{ // Request funds from sender
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("TO") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const layer = commonComponents_contactPicker.New_contactPickerLayer(
				"Enter contact name, or OpenAlias or integrated address",
				self.context.contactsListController,
				function(contact)
				{ // did pick
					self.addPaymentIDButton_aLayer.style.display = "none"
					self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
					self.manualPaymentIDInputLayer.value = ""
					//
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
					self.addPaymentIDButton_aLayer.style.display = "block" // can re-show this
					self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // just in case
					self.manualPaymentIDInputLayer.value = ""
					//
					self.pickedContact = null
				},
				function()
				{ // didFinishTypingInInput_fn
					self._didFinishTypingInContactPickerInput()
				}
			)
			self.contactOrAddressPickerLayer = layer
			div.appendChild(layer)
			{ // initial config
				if (self.fromContact !== null) {
					setTimeout( // must do this on the next tick so that we are already set on the navigation controller 
						function()
						{
							self.contactOrAddressPickerLayer.ContactPicker_pickContact(self.fromContact) // simulate user picking the contact
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
		const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicator()
		layer.style.display = "none" // initial state
		self.resolving_activityIndicatorLayer = layer
		self.form_containerLayer.appendChild(layer)
	}
	_setup_form_resolvedAddress_containerLayer()
	{ // TODO: factor this into a commonComponent file
		const self = this
		const div = document.createElement("div")
		div.style.display = "none" // initial state
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("MONERO ADDRESS") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const valueLayer = document.createElement("div")
			valueLayer.style.borderRadius = "4px"
			valueLayer.style.backgroundColor = "#ccc"
			valueLayer.style.color = "#737073"
			self.resolvedAddress_valueLayer = valueLayer
			div.appendChild(valueLayer)
		}
		self.resolvedAddress_containerLayer = div
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_resolvedPaymentID_containerLayer()
	{ // TODO: factor this into a commonComponent file
		const self = this
		const div = document.createElement("div")
		div.style.display = "none" // initial state
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PAYMENT ID") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const valueLayer = document.createElement("div")
			valueLayer.style.borderRadius = "4px"
			valueLayer.style.backgroundColor = "#ccc"
			valueLayer.style.color = "#737073"
			self.resolvedPaymentID_valueLayer = valueLayer
			div.appendChild(valueLayer)
			//
			const detectedMessage = document.createElement("div")
			detectedMessage.innerHTML = '<img src="detectedCheckmark.png" />&nbsp;<span>Detected</span>'
			div.appendChild(detectedMessage)
		}
		self.resolvedPaymentID_containerLayer = div
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_addPaymentIDButton_aLayer()
	{
		const self = this
		const layer = commonComponents_tables.New_createNewRecordNamedButton_aLayer("") 
		layer.innerHTML = "+ ADD PAYMENT ID"
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					console.log("Show the payment id input field here…… ")
					self.manualPaymentIDInputLayer_containerLayer.style.display = "block"
					layer.style.display = "none"
				}
				return false
			}
		)
		self.addPaymentIDButton_aLayer = layer
		self.form_containerLayer.appendChild(layer)
	}
	_setup_form_manualPaymentIDInputLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		div.style.display = "none" // initial
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PAYMENT ID") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "A specific payment ID"
			})
			self.manualPaymentIDInputLayer = valueLayer
			{
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
			}
			div.appendChild(valueLayer)
		}
		self.manualPaymentIDInputLayer_containerLayer = div
		//
		self.form_containerLayer.appendChild(div)
	}
	//
	startObserving()
	{
		const self = this
		{ // walletAppCoordinator
			const emitter = self.context.walletAppCoordinator
			self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact = function(contact)
			{
				if (self.isSubmitButtonDisabled == true) {
					console.warn("Triggered send funds from contact while submit btn disabled. Beep.")
					// TODO: create system service for playing beep, an electron (shell.beep) implementation, and call it to beep
					// TODO: mayyybe alert tx in progress
					return
				}
				self.contactOrAddressPickerLayer.ContactPicker_pickContact(contact)
			}
			emitter.on(
				emitter.EventName_didTrigger_sendFundsToContact(), // observe 'did' so we're guaranteed to already be on right tab
				self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact
			)
		}
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
			// // important! so they stop observing
			self.walletSelectLayer.Component_TearDown()
			self.contactOrAddressPickerLayer.Component_TearDown()
		}
		{
			if (self.current_transactionDetailsView !== null) {
				self.current_transactionDetailsView.TearDown()
				self.current_transactionDetailsView = null
			}
		}
		{
			self.stopObserving()
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
	stopObserving()
	{
		const self = this
		{
			const emitter = self.context.walletAppCoordinator
			emitter.removeListener(
				emitter.EventName_didTrigger_sendFundsToContact(),
				self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact
			)
			self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact = null
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Send Monero"
	}
	Navigation_New_RightBarButtonView()
	{ // TODO: factor/encapsulate in navigationBarButtons.web
		const self = this
		const view = new View({ tag: "a" }, self.context)
		self.rightBarButtonView = view
		const layer = view.layer
		{ // setup/style
			layer.href = "#" // to make it clickable
			layer.innerHTML = "Send"
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
						if (self.isSubmitButtonDisabled !== true) { // button is enabled
							self._tryToGenerateSend()
						}
					}
					return false
				}
			)
		}
		return view
	}
	//
	//
	// Accessors - Factories - Values
	//
	_new_estimatedTransactionFee_displayString()
	{
		const self = this
		var mixin_str;
		if (typeof self.mixinSelectLayer === 'undefined' || !self.mixinSelectLayer) {
			mixin_str = "3"
		} else {
			mixin_str = self.mixinSelectLayer.value
		}
		var mixin_int = parseInt(mixin_str)
		const estimatedNetworkFee_JSBigInt = monero_sendingFunds_utils.EstimatedTransaction_ringCT_networkFee(
			mixin_int
		)
		const hostingServiceFee_JSBigInt = self.context.hostedMoneroAPIClient.HostingServiceChargeFor_transactionWithNetworkFee(
			estimatedNetworkFee_JSBigInt
		)
		const estimatedTotalFee_JSBigInt = hostingServiceFee_JSBigInt.add(estimatedNetworkFee_JSBigInt)
		const estimatedTotalFee_str = monero_utils.formatMoney(estimatedTotalFee_JSBigInt)
		var displayString = `+ ${estimatedTotalFee_str} fee`
		//
		return displayString
	}
	//
	//
	// Imperatives - UI - Config
	//
	refresh_feeEstimateLayer()
	{
		const self = this
		self.feeEstimateLayer.innerHTML = self._new_estimatedTransactionFee_displayString()
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
			buttonLayer.style.opacity = "0.5"
		}
	}
	enable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== false) {
			self.isSubmitButtonDisabled = false
			const buttonLayer = self.rightBarButtonView.layer
			buttonLayer.style.opacity = "1.0"
		}
	}
	//
	//
	// Runtime - Imperatives - Element visibility
	//
	_displayResolvedAddress(address)
	{
		const self = this
		if (!address) {
			throw "nil address passed to _displayResolvedAddress"
		}
		if (typeof self.resolvedAddress_containerLayer === 'undefined' || !self.resolvedAddress_containerLayer) {
			throw "_displayResolvedAddress expects a non-nil self.resolvedAddress_containerLayer"
		}
		self.resolvedAddress_valueLayer.innerHTML = address
		self.resolvedAddress_containerLayer.style.display = "block"
	}
	_hideResolvedAddress()
	{
		const self = this
		if (typeof self.resolvedAddress_containerLayer !== 'undefined' && self.resolvedAddress_containerLayer) {
			self.resolvedAddress_containerLayer.style.display = "none"
		}
	}
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
		self.validationMessageLayer.ClearAndHideMessage() 
	}
	//
	//
	// Runtime - Imperatives - Send-transaction generation
	//
	_tryToGenerateSend()
	{
		const self = this
		if (self.isSubmitButtonDisabled) {
			console.warn("⚠️  Submit button currently disabled. Bailing.")
			return
		}
		self.disable_submitButton()
		//
		self._dismissValidationMessageLayer()
		const wallet = self.walletSelectLayer.CurrentlySelectedWallet
		{
			if (typeof wallet === 'undefined' || !wallet) {
				self.validationMessageLayer.SetValidationError("Please create a wallet to send Monero.")
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
		//
		const hasPickedAContact = typeof self.pickedContact !== 'undefined' && self.pickedContact ? true : false
		const enteredAddressValue = self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value || ""
		const enteredAddressValue_exists = enteredAddressValue !== ""
		const notPickedContactBut_enteredAddressValue = !hasPickedAContact && enteredAddressValue_exists ? true : false
		const mixin_int = parseInt(self.mixinSelectLayer.value)
		//
		var target_address = null // to derive…
		const resolvedAddress = self.resolvedAddress_valueLayer.innerHTML || ""
		const resolvedAddress_exists = resolvedAddress !== "" // NOTE: it might be hidden, though!
		const resolvedAddress_fieldIsVisible = self.resolvedAddress_containerLayer.style.display === "block"
		//
		var payment_id = null
		const manuallyEnteredPaymentID = self.manualPaymentIDInputLayer.value || ""
		const manuallyEnteredPaymentID_exists = manuallyEnteredPaymentID !== ""
		const manuallyEnteredPaymentID_fieldIsVisible = self.manualPaymentIDInputLayer_containerLayer.style.display === "block" // kind of indirect, would be better to encapsulate show/hide & state, maybe
		const resolvedPaymentID = self.resolvedPaymentID_valueLayer.innerHTML || ""
		const resolvedPaymentID_exists = resolvedPaymentID !== "" // NOTE: it might be hidden, though!
		const resolvedPaymentID_fieldIsVisible = self.resolvedPaymentID_containerLayer.style.display === "block"
		//
		const canUseManualPaymentID = 
			manuallyEnteredPaymentID_exists 
			&& manuallyEnteredPaymentID_fieldIsVisible
			&& !resolvedPaymentID_fieldIsVisible // but not if we have a resolved one!
		if (canUseManualPaymentID && hasPickedAContact) {
			throw "canUseManualPaymentID shouldn't be true at same time as hasPickedAContact"
		}
		if (hasPickedAContact) { // we have already re-resolved the payment_id
			if (self.pickedContact.HasOpenAliasAddress() === true) {
				payment_id = self.pickedContact.payment_id
				if (!payment_id || typeof payment_id === 'undefined') {
					// not throwing - it's ok if this payment has no payment id
				}
				// we can just use the cached_OAResolved_XMR_address because in order to have picked this
				// contact and for the user to hit send, we'd need to have gone through an OA resolve (_didPickContact)
				target_address = self.pickedContact.cached_OAResolved_XMR_address
			} else if (self.pickedContact.HasIntegratedAddress() === true) {
				target_address = self.pickedContact.address // whatever it may be
				// ^ for integrated addrs, we don't want to extract the payment id and then use the integrated addr as well (TODO: unless we use fluffy's patch?)
			} else { // non-integrated addr
				target_address = self.pickedContact.address // whatever it may be
				// ^ for integrated addrs, we don't want to extract the payment id and then use the integrated addr as well (unless we use fluffy's patch?)
				payment_id = self.pickedContact.payment_id || null
			}
			if (!target_address || typeof target_address === 'undefined') {
				self.validationMessageLayer.SetValidationError("Contact unexpectedly lacked XMR address. This may be a bug.")
				return
			}
		} else {
			if (enteredAddressValue_exists === false) {
				self.validationMessageLayer.SetValidationError("Please specify the recipient of this transfer.")
				return
			}
			// address
			const is_enteredAddressValue_OAAddress = monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(enteredAddressValue)
			if (is_enteredAddressValue_OAAddress !== true) {
				// then it's an XMR addr
				var address__decode_result; 
				try {
					address__decode_result = monero_utils.decode_address(enteredAddressValue)
				} catch (e) {
					console.warn("Couldn't decode as a Monero address.", e)
					self.validationMessageLayer.SetValidationError("Please enter a valid Monero address.")
					self.enable_submitButton()
					return // just return silently
				}
				// we don't care whether it's an integrated address or not here since we're not going to use its payment id
				target_address = enteredAddressValue // then this look like a valid XMR addr
			} else { // then it /is/ an OA addr
				if (!resolvedAddress_fieldIsVisible || !resolvedAddress_exists) {
					self.validationMessageLayer.SetValidationError("Couldn't resolve this OpenAlias address.")
					return
				}
				target_address = resolvedAddress
			}
			// payment ID:
			if (canUseManualPaymentID) {
				if (resolvedPaymentID_fieldIsVisible) {
					throw "canUseManualPaymentID but resolvedPaymentID_fieldIsVisible"
					return
				}
				payment_id = manuallyEnteredPaymentID
		        if (monero_paymentID_utils.IsValidPaymentIDOrNoPaymentID(payment_id) === false) {
					// TODO: set validation err on payment ID field (clear that err when we clear the payment ID field)
					self.validationMessageLayer.SetValidationError("Please enter a valid payment ID.")
					return
				}
			} else if (resolvedPaymentID_fieldIsVisible) {
				if (resolvedPaymentID_exists === false) {
					throw "resolvedPaymentID_fieldIsVisible but !resolvedPaymentID_exists"
				}
				payment_id = resolvedPaymentID
			}
		}
		{ // final validation
			if (!target_address) {
				self.validationMessageLayer.SetValidationError("Unable to derive a target address for this transfer. This may be a bug.")
				return
			}
		}
		{ 
			self.amountInputLayer.disabled = true
			self.contactOrAddressPickerLayer.ContactPicker_inputLayer.disabled = true
			self.validationMessageLayer.SetValidationError(`Sending ${amount_Number} XMR…`)
		}
		__proceedTo_generateSendTransactionWith(
			wallet, // FROM wallet
			target_address, // TO address
			payment_id,
			amount_Number,
			mixin_int
		)
		function __proceedTo_generateSendTransactionWith(
			sendFrom_wallet,
			target_address,
			payment_id,
			amount_Number,
			mixin_int
		)
		{
			const sendFrom_address = sendFrom_wallet.public_address
			//
			sendFrom_wallet.SendFunds(
				target_address,
				amount_Number,
				mixin_int,
				payment_id,
				function(
					err,
					currencyReady_targetDescription_address,
					sentAmount,
					final__payment_id,
					tx_hash,
					tx_fee
				)
				{
					// no matter what
					self.enable_submitButton() 
					//
					if (err) {
						self.validationMessageLayer.SetValidationError(typeof err === 'string' ? err : err.message)
						return
					}
					// console.log(
					// 	"SENT",
					// 	currencyReady_targetDescription_address,
					// 	sentAmount,
					// 	final__payment_id,
					// 	tx_hash,
					// 	tx_fee
					// )
					var mockedTransaction; // defined out here cause we use it below
					{ // now present a mocked transaction details view, and see if we need to present an "Add Contact From Sent" screen based on whether they sent w/o using a contact
						mockedTransaction =
						{
						    hash: tx_hash,
						    mixin: "" + mixin_int,
						    coinbase: false,
							//
						    isConfirmed: false, // important
							isJustSentTransaction: true, // this is only used here
						    timestamp: "" + (new Date()), // faking
							//
						    isUnlocked: true, // TODO: not sure if this is correct
						    unlock_time: 0,
						    lockedReason: "Transaction is unlocked",
						    // height: 1228823,
							//
						    total_sent: "" + (sentAmount * Math.pow(10, monero_config.coinUnitPlaces)), // TODO: is this correct? and do we need to mock this?
						    total_received: "0",
							//
						    approx_float_amount: -1 * sentAmount, // -1 cause it's outgoing
						    // amount: new JSBigInt(sentAmount), // not really used (note if you uncomment, import JSBigInt)
							tx_fee: tx_fee,
							//
							payment_id: payment_id,
							//
							target_address: target_address, // only we here are saying it's the target
							//
							contact: hasPickedAContact ? self.pickedContact : null,
							//
							// values just in case they're needed; some are
							enteredAddressValue: enteredAddressValue_exists ? enteredAddressValue : null,
							resolvedAddress: resolvedAddress_exists ? resolvedAddress : null,
							resolvedPaymentID: resolvedPaymentID_exists ? resolvedPaymentID : null,
							manuallyEnteredPaymentID: manuallyEnteredPaymentID_exists ? manuallyEnteredPaymentID : null
						}
						self.pushDetailsViewFor_transaction(sendFrom_wallet, mockedTransaction)
					}
					{
						if (notPickedContactBut_enteredAddressValue == true) {
							// TODO: pop the New Contact view
							console.log("TODO: Present the new contact view")
						}
					}
					{ // and after a delay, present AddContactFromSendTabView
						const this_pickedContact = hasPickedAContact == true ? self.pickedContact : null
						if (this_pickedContact === null) { // so they're going with a custom addr
							setTimeout(
								function()
								{
									const view = new AddContactFromSendTabView({
										mockedTransaction: mockedTransaction
									}, self.context)
									const navigationView = new StackAndModalNavigationView({}, self.context)
									navigationView.SetStackViews([ view ])
									self.navigationController.PresentView(navigationView, true)
								},
								750 // after the navigation transition just above has taken place
							)
						}
					}
					{ // finally, clean up form
						setTimeout(
							function()
							{ // TODO: factor this ?
								self._dismissValidationMessageLayer()
								{
									self.amountInputLayer.value = ""
									self.amountInputLayer.disabled = false
								}
								{ // not that we need do to this cause mixin is hidden…
									self.mixinSelectLayer.value = self.mixinSelectLayer.firstChild.value // set to first
								}
								{
									self.contactOrAddressPickerLayer.ContactPicker_inputLayer.disabled = false // making sure to re-enable this
									if (self.pickedContact && typeof self.pickedContact !== 'undefined') {
										self.contactOrAddressPickerLayer.ContactPicker_unpickExistingContact_andRedisplayPickInput(
											true // true, do not focus input
										)
										self.pickedContact = null // jic
									}
									self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value = ""
								}
								{
									self._hideResolvedAddress()
									self._hideResolvedPaymentID()
								}
								{
									self.manualPaymentIDInputLayer.value = ""
									self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
									//
									self.addPaymentIDButton_aLayer.style.display = "block"
								}
							},
							500 // after the navigation transition just above has taken place
						)
					}
					{ // and fire off a request to have the wallet get the latest (real) tx records
						setTimeout(
							function()
							{
								sendFrom_wallet.hostPollingController._fetch_transactionHistory() // TODO: maybe fix up the API for this
							}
						)
					}
				}
			)
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
			self.contactOrAddressPickerLayer.ContactPicker_pickContact(fromContact) // simulate user picking the contact
		}
	}
	//
	//
	// Runtime - Imperatives - Navigation
	//
	pushDetailsViewFor_transaction(
		sentFrom_wallet, 
		transaction
	)
	{
		const self = this
		const _cmd = "pushDetailsViewFor_transaction"
		if (self.current_transactionDetailsView !== null) {
			// commenting this throw so we can use this as the official way to block double-clicks, etc
			// throw "Asked to " + _cmd + " while self.current_transactionDetailsView !== null"
			return
		}
		{ // validate wallet and tx
			if (typeof sentFrom_wallet === 'undefined' || sentFrom_wallet === null) {
				throw self.constructor.name + " requires self.wallet to " + _cmd
				return
			}
			if (typeof transaction === 'undefined' || transaction === null) {
				throw self.constructor.name + " requires transaction to " + _cmd
				return
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw self.constructor.name + " requires navigationController to " + _cmd
			return
		}
		{
			const options = 
			{
				wallet: sentFrom_wallet,
				transaction: transaction
			}
			const view = new JustSentTransactionDetailsView(options, self.context) // note JustSentTransactionDetailsView
			navigationController.PushView(
				view, 
				true // animated
			)
			// Now… since this is JS, we have to manage the view lifecycle (specifically, teardown) so
			// we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
			// by tearing it down on self.viewDidAppear() below and on TearDown()
			self.current_transactionDetailsView = view
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
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		{
			if (self.current_transactionDetailsView !== null) {
				self.current_transactionDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
				self.current_transactionDetailsView = null // must zero again and should free
			}
		}
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
				self._hideResolvedAddress() // no possible need to show this
				//
				const payment_id = contact.payment_id
				if (payment_id && typeof payment_id !== 'undefined') {
					self._displayResolvedPaymentID(payment_id)
				} else {
					self._hideResolvedPaymentID() // in case it's visible… although it wouldn't be
				}
				self.enable_submitButton()
				// and exit early
				return // no need to re-resolve what is not an OA addr
			} else { // they're using an OA addr, so we still need to check if they still have one
				self._hideResolvedAddress() // no possible need to show this
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
				self.enable_submitButton() // only enable if no err
				{ // there is no need to tell the contact to update its address and payment ID here as it will be observing the emitted event from this very request to .Resolve
					// we don't want to show the resolved addr here
					if (typeof payment_id !== 'undefined' && payment_id) {
						self._displayResolvedPaymentID(payment_id)
					} else {
						// we already hid it above
					}
				}
			}
		)
	}
	_didFinishTypingInContactPickerInput()
	{
		const self = this
		//
		self.cancelAny_requestHandle_for_oaResolution()
		self._hideResolvedAddress()
		self._hideResolvedPaymentID()
		//
		const enteredPossibleAddress = self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value
		if (!enteredPossibleAddress || typeof enteredPossibleAddress === 'undefined') {
			return
		}
		//
		self.disable_submitButton()
		//
		const isOAAddress = monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(enteredPossibleAddress)
		if (isOAAddress !== true) {
			var address__decode_result; 
			try {
				address__decode_result = monero_utils.decode_address(enteredPossibleAddress)
			} catch (e) {
				console.warn("Couldn't decode as a Monero address.", e)
				self.disable_submitButton()
				return // just return silently
			}
			if (address__decode_result.intPaymentId) {
				self._displayResolvedPaymentID(address__decode_result.intPaymentId)
				self.addPaymentIDButton_aLayer.style.display = "none"
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
				self.manualPaymentIDInputLayer.value = ""
	        } else {
				self._hideResolvedPaymentID() // not that it would be showing
	        }
			self.enable_submitButton()
			return
		}
		// then this could be an OA address…
		{ // (and show the "resolving UI")
			self.resolving_activityIndicatorLayer.style.display = "block"
			self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
			self.manualPaymentIDInputLayer.value = ""
			//
			self._dismissValidationMessageLayer() // assuming it's okay to do this here - and need to since the coming callback can set the validation msg
		}
		self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
			enteredPossibleAddress,
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
				if (enteredPossibleAddress !== addressWhichWasPassedIn) {
					console.warn("⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the enteredPossibleAddress. Bailing")
					return
				}
				if (err) { // no need to display since it's likely to be 
					console.log("err.toString()" , err.toString())
					return
				}
				{
					if (typeof moneroReady_address !== 'undefined' && moneroReady_address) {
						self._displayResolvedAddress(moneroReady_address)
					} else {
						// we already hid it above
					}
					
					if (typeof payment_id !== 'undefined' && payment_id) {
						self.addPaymentIDButton_aLayer.style.display = "none"
						self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
						self.manualPaymentIDInputLayer.value = ""
						self._displayResolvedPaymentID(payment_id)
					} else {
						// we already hid resolved payment it above
						if (self.manualPaymentIDInputLayer_containerLayer.style.display != "block") { // if manual payment field not showing
							self.addPaymentIDButton_aLayer.style.display = "block" // then make sure we are at least shwign the + payment ID btn
						} else { // then one or the other is already visible - respect existing state
							console.log("💬  It should be the case that either add pymt id btn or manual payment field is visible")
						}
					}
				}
			}
		)
	}
}
module.exports = SendFundsView