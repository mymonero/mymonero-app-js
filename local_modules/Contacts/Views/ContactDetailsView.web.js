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
//
class ContactDetailsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		const self = this 
		{
			self.contact = self.options.contact
			if (typeof self.contact === 'undefined' || !self.contact) {
				throw self.constructor.name + " requires a self.options.contact"
				return
			}
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
		{
			const containerLayer = document.createElement("div")
			{
				containerLayer.style.border = "1px solid #888"
				containerLayer.style.borderRadius = "5px"
			}
						
			// TODO: encapsulate the following copyable long string value component_fieldContainerLayer in table

			{ // Address
				const fieldLabelTitle = "Address"
				const valueToDisplayIfValueNil = "N/A"
				const value = self.contact.address__XMR
				const isValueNil = value === null || typeof value === 'undefined' || value === ""
				const valueToDisplay = isValueNil === false ? value : valueToDisplayIfValueNil
				const div = commonComponents_tables.New_fieldContainerLayer()
				{
					{ // left
						const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer(fieldLabelTitle)
						div.appendChild(labelLayer)
					}
					{ // right
						const buttonLayer = commonComponents_tables.New_copyButton_aLayer(
							value,
							isValueNil === false ? true : false,
							self.context.pasteboard
						)
						buttonLayer.style.float = "right"
						div.appendChild(buttonLayer)
					}
					{ // to put the tx hash on the next line in the UI to make way for the COPY button
						const clearingBreakLayer = document.createElement("br")
						clearingBreakLayer.clear = "both"
						div.appendChild(clearingBreakLayer)
					}
					const valueLayer = commonComponents_tables.New_fieldValue_labelLayer("" + valueToDisplay)
					{ // special case
						valueLayer.style.float = "left"
						valueLayer.style.textAlign = "left"
						//
						valueLayer.style.width = "270px"
						//
						// valueLayer.style.webkitUserSelect = "all" // commenting for now as we have the COPY button
					}
					div.appendChild(valueLayer)
				}
				div.appendChild(commonComponents_tables.New_clearingBreakLayer()) // preserve height; better way?
				containerLayer.appendChild(div)
			}
			{
				containerLayer.appendChild(commonComponents_tables.New_separatorLayer())
			}
			{ // Payment ID
				const fieldLabelTitle = "Payment ID"
				const valueToDisplayIfValueNil = "N/A"
				const value = self.contact.payment_id
				const isValueNil = value === null || typeof value === 'undefined' || value === ""
				const valueToDisplay = isValueNil === false ? value : valueToDisplayIfValueNil
				const div = commonComponents_tables.New_fieldContainerLayer()
				{
					{ // left
						const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer(fieldLabelTitle)
						div.appendChild(labelLayer)
					}
					{ // right
						const buttonLayer = commonComponents_tables.New_copyButton_aLayer(
							value,
							isValueNil === false ? true : false,
							self.context.pasteboard
						)
						buttonLayer.style.float = "right"
						div.appendChild(buttonLayer)
					}
					{ // to put the tx hash on the next line in the UI to make way for the COPY button
						const clearingBreakLayer = document.createElement("br")
						clearingBreakLayer.clear = "both"
						div.appendChild(clearingBreakLayer)
					}
					const valueLayer = commonComponents_tables.New_fieldValue_labelLayer("" + valueToDisplay)
					{ // special case
						valueLayer.style.float = "left"
						valueLayer.style.textAlign = "left"
						//
						valueLayer.style.width = "270px"
						//
						// valueLayer.style.webkitUserSelect = "all" // commenting for now as we have the COPY button
					}
					div.appendChild(valueLayer)
				}
				div.appendChild(commonComponents_tables.New_clearingBreakLayer()) // preserve height; better way?
				containerLayer.appendChild(div)
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
		const self = this
		var title = ""
		const emoji = self.contact.emoji
		if (typeof emoji !== 'undefined' && emoji) {
			title += emoji + " "
		}
		title += self.contact.fullname
		//
		return title
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
module.exports = ContactDetailsView