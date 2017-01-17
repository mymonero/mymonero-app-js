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
		{ // form
			const containerLayer = document.createElement("div")
			self.form_containerLayer = containerLayer
			{
				self._setup_field_fullname()
				self._setup_field_emoji()
				self._setup_field_address()
				self._setup_field_paymentID()
			}
			self.layer.appendChild(containerLayer)
		}
	}
	_setup_field_fullname()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
		div.style.width = `calc(100% - 75px - ${div.style.paddingLeft} - ${div.style.paddingRight})`
		div.style.display = "inline-block"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("Name")
			div.appendChild(labelLayer)
		}
		{
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "Something memorable"
			})
			self.fullnameInputLayer = valueLayer
			{
				valueLayer.addEventListener(
					"keyup",
					function(event)
					{
						if (event.keyCode === 13) { // return key
							self._tryToCreateContact()
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
	_setup_field_emoji()
	{
		const self = this
		const inUseEmojis = self.context.contactsListController.GivenBooted_CurrentlyInUseEmojis()
		const emoji = emoji_selection.EmojiWhichIsNotAlreadyInUse(inUseEmojis)
		const value = emoji // to retain code portability
		//					
		const div = commonComponents_forms.New_fieldContainerLayer()
		div.style.width = "75px"
		div.style.display = "inline-block"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("Emoji")
		
			div.appendChild(labelLayer)
		}
		{ // TODO: make this into a custom picker
			const valueLayer = document.createElement("input")
			{
				valueLayer.type = "text"
				valueLayer.value = value
				valueLayer.style.display = "inline-block"
				valueLayer.style.height = "30px"
				valueLayer.style.width = `calc(100% - 4px)`
				valueLayer.style.border = "1px inset #222"
				valueLayer.style.borderRadius = "4px"
		 		valueLayer.style.float = "left"
				valueLayer.style.textAlign = "left"
				valueLayer.style.fontSize = "14px"
				valueLayer.style.color = "#ccc"
				valueLayer.style.backgroundColor = "#444"
				valueLayer.style.padding = "0"
				valueLayer.style.fontFamily = "monospace"
			}
			self.emojiInputLayer = valueLayer
			div.appendChild(valueLayer)
		}
		{ // to get the height
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_field_address()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
		div.style.width = `calc(100%)`
		div.style.display = "inline-block"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("Address")
			div.appendChild(labelLayer)
		}
		{
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "Enter integrated address or OpenAlias"
			})
			self.addressInputLayer = valueLayer
			{
				valueLayer.addEventListener(
					"keyup",
					function(event)
					{
						if (event.keyCode === 13) { // return key
							self._tryToCreateContact()
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
	_setup_field_paymentID()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
		div.style.width = `calc(100%)`
		div.style.display = "inline-block"
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("Payment ID")
			div.appendChild(labelLayer)
		}
		{
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "Optional"
			})
			self.paymentIDInputLayer = valueLayer
			{
				valueLayer.addEventListener(
					"keyup",
					function(event)
					{
						if (event.keyCode === 13) { // return key
							self._tryToCreateContact()
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
		{
			const layer = document.createElement("span")
			{
				layer.innerHTML = "If you don't provide a payment ID, one will be generated."
				layer.style.width = "100%"
				layer.style.fontSize = "14px"
				layer.style.fontWeight = "bold"
				layer.style.color = "#ccc"
				layer.style.fontFamily = "monospace"
				//
				layer.style.wordBreak = "keep-all" // to get the text to wrap only at the word, not letter
			}
			div.appendChild(layer)
		}
		self.form_containerLayer.appendChild(div)
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
module.exports = ContactFormView