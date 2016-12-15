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
//
class PasswordEntryView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
		//
		self._setup_views()
		self._setup_startObserving()
		//
	}
	_setup_views()
	{
		const self = this
		self.layer.style.position = "fixed"
		self.layer.style.top = "0"
		self.layer.style.left = "0"
		self.layer.style.width = "100%"
		self.layer.style.height = "100%"
		self.layer.style.zIndex = "9999"
		self.layer.style.border = "0px solid orange" // for debug
		self.layer.style.background = "#ccc"
		self.layer.innerHTML = "<h3>Enter password:</h3>"
	}
	_setup_startObserving()
	{
		const self = this
	}
	//
	//
	// Runtime - Accessors - Products
	//
	PasswordEnteredInView()
	{
		const self = this
		// TODO: read this directly from the UI,
		// v-- mocked for now
		return "a much stronger password than before"
	}
	PasswordTypeSelectedInView()
	{
		const self = this
		// TODO: read this directly from the UI,
		// v-- mocked for now
		return self.passwordController.AvailableUserSelectableTypesOfPassword().FreeformStringPW
	}
	//
	//
	// Runtime - Accessors - UI state
	//	
	IsPresented()
	{
		const self = this
		const v = typeof self.superview !== "undefined" && self.superview !== null
		//
		return v ? true : false
	}
	//
	//
	// Runtime - Imperatives - Interface - Showing the view
	//

	GetUserToEnterExistingPasswordWithCB(
		inSuperview,
		existingPasswordType,
		enterPassword_cb
		// TODO: add flag for whether this is for a change pw
	)
	{
		const self = this
		const password = self.PasswordEnteredInView()
		const didCancel = false // TODO: to be tied into window dismissal… how?
		
		// TODO: verify that this change is legal according to current mode/state
		// TODO: clear validation message
		// TODO: put view into specific mode
		
		// TODO: maybe hold onto enterPassword_cb on self
		// in case a cancel comes in - but if the user enters their PW fully
		// or hits submit then this function, if waiting, gets released – same for enterPasswordAndType_cb.
		// we should also set a pw entry mode and corroborate that with which _cb is stored
		
		self.showInView(inSuperview)
		
		enterPassword_cb(
			didCancel ? didCancel : null,
			password
		)
	}
	GetUserToEnterNewPasswordAndTypeWithCB(
		inSuperview,
		enterPasswordAndType_cb
		// TODO: add flag for whether this is for a change pw
	)
	{
		const self = this
		const password = self.PasswordEnteredInView()
		const passwordType = self.PasswordTypeSelectedInView()
		const didCancel = false // TODO: to be tied into window dismissal… how?
		
		// TODO: verify that this change is legal according to current mode/state
		// TODO: clear validation message
		// TODO: put view into specific mode		
		
		// TODO: maybe hold onto enterPasswordAndType_cb on self
		// in case a cancel comes in - but if the user enters their PW fully
		// or hits submit then this function, if waiting, gets released – same for enterPassword_cb.
		// we should also set a pw entry mode and corroborate that with which _cb is stored
		
		// TODO: check here if already showing - if already, transition to new state with animation rather than w/o and do not call .showInView
		self.showInView(inSuperview)
		
		enterPasswordAndType_cb(
			didCancel ? didCancel : null,
			password,
			passwordType
		)
	}
	//
	//
	// Runtime - Imperatives - Interface - Dismissing the view
	//
	Dismiss()
	{
		const self = this
		if (typeof self.superview === 'undefined' || self.superview === null) {
			console.error("Can't  dismiss password entry view as not in a superview")
			return
		}
		// TODO: animation
		self.viewWillDisappear()
		self.removeFromSuperview()
	}
	//
	//
	// Runtime - Imperatives - Internal - Showing the view - Utilities
	//
	showInView(superview)
	{
		const self = this
		self.viewWillAppear()
		superview.addSubview(self)
	}	
	//
	//
	// Runtime - Delegation - Visibility cycle
	//
	viewWillAppear()
	{
		const self = this
		console.log("Password entry view will appear")
	}
	viewWillDisappear()
	{
		const self = this
		console.log("Password entry view will disappear")
	}
}
module.exports = PasswordEntryView
