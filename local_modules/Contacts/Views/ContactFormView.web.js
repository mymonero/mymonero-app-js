// Copyright (c) 2014-2019, MyMonero.com
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
const EmojiPickerControlView = require('../../Emoji/Views/EmojiPickerControlView.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
//
const emoji_selection = require('../../Emoji/emoji_selection')
//
class ContactFormView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
		self.setup()
	}
	setup()
	{ // overridable, but do call on super
		const self = this
		{
			self.isSubmitButtonDisabled = false
		}
		self.setup_views()
	}
	setup_views()
	{ // overridable, but do call on super
		const self = this
		self.setup_self_layer()
		self.setup_validationMessageLayer()
		self.setup_form()
	}
	setup_self_layer()
	{ // overridable, but do call on super
		const self = this
		const layer = self.layer
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%"
		layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		layer.style.overflowY = "auto"
		layer.classList.add( // so that we get autoscroll to form field inputs on mobile platforms
			commonComponents_forms.ClassNameForScrollingAncestorOfScrollToAbleElement()
		)
		// layer.style.webkitOverflowScrolling = "touch"
		layer.style.overflowX = "hidden" // cause the Emoji picker likes to protrude
		layer.style.padding = "0 0 40px 0" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		if (self.context.Cordova_isMobile === true || self.context.isMobile === true) {
			layer.style.paddingBottom = "300px" // very hacky, but keyboard UX takes dedication to get right, and would like to save that effort for native app
		}
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		// no need to support other browsers since this is not in the web wallet
	}
	setup_validationMessageLayer()
	{
		const self = this
		const initial_message = self._overridable_initial_inlineMessageString()
		const initial_wantsXButtonHidden = self._overridable_initial_inlineMessage_wantsXButtonHidden()
		const initial_message__exists = initial_message !== "" && initial_message && typeof initial_message !== 'undefined' 
		const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, initial_message, initial_message__exists, initial_wantsXButtonHidden)
		layer.style.width = "calc(100% - 48px)"
		layer.style.marginLeft = "24px"
		self.validationMessageLayer = layer
		if (initial_message__exists == false) {
			layer.ClearAndHideMessage()
		}
		self.layer.appendChild(layer)				
	}
	setup_form()
	{
		const self = this
		const containerLayer = document.createElement("div")
		self.form_containerLayer = containerLayer
		{
			self._setup_field_fullname()
			self._setup_field_emoji()
			self.form_containerLayer.appendChild(commonComponents_tables.New_clearingBreakLayer())
			self._setup_field_address()
			self._did_setup_field_address() // for subclasses - overridable
			self._setup_field_paymentID()
		}
		self.layer.appendChild(containerLayer)
	}
	_overridable_new_fieldInputLayer__address()
	{
		const self = this
		const view = commonComponents_forms.New_fieldValue_textAreaView(
			{
				placeholderText: "Enter address, email, or domain"
			},
			self.context
		)
		const layer = view.layer
		layer.autocomplete = "off"
		layer.autocorrect = "off"
		layer.autocapitalize = "off"
		layer.spellcheck = "false"
		return layer // for the moment, only returning the layer
	}
	_overridable_new_fieldInputLayer__paymentID()
	{
		const self = this
		const view = commonComponents_forms.New_fieldValue_textAreaView(
			{
				placeholderText: "Optional"
			},
			self.context
		)
		const layer = view.layer
		layer.autocomplete = "off"
		layer.autocorrect = "off"
		layer.autocapitalize = "off"
		layer.spellcheck = "false"
		return layer // for the moment, only returning the layer
	}
	_overridable_initial_inlineMessageString()
	{
		return ""
	}
	_overridable_initial_inlineMessage_wantsXButtonHidden()
	{
		return undefined // this will be interpreted as the default, i.e. false
	}
	_overridable_shouldNotDisplayPaymentIDFieldLayer()
	{
		return false // show by default 
	}
	_overridable_shouldNotDisplayPaymentIDNoteLayer()
	{
		return false // do show payment id note layer by default
	}
	_overridable_initial_leftBarButtonTitleString_orUndefinedForDefaultCancel()
	{
		return undefined
	}
	_setup_field_fullname()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.padding = "0 0 0 24px"
		const emojiComponentWidth = 60 + 24 + 24
		div.style.width = `calc(100% - ${emojiComponentWidth}px - 24px + 2px)` // -24px for right side margin
		div.style.float = "left"
		//
		const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("NAME", self.context)
		div.appendChild(labelLayer)
		//
		const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
			placeholderText: "Enter name"
		})
		self.fullnameInputLayer = valueLayer
		valueLayer.addEventListener(
			"keyup",
			function(event)
			{
				if (event.keyCode === 13) { // return key
					self._tryToCreateOrSaveContact()
					return
				}
			}
		)
		valueLayer.autocomplete = "off"
		valueLayer.autocorrect = "off"
		valueLayer.spellcheck = "false"
		// but leaving autocomplete on
		div.appendChild(valueLayer)
		self.form_containerLayer.appendChild(div)
		// after visible… (TODO: improve this by doing on VDA or other trigger)
		setTimeout(function() {
			self.fullnameInputLayer.focus()
		}, 600)
	}
	_overridable_initial_emoji_value()
	{
		const self = this
		const inUseEmojis = self.context.contactsListController.GivenBooted_CurrentlyInUseEmojis()
		const value = emoji_selection.EmojiWhichIsNotAlreadyInUse(inUseEmojis)
		return value
	}
	_setup_field_emoji()
	{
		const self = this
		const value = self._overridable_initial_emoji_value()
		//					
		const paddingLeft = 24
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.padding = "0 24px 0 24px"
		div.style.width = "58px"
		div.style.display = "inline-block"
		//
		const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("EMOJI", self.context)
		div.appendChild(labelLayer)
		//
		const view = new EmojiPickerControlView({
			value: value,
			didPickEmoji_fn: function(emoji) {} // nothing to do as we simply read at submit
		}, self.context)
		const valueLayer = view.layer
		self.emojiInputView = view
		div.appendChild(valueLayer)
		//
		self.form_containerLayer.appendChild(div)
	}
	_setup_field_address()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingTop = "9px"
		div.style.paddingBottom = "0"
		//
		const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("ADDRESS", self.context)
		div.appendChild(labelLayer)
		//
		const inputLayer = self._overridable_new_fieldInputLayer__address()
		inputLayer.autocorrect = "off"
		inputLayer.autocomplete = "off"
		inputLayer.autocapitalize = "none"
		inputLayer.spellcheck = "false"
		self.addressInputLayer = inputLayer
		inputLayer.addEventListener(
			"keypress", // press, not up, to be able to control what goes into field
			function(event)
			{
				if (event.keyCode === 13) { // return key
					event.preventDefault() // do not let return/accept create a newline
					self._tryToCreateOrSaveContact()
					return false // do not let return/accept create a newline
				}
			}
		)
		div.appendChild(inputLayer)
		//
		self.form_containerLayer.appendChild(div)
	}
	_did_setup_field_address()
	{
		// overridable
	}
	_setup_field_paymentID()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingTop = "9px"
		div.style.paddingBottom = "0"
		self.paymentIDField_containerLayer = div
		//
		if (self._overridable_shouldNotDisplayPaymentIDFieldLayer() !== true) { // if we /should/ show
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PAYMENT ID", self.context)
			div.appendChild(labelLayer)
		}
		//
		const inputLayer = self._overridable_new_fieldInputLayer__paymentID()
		inputLayer.autocorrect = "off"
		inputLayer.autocomplete = "off"
		inputLayer.autocapitalize = "none"
		inputLayer.spellcheck = "false"
		self.paymentIDInputLayer = inputLayer
		// NOTE: Actually adding view.layer to div is deferred until a few lines down
		if (self._overridable_shouldNotDisplayPaymentIDFieldLayer() !== true) { // if we /should/ show
			div.appendChild(inputLayer)
			inputLayer.addEventListener(
				"keypress", // press, not up, to be able to control what goes into field
				function(event)
				{
					if (event.keyCode === 13) { // return key
						event.preventDefault() // do not let return/accept create a newline
						self._tryToCreateOrSaveContact()
						return false // do not let return/accept create a newline
					}
				}
			)
		}
		//
		if (self._overridable_shouldNotDisplayPaymentIDNoteLayer() !== true) {
			const messageLayer = commonComponents_forms.New_fieldAccessory_messageLayer(self.context)
			messageLayer.style.paddingTop = "7px"
			messageLayer.style.paddingBottom = "0"
			messageLayer.style.marginTop = "0"
			messageLayer.style.marginBottom = "0"
			messageLayer.innerHTML = "Unless you use an OpenAlias or integrated address, if you don't provide a payment ID, one will be generated."
			div.appendChild(messageLayer)
		}
		//
		self.form_containerLayer.appendChild(div)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		super.TearDown()
		//
		const self = this
		self.cancelAny_requestHandle_for_oaResolution()
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
		if (typeof self.resolving_activityIndicatorLayer !== 'undefined' && self.resolving_activityIndicatorLayer != null) {
			self.resolving_activityIndicatorLayer.style.display = "none"
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
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		const title = self._overridable_initial_leftBarButtonTitleString_orUndefinedForDefaultCancel()
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context, title)
		self.leftBarButtonView = view
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
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						self._saveButtonView_pressed()
					}
					return false
				}
			)
		}
		return view
	}
	// Runtime - Imperatives - Overridable
	_tryToCreateOrSaveContact()
	{
		throw `You must implement ${self.constructor.name}/_tryToCreateOrSaveContact.`
	}
	// Runtime - Imperatives - Submit button enabled state
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
	//
	// Runtime - Delegation - Nav bar btn events - Overridable but call on super
	//
	_saveButtonView_pressed()
	{
		const self = this
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
}
module.exports = ContactFormView