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
const uuidV1 = require('uuid/v1')
//
const View = require('../../Views/View.web')
//
class StackNavigationView extends View
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
		self.uuid = uuidV1()
		//
		self.stackViews = []
		self.topStackView = null
		//
		self.layer.style.width = "100%"
		self.layer.style.height = "100%"
		{ // stackViewStageView
			const view = new View({}, self.context)
			{
				const layer = view.layer
				layer.style.zIndex = "1"
				layer.style.width = "100%"
				layer.style.height = "100%"
				//
				layer.style.backgroundColor = "red"
			}
			self.addSubview(view)
			self.stackViewStageView = view
		}
		{ // navigationBarView
			const view = new View({}, self.context) // TODO: make this into a class
			{
				const layer = view.layer
				layer.style.position = "absolute"
				layer.style.zIndex = "9"
				layer.style.width = "100%"
				layer.style.height = `{self.NavigationBarHeight()}px`
				layer.style.top = "0px"
				layer.style.left = "0px"
				//
				layer.style.backgroundColor = "blue"
			}
			self.addSubview(view)
			self.navigationBarView = view
		}
	}
	//
	//
	// Runtime - Accessors - Public - Events
	//

	//
	//
	// Runtime - Accessors - Public - UI Metrics
	//
	NavigationBarHeight()
	{
		return 44
	}
	//
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Shared
	//
	idPrefix()
	{
		const self = this
		//
		return "StackNavigationView" + "-" + self.uuid
	}
	//
	//
	// Runtime - Imperatives 
	//
	SetStackViews(to_stackViews)
	{
		const self = this
		{ // remove existing
			if (self.topStackView !== null) {
				self.topStackView.removeFromSuperview() 
			}
		}
		{ // set new state (while freeing all existing)
			self.stackViews = to_stackViews || []
			{
				if (to_stackViews.length > 0) {
					const firstStackView = to_stackViews[0]
					self.topStackView = firstStackView
				} else {
					self.topStackView = null
				}
			}
		}
		{ // config UI with new state
			if (self.topStackView !== null) {
				self.stackViewStageView.addSubview(self.topStackView) 
			}
			{ // TODO: tell the nav bar that the top stack view updated w/o animation
				
			}
		}
	}
}
module.exports = StackNavigationView