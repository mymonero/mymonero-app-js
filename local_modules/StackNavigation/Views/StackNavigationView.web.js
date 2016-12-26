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
		{ // initial state
			self.uuid = uuidV1()
			//
			self.stackViews = []
			self.topStackView = null
		}
		{ // self.layer
			const layer = self.layer
			layer.style.position = "relative"
			layer.style.left = "0"
			layer.style.top = "0"
			layer.style.width = "100%"
			layer.style.height = "100%"
		}
		{ // navigationBarView
			const NavigationBarView = require('./NavigationBarView.web')
			const view = new NavigationBarView({
				navigationController: self
			}, self.context)
			self.addSubview(view)
			self.navigationBarView = view
		}
		{ // stackViewStageView
			const view = new View({}, self.context)
			{
				const layer = view.layer
				layer.style.zIndex = "1"
				layer.style.position = "absolute"
				layer.style.left = "0"
				layer.style.top = "0"
				layer.style.width = "100%"
				layer.style.height = "100%"
				layer.style.overflowY = "hidden" // we're going to say subviews are not allowed to hijack scroll - if they want to, they have to create their own wrapper
			}
			self.addSubview(view)
			self.stackViewStageView = view
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
		const self = this
		//
		return self.navigationBarView.NavigationBarHeight()
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
		const old_topStackView = self.topStackView
		{ // remove existing
			if (old_topStackView !== null) { 
				old_topStackView.removeFromSuperview() 
				old_topStackView.navigationController = null
			}
			if (self.stackViews.length > 0) {
				self.stackViews.forEach(
					function(view, i)
					{
						if (view.navigationController === self) { // just to make sure it's actually self we're replacing with nil…
							view.navigationController = null
						}
					}
				)
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
				self.topStackView.navigationController = self // this way the view can ask the navigation controller for the top margin in viewWillAppear
				self.stackViewStageView.addSubview(self.topStackView) 
			}
			{
				const isAnimated = false
				const ifAnimated_isFromRightNotLeft = undefined
				self.navigationBarView.SetTopStackView(
					self.topStackView, 
					old_topStackView,
					isAnimated, 
					ifAnimated_isFromRightNotLeft
				)
			}
		}
	}
	PushView(stackView)
	{
		const self = this
		console.log("push... ", stackView)
	}
}
module.exports = StackNavigationView