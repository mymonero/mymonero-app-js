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
//
class TransactionDetailsView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		{
			self.transaction = options.transaction
			if (self.transaction === null || typeof self.transaction === 'undefined') {
				throw "options.transaction nil but required for " + self.constructor.name
			}
			//
			self.wallet = options.wallet
			if (self.wallet === null || typeof self.wallet === 'undefined') {
				throw "options.wallet nil but required for " + self.constructor.name
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{ // zeroing / initialization
		}
		self._setup_views()
		self._setup_startObserving()
		//
		self._configureUIWithTransaction()
	}
	_setup_views()
	{
		const self = this
		self.setup_self_layer()
		{
			const layer = commonComponents_tables.New_inlineMessageDialogLayer(
				self.context, 
				"", // for now
				false // for now
			)
			layer.style.width = "calc(100% - 0px)"
			layer.style.marginLeft = "0px"
			self.validationMessageLayer__isLocked = layer
			self.layer.appendChild(layer)
		}
		{
			const layer = commonComponents_tables.New_inlineMessageDialogLayer(
				self.context, 
				"Your Monero is on its way.",
				false // for now
			)
			layer.style.width = "calc(100% - 0px)"
			layer.style.marginLeft = "0px"
			self.validationMessageLayer__onItsWay = layer
			self.layer.appendChild(layer)
		}
		// v- NOTE: only specifying commonComponents_forms here to get the styling, so that's somewhat fragile
		const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("DETAILS", self.context)
		labelLayer.style.marginTop = "15px"
		labelLayer.style.marginBottom = "0"
		labelLayer.style.paddingTop = "0"
		labelLayer.style.paddingBottom = "0"
		labelLayer.style.display = "block"
		labelLayer.style.color = "#9E9C9E" // special case
		labelLayer.style.fontWeight = "500" // to get specific visual weight w color
		self.layer.appendChild(labelLayer)
		//
		const containerLayer = document.createElement("div")
		self.tableSection_containerLayer = containerLayer
		containerLayer.style.margin = "8px 0"
		containerLayer.style.boxSizing = "border-box"
		containerLayer.style.padding = "0 16px 4px 16px"
		containerLayer.style.border = "0.5px solid #494749"
		containerLayer.style.borderRadius = "5px"
		{
			self._addTableFieldLayer_date()
			self._addTableFieldLayer_amountsFeesAndTotals()
			self._addTableFieldLayer_mixin()
			self._addTableFieldLayer_transactionHash()
			self._addTableFieldLayer_paymentID()
		}
		self.layer.appendChild(containerLayer)
		// self.DEBUG_BorderChildLayers()
	}
	setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		layer.style.boxSizing = "border-box"
		//
		const margin_h = 16
		layer.style.width = `100%`
		layer.style.height = "100%"
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.overflowY = "auto"
		// layer.style.webkitOverflowScrolling = "touch"
		layer.style.padding = `0 ${margin_h}px 40px ${margin_h}px` // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
	}

	___styleLabelLayerAsFieldHeader(labelLayer)
	{
		labelLayer.style.fontSize = "11px"
		labelLayer.style.color = "#DFDEDF"
	}
	__new_tableFieldLayer_simpleValue(value, title, optl_color)
	{
		const self = this
		const div = commonComponents_tables.New_fieldContainerLayer(self.context)
		div.style.padding = "17px 0"
		//
		const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer(title, self.context)
		self.___styleLabelLayerAsFieldHeader(labelLayer)
		div.appendChild(labelLayer)
		//
		const valueLayer = commonComponents_tables.New_fieldValue_labelLayer(value, self.context)
		if (typeof optl_color !== 'undefined' && optl_color) {
			valueLayer.style.color = optl_color
		}
		valueLayer.style.marginTop = "-1px"
		valueLayer.style.maxWidth = "75%" // should wrap
		div.appendChild(valueLayer)
		//
		div.appendChild(commonComponents_tables.New_clearingBreakLayer()) // preserve height; better way?	
		//
		div.Component_SetValue = function(value)
		{
			valueLayer.Component_SetValue(value)
		}
		div.Component_SetColor = function(color)
		{
			valueLayer.style.color = color
		}
		return div
	}
	_addTableFieldLayer_date()
	{
		const self = this
		const title = "Date"
		const div = self.__new_tableFieldLayer_simpleValue(
			"", // for now
			title			
		)
		self.tableFieldLayer__date = div
		self.tableSection_containerLayer.appendChild(div)
	}
	_addTableFieldLayer_amountsFeesAndTotals()
	{
		const self = this
		const title = "Total"
		const div = self.__new_tableFieldLayer_simpleValue(
			"", // for now
			title
		)
		self.tableFieldLayer__amountsFeesAndTotals = div
		self.tableSection_containerLayer.appendChild(div)
	}
	_addTableFieldLayer_mixin()
	{
		const self = this
		const title = "Mixin"
		const div = self.__new_tableFieldLayer_simpleValue(
			"", // for now
			title			
		)
		self.tableFieldLayer__mixin = div
		self.tableSection_containerLayer.appendChild(div)
	}
	_addTableFieldLayer_transactionHash()
	{
		const self = this
		const fieldLabelTitle = "Transaction Hash"
		const valueToDisplayIfValueNil = "N/A"
		const div = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			self.context,
			fieldLabelTitle, 
			"", // for now
			self.context.pasteboard, 
			valueToDisplayIfValueNil
		)
		self.valueLayer__transactionHash = div
		const labelLayer = div.Component_GetLabelLayer()
		self.___styleLabelLayerAsFieldHeader(labelLayer)
		self.tableSection_containerLayer.appendChild(div)
	}
	_addTableFieldLayer_paymentID()
	{
		const self = this
		const fieldLabelTitle = "Payment ID"
		const valueToDisplayIfValueNil = "N/A"
		const div = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			self.context,
			fieldLabelTitle, 
			"", // for now
			self.context.pasteboard, 
			valueToDisplayIfValueNil
		)
		self.valueLayer__paymentID = div
		const labelLayer = div.Component_GetLabelLayer()
		self.___styleLabelLayerAsFieldHeader(labelLayer)
		self.tableSection_containerLayer.appendChild(div)
	}
	//
	_setup_startObserving()
	{
		const self = this
		self._setup_startObserving_wallet()
	}
	_setup_startObserving_wallet()
	{
		const self = this
		if (typeof self.wallet === 'undefined' || self.wallet === null) {
			throw "nil self.wallet undefined in " + self.constructor.name + "/" + "_setup_startObserving_wallet`"
		}
		// here, we're going to store the listener functions as instance properties
		// because when we need to stopObserving we need to have access to the listener fns
		//
		// txs updated
		self.wallet_EventName_transactionsChanged_listenerFunction = function()
		{
			self.wallet_EventName_transactionsChanged()
		}
		self.wallet.on(
			self.wallet.EventName_transactionsChanged(),
			self.wallet_EventName_transactionsChanged_listenerFunction
		)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{ // We're going to make sure we tear this down here as well as in VDA in case we get popped over back to root (thus never calling VDA but calling this)
		const self = this
		super.TearDown()
		//
		self.transaction = null
		self._stopObserving()
		self.wallet = null
	}
	_stopObserving()
	{
		const self = this
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		if (doesListenerFunctionExist(self.wallet_EventName_transactionsChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_transactionsChanged(),
				self.wallet_EventName_transactionsChanged_listenerFunction
			)
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		const self = this
		const transaction = self.transaction
		//
		return transaction.approx_float_amount || ""
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_ValueDisplayLabelButtonView(self.context)
		const layer = view.layer
		{
			var valueString;
			const transaction = self.transaction
			if (transaction && typeof transaction !== 'undefined') {
				if (transaction.isConfirmed !== true) {
					valueString = "PENDING"
				} else {
					valueString = "CONFIRMED"
				}
			} else {
				valueString = ""
			}
			layer.innerHTML = valueString
		}
		view.layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				// disabled
				return false
			}
		)
		return view
	}
	
	Navigation_TitleColor()
	{
		const self = this
		const transaction = self.transaction
		const colorHexString_orNil = transaction.approx_float_amount < 0 ? "#F97777" : null
		//
		return colorHexString_orNil // null meaning go with the default
	}
	//
	//
	// Runtime - Imperatives - UI Configuration
	//
	_configureUIWithTransaction()
	{
		const self = this
		const wallet = self.wallet
		if (wallet.didFailToInitialize_flag === true || wallet.didFailToBoot_flag === true) {
			throw self.constructor.name + " opened while wallet failed to init or boot."
		}
		const transaction = self.transaction
		if (transaction.isUnlocked !== true) {
			if (self.validationMessageLayer__isLocked.userHasClosedThisLayer !== true) {
				const lockedReason = self.wallet.TransactionLockedReason(self.transaction)
				var messageString = "This transaction is currently locked. " + lockedReason
				self.validationMessageLayer__isLocked.SetValidationError(messageString) // this shows the validation err msg
			}
		} else {
			self.validationMessageLayer__isLocked.style.display = "none"
		}
		if (transaction.isJustSentTransaction === true || transaction.isConfirmed !== true) {
			if (self.validationMessageLayer__onItsWay.userHasClosedThisLayer !== true) {
				self.validationMessageLayer__onItsWay.style.display = "block"
			} else {
				// do not re-show since user has already closed it
			}
		} else {
			self.validationMessageLayer__onItsWay.style.display = "none"
		}
		if (self.navigationController) {
			self.navigationController.SetNavigationBarTitleNeedsUpdate() // for the CONFIRMED/PENDING
		} else {
			// then it'll effectively be called for us after init
		}
		// Configuring table fields
		{ // Date
			var date = self.transaction.timestamp
			if (typeof date === 'string') {
				date = new Date(date)
			}
			const dateString = date.toLocaleDateString(
				'en-US'/*for now*/, 
				{ year: 'numeric', month: 'short', day: 'numeric', hour: "numeric", minute: "numeric", second: "numeric" }
			).toUpperCase()
			const value = dateString
			self.tableFieldLayer__date.Component_SetValue(value)
		}
		{ // Total
			const value = self.transaction.approx_float_amount
			var color;
			if (value < 0) {
				color = "#F97777"
			} else {
				color = "#FCFBFC"
			}
			self.tableFieldLayer__amountsFeesAndTotals.Component_SetValue(value)
			self.tableFieldLayer__amountsFeesAndTotals.Component_SetColor(color)
		}
		{ // Mixin
			const value = self.transaction.mixin 
			self.tableFieldLayer__mixin.Component_SetValue(value)
		}
		{ // TX hash
			const value = self.transaction.hash
			self.valueLayer__transactionHash.Component_SetValue(value)
		}
		{ // Payment ID
			const value = self.transaction.payment_id
			self.valueLayer__paymentID.Component_SetValue(value)
		}
	}
	//
	//
	// Runtime - Delegation - Event handlers - Wallet
	//
	wallet_EventName_transactionsChanged()
	{
		const self = this
		var updated_transaction = null // to find
		const transactions = self.wallet.New_StateCachedTransactions() // important to use this instead of .transactions
		const transactions_length = transactions.length
		for (let i = 0 ; i < transactions_length ; i++) {
			const this_transaction = transactions[i]
			if (this_transaction.hash === self.transaction.hash) {
				updated_transaction = this_transaction
				break
			}
		}
		if (updated_transaction !== null) {
			self.transaction = updated_transaction
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.navigationController.SetNavigationBarTitleNeedsUpdate()
			}
			self._configureUIWithTransaction() // updated - it might not be this one which updated but (a) it's quite possible and (b) configuring the UI isn't too expensive
		} else {
			throw "Didn't find same transaction in already open details view. Probably a server bug."
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
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
	}
}
module.exports = TransactionDetailsView
