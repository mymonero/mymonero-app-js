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
			self.tableSection_containerLayer = containerLayer
			{
				self._setup_field_address()
				{
					containerLayer.appendChild(commonComponents_tables.New_separatorLayer())
				}
				self._setup_field_paymentID()
			}
			self.layer.appendChild(containerLayer)
		}
	}
	_setup_field_address()
	{
		const self = this
		const fieldLabelTitle = "Address"
		const value = self.contact.address
		const valueToDisplayIfValueNil = "N/A"
		const div = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			fieldLabelTitle, 
			value,
			self.context.pasteboard, 
			valueToDisplayIfValueNil
		)
		self.tableSection_containerLayer.appendChild(div)
	}
	_setup_field_paymentID()
	{
		const self = this
		const fieldLabelTitle = "Payment ID"
		const value = self.contact.payment_id
		const valueToDisplayIfValueNil = "N/A"
		const div = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			fieldLabelTitle, 
			value,
			self.context.pasteboard, 
			valueToDisplayIfValueNil
		)
		self.tableSection_containerLayer.appendChild(div)
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