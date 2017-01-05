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
const Animate = require('velocity-animate')
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
			self.stackViews_scrollOffsetsOnPushedFrom_byViewUUID = {} // [ String: [ String(Left|Top): Number ] ]
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
			{
				view.on(
					view.EventName_backButtonTapped(),
					function()
					{
						self.PopView(true) // animated
					}
				)
			}
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
	_animationDuration_ms_navigationPush()
	{
		return 200
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
				const trueIfPoppingToRoot = false
				self.navigationBarView.SetTopStackView(
					self.topStackView, 
					old_topStackView,
					isAnimated, 
					ifAnimated_isFromRightNotLeft,
					trueIfPoppingToRoot // not popping
				)
			}
		}
	}
	PushView(
		stackView,
		isAnimated_orTrue // defaults to true if you don't pass anything here
	)
	{
		const self = this
		if (stackView === null || typeof stackView === 'undefined') {
			throw "StackNavigationView asked to PushView nil stackView"
			return
		}
		const isAnimated = 
			isAnimated_orTrue === true
			 || typeof isAnimated_orTrue === 'undefined' 
			 || isAnimated_orTrue == null 
			? true /* default true */ 
			: false
		const old_topStackView = self.topStackView
		{ // make stackView the new top view
			stackView.navigationController = self
			self.stackViews.push(stackView)
			self.topStackView = stackView
		}
		{ // and then actually present the view:
			const stackView_layer = stackView.layer
			if (isAnimated === true) { // prepare for animation
				old_topStackView.layer.style.position = "absolute"
				old_topStackView.layer.style.zIndex = "0"
				//
				stackView_layer.style.position = "absolute"
				stackView_layer.style.zIndex = "2" // 2 because we'll want to insert a semi-trans curtain view under the stackView_layer above the old_topStackView
				stackView_layer.style.left = `${self.stackViewStageView.layer.offsetWidth}px` // we use the stackViewStageView because it's already in the DOM and sized
			}
			self.stackViewStageView.addSubview(stackView)
			if (isAnimated === false) { // no need to animate anything - straight to end state
				_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
				return
			}
			setTimeout(
				function()
				{ // wait til not blocked
					Animate(
						stackView_layer,
						{
							left: "0px"
						},
						{
							duration: self._animationDuration_ms_navigationPush(),
							easing: "ease-in-out",
							complete: function()
							{
								stackView_layer.style.zIndex = "0" 
								_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
							}
						}
					)
				}
			)
		}		
		function _afterHavingFullyPresentedNewTopView_removeOldTopStackView()
		{
			{ // before we remove the old_topStackView, let's record its styling which would be lost on removal like scroll offset 
				self.stackViews_scrollOffsetsOnPushedFrom_byViewUUID[old_topStackView.View_UUID()] =
				{
					Left: old_topStackView.layer.scrollLeft,
					Top: old_topStackView.layer.scrollTop
				}
			}
			old_topStackView.removeFromSuperview()
			old_topStackView.navigationController = null // is this necessary? if not, maybe we should just set navigationController=self in SetStackViews's stackViews.forEach where we nil navigationController
		}
		{ // nav bar
			const ifAnimated_isFromRightNotLeft = true // because we're pushing
			const trueIfPoppingToRoot = false // cause we're pushing
			self.navigationBarView.SetTopStackView(
				self.topStackView, 
				old_topStackView,
				isAnimated, 
				ifAnimated_isFromRightNotLeft,
				trueIfPoppingToRoot
			)
		}
	}
	PopView(
		isAnimated_orTrue
	)
	{
		const self = this
		if (self.stackViews.length == 0) {
			throw "PopView called with 0 self.stackViews"
			return
		}
		const root_stackView = self.stackViews[0]
		if (self.topStackView.IsEqualTo(root_stackView) === true || self.stackViews.length === 1) {
			// TODO: assert self.stackViews.length === 1?
			console.warn("⚠️  PopView called but already at root.")
			return // bail
		}
		// TODO: assert self.stackView.length >= 2?
		const indexOf_justPrevious_stackView = self.stackViews.length - 2
		const justPrevious_stackView = self.stackViews[indexOf_justPrevious_stackView]
		//
		self.PopToView(
			justPrevious_stackView,
			indexOf_justPrevious_stackView,
			isAnimated_orTrue
		)
	}
	PopToRootView(
		isAnimated_orTrue
	)
	{
		const self = this
		if (self.stackViews.length == 0) {
			throw "PopView called with 0 self.stackViews"
			return
		}
		const root_stackView = self.stackViews[0]
		if (self.topStackView.IsEqualTo(root_stackView) === true || self.stackViews.length === 1) {
			// TODO: assert self.stackViews.length === 1?
			console.warn("⚠️  PopToRootView called but already at root.")
			return // bail
		}
		self.PopToView(
			root_stackView,
			0,
			isAnimated_orTrue
		)
	}
	PopToView(
		to_stackView,
		indexOf_to_stackView, // this is asked for so don't have to search the list
		isAnimated_orTrue
	)
	{
		const self = this
		const isAnimated = 
			isAnimated_orTrue === true
			 || typeof isAnimated_orTrue === 'undefined' 
			 || isAnimated_orTrue == null 
			? true /* default true */ 
			: false
		if (to_stackView === null || typeof to_stackView === 'undefined') {
			throw "StackNavigationView asked to PopToView nil to_stackView"
			return
		}
		const old_topStackView = self.topStackView
		{ // make to_stackView the new top view
			to_stackView.navigationController = self
			self.topStackView = to_stackView
		}
		{ // pre-insert the new top view, to_stackView, underneath the old_topStackView
			const subviewUUIDs = self.stackViewStageView.subviews.map(function(v) { return v.View_UUID() })
			// console.log("subviewUUIDs", subviewUUIDs)
			const indexOf_old_topStackView_inSubviews = subviewUUIDs.indexOf(old_topStackView.View_UUID())
			if (indexOf_old_topStackView_inSubviews === -1) {
				throw `Asked to PopToView ${to_stackView.View_UUID()} but old_topStackView UUID not found in UUIDs of ${self.Description()} subviews.`
				return
			}
			// console.log("indexOf_old_topStackView_inSubviews" , indexOf_old_topStackView_inSubviews)
			if (isAnimated === true) { // prepare for animation
				old_topStackView.layer.style.position = "absolute"
				old_topStackView.layer.style.zIndex = "2"
				//
				to_stackView.layer.style.position = "absolute"
				to_stackView.layer.style.zIndex = "0" // because we want to make sure it goes under the current top stack view
			}
			self.stackViewStageView.insertSubview(
				to_stackView,
				indexOf_old_topStackView_inSubviews
			)
			{ // and reconstitute lost/held styling such as scroll offset
				const to_stackView_View_UUID = to_stackView.View_UUID()
				const to_stackView_scrollOffsetsOnPushedFrom = self.stackViews_scrollOffsetsOnPushedFrom_byViewUUID[to_stackView_View_UUID]
				{
					const cached_to_stackView__Left = to_stackView_scrollOffsetsOnPushedFrom.Left
					const cached_to_stackView__Top = to_stackView_scrollOffsetsOnPushedFrom.Top
					to_stackView.layer.scrollLeft = cached_to_stackView__Left
					to_stackView.layer.scrollTop = cached_to_stackView__Top
				}
				delete self.stackViews_scrollOffsetsOnPushedFrom_byViewUUID[to_stackView_View_UUID] // free
			}
			if (isAnimated === false) { // no need to animate anything - straight to end state
				_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
				return
			}
			setTimeout(
				function()
				{ // wait til not blocked
					Animate(
						old_topStackView.layer,
						{
							left: `${self.stackViewStageView.layer.offsetWidth}px`
						},
						{
							duration: self._animationDuration_ms_navigationPush(),
							easing: "ease-in-out",
							complete: function()
							{
								_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
							}
						}
					)
				}
			)
		}		
		function _afterHavingFullyPresentedNewTopView_removeOldTopStackView()
		{
			// console.log("old_topStackView" , old_topStackView.Description())
			old_topStackView.removeFromSuperview()
			old_topStackView.navigationController = null // is this necessary? if not, maybe we should just set navigationController=self in SetStackViews's stackViews.forEach where we nil navigationController
		}
		{ // pop all views 
			const popped_stackViews = self.stackViews.slice(0, indexOf_to_stackView + 1) // +1 as end is end idx not included in slice
			// console.log("popped_stackViews", popped_stackViews)
			self.stackViews = popped_stackViews
			if (to_stackView.IsEqualTo(self.stackViews[self.stackViews.length - 1]) === false) {
				throw `Popped to to_stackView ${to_stackView.Description()} at idx ${indexOf_to_stackView} but it was not the last of self.stackViews after pop all views until that idx.`
				return 
			}
		}
		{
			const ifAnimated_isFromRightNotLeft = false // from left, because we're popping
			const trueIfPoppingToRoot = indexOf_to_stackView === 0
			self.navigationBarView.SetTopStackView(
				self.topStackView, 
				old_topStackView,
				isAnimated, 
				ifAnimated_isFromRightNotLeft,
				trueIfPoppingToRoot
			)
		}
	}
	//
	//
	// Runtime - Imperatives - Navigation bar updates
	//
	SetNavigationBarTitleNeedsUpdate()
	{
		const self = this
		self.navigationBarView.SetTitleNeedsUpdate(
			self.topStackView
		)
	}
	//
	//
	// Runtime - Delegation - Implementation/support for TabBarAndContentView events
	//
	TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected()
	{
		const self = this
		self.PopToRootView()
	}
}
module.exports = StackNavigationView