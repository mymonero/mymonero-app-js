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
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
//
class AddWallet_LandingScreenView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		{
			self.wizardController = self.options.wizardController
			if (self.wizardController == null || typeof self.wizardController === 'undefined') {
				throw self.constructor.name + " requires a self.wizardController"
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self._setup_views()
		self._setup_startObserving()
	}
	_setup_views()
	{
		const self = this
		self.__setup_self_layer()
	}
	__setup_self_layer()
	{
		const self = this
		//
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%"
		layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		layer.style.padding = "0" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
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
	_setup_startObserving()
	{
		const self = this
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
		//
		self.wizardController = null // nil ref to ensure free
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		const self = this
		throw "override Navigation_Title in " + self.constructor.name
		// return ""
	}
	//
	//
	// Runtime - Imperatives - 
	//

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
module.exports = AddWallet_LandingScreenView
