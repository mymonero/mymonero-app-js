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
			self.topStackView = null
		}
		{ // self.layer
			const layer = self.layer
			layer.style.position = "relative"
			layer.style.left = "0"
			layer.style.top = "0"
			layer.style.width = "100%"
			layer.style.height = "100%"
			layer.style.overflow = "hidden" // because we don't want modals presented in self to create a scroll bar - bad thangs happen
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
				layer.style.overflow = "hidden" // we're going to say subviews are not allowed to hijack scroll - if they want to, they have to create their own wrapper - or else transitions cause scroll bar to appear
			}
			self.addSubview(view)
			self.stackViewStageView = view
		}
	}
	//
	//
	// Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
		//
		self.stackViews = null // TODO: iterate on them and call TearDown?
		self.topStackView = null
	}
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
	// Runtime - Accessors - Internal - UI & UI metrics - Shared
	//
	_animation_navigationPush_duration_ms()
	{
		return 390
	}
	_animation_navigationPush_easing()
	{
		return "easeOutCubic"
	}
	_styleLeftForUnderlyingViewAnimation()
	{
		return "-24%"
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
		}
		const isAnimated = 
			isAnimated_orTrue === true
				|| typeof isAnimated_orTrue === 'undefined' 
				|| isAnimated_orTrue == null 
			? true /* default true */ 
			: false
		if (self.isCurrentlyTransitioningAManagedView__Stack === true) {
			console.warn("⚠️  Asked to " + self.constructor.name + "/PushView but already self.isCurrentlyTransitioningAManagedView__Stack.")
			return
		}
		{
			self.isCurrentlyTransitioningAManagedView__Stack = true
		}
		function __trampolineFor_transitionEnded()
		{
			self.isCurrentlyTransitioningAManagedView__Stack = false
		}
		const old_topStackView = self.topStackView
		{ // make stackView the new top view
			stackView.navigationController = self
			self.stackViews.push(stackView)
			self.topStackView = stackView
		}
		{ // nav bar - do this BEFORE the nav operation, or old_topStackView layer will be nil as it may be torn down by consumer on new view's viewDidAppear (before this nav bar stuff would be called, if it were placed after)
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
		{ // and then actually present the view:
			const stackView_layer = stackView.layer
			const preExisting_boxShadow = stackView_layer.style.boxShadow
			if (isAnimated === true) { // prepare for animation
				old_topStackView.layer.style.position = "absolute"
				old_topStackView.layer.style.zIndex = "0"
				//
				stackView_layer.style.position = "absolute"
				stackView_layer.style.zIndex = "2" // 2 because we'll want to insert a semi-trans curtain view under the stackView_layer above the old_topStackView
				stackView_layer.style.left = `${self.stackViewStageView.layer.offsetWidth}px` // we use the stackViewStageView because it's already in the DOM and sized
				//
				if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
					const to_boxShadow = "0px 0px 12px 2px rgba(0,0,0,0.3)"
					stackView_layer.style.boxShadow = to_boxShadow
				}
			}
			self.stackViewStageView.addSubview(stackView)
			if (isAnimated === false) { // no need to animate anything - straight to end state
				_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
				__trampolineFor_transitionEnded() // must unlock fn
			} else {
				setTimeout(
					function()
					{ // wait til not blocked or animation can be choppy
						// I. Going to kick off animating old (btm) view out.
						// We don't particularly mind if the completion of I. and II. aren't synchronized
						Animate(
							old_topStackView.layer,
							{
								left: self._styleLeftForUnderlyingViewAnimation()
							},
							{
								duration: self._animation_navigationPush_duration_ms(),
								easing: self._animation_navigationPush_easing()
							}
						)
						// II. Now animate the new (top) view in.
						Animate(
							stackView_layer,
							{
								left: "0px"
							},
							{
								duration: self._animation_navigationPush_duration_ms(),
								easing: self._animation_navigationPush_easing(),
								complete: function()
								{
									stackView_layer.style.zIndex = "0"
									if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) { // since we didn't change it if this is not the case
										stackView_layer.style.boxShadow = preExisting_boxShadow // restore pre-existing, in case consumer had put one on
									}
									_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
									__trampolineFor_transitionEnded() // must unlock fn
								}
							}
						)
					}
				)
			}
		}		
		function _afterHavingFullyPresentedNewTopView_removeOldTopStackView()
		{
			if (typeof old_topStackView !== 'undefined' && old_topStackView !== null) { // as in stack views were set before this push was done
				if (isAnimated === true) {
					Animate(old_topStackView.layer, "stop", true) // jic the other animation finished first
				}
				old_topStackView.removeFromSuperview()
			}
		}
	}
	PopView(
		isAnimated_orTrue,
		fn
	)
	{
		fn = fn || function(err) {}
		const self = this
		if (self.stackViews.length == 0) {
			const errStr = "PopView called with 0 self.stackViews"
			const err = new Error(errStr)
			fn(err)
			throw errStr
		}
		const root_stackView = self.stackViews[0]
		if (self.topStackView.IsEqualTo(root_stackView) === true || self.stackViews.length === 1) {
			// TODO: assert self.stackViews.length === 1?
			// console.warn("⚠️  PopView called but already at root. (Probably fine.)")
			fn()
			return // bail
		}
		// TODO: assert self.stackView.length >= 2?
		const indexOf_justPrevious_stackView = self.stackViews.length - 2
		const justPrevious_stackView = self.stackViews[indexOf_justPrevious_stackView]
		//
		self.PopToView(
			justPrevious_stackView,
			indexOf_justPrevious_stackView,
			isAnimated_orTrue,
			fn
		)
	}
	PopToRootView(
		isAnimated_orTrue,
		fn
	)
	{
		fn = fn || function(err) {}
		const self = this
		if (self.stackViews.length == 0) {
			const errStr = "PopView called with 0 self.stackViews"
			const err = new Error(errStr)
			fn(err)
			throw errStr
		}
		const root_stackView = self.stackViews[0]
		if (self.topStackView.IsEqualTo(root_stackView) === true || self.stackViews.length === 1) {
			// TODO: assert self.stackViews.length === 1?
			// console.warn("⚠️  PopToRootView called but already at root. (Probably fine.)")
			fn()
			return // bail
		}
		self.PopToView(
			root_stackView,
			0,
			isAnimated_orTrue,
			fn
		)
	}
	PopToView(
		to_stackView,
		indexOf_to_stackView, // this is asked for so don't have to search the list
		isAnimated_orTrue,
		fn
	)
	{
		fn = fn || function(err) {}
		const self = this
		const isAnimated = 
			isAnimated_orTrue === true
				|| typeof isAnimated_orTrue === 'undefined' 
				|| isAnimated_orTrue == null 
			? true /* default true */ 
			: false
		if (to_stackView === null || typeof to_stackView === 'undefined') {
			const errStr = "StackNavigationView asked to PopToView nil to_stackView"
			const err = new Error(errStr)
			fn(err)
			throw errStr
		}
		if (self.isCurrentlyTransitioningAManagedView__Stack === true) {
			console.warn("⚠️  Asked to " + self.constructor.name + "/PopToView but already self.isCurrentlyTransitioningAManagedView__Stack.")
			fn()
			return
		}
		{
			self.isCurrentlyTransitioningAManagedView__Stack = true
		}
		function __trampolineFor_transitionEnded()
		{
			self.isCurrentlyTransitioningAManagedView__Stack = false
			fn()
		}
		const old_topStackView = self.topStackView
		// pre-insert the new top view, to_stackView, underneath the old_topStackView
		const subviewUUIDs = self.stackViewStageView.subviews.map(function(v) { return v.View_UUID() })
		// console.log("subviewUUIDs", subviewUUIDs)
		const indexOf_old_topStackView_inSubviews = subviewUUIDs.indexOf(old_topStackView.View_UUID())
		if (indexOf_old_topStackView_inSubviews === -1) {
			__trampolineFor_transitionEnded() // must unlock this function; calls 'fn' for us
			throw `Asked to PopToView ${to_stackView.View_UUID()} but old_topStackView UUID not found in UUIDs of ${self.stackViewStageView.Description()} subviews.`
		}
		{ // make to_stackView the new top view
			to_stackView.navigationController = self
			self.topStackView = to_stackView
		}
		{ // nav bar - do this BEFORE the nav operation, or old_topStackView layer will be nil as it may be torn down by consumer on new view's viewDidAppear (before this nav bar stuff would be called, if it were placed after)
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
		{ // transition
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
			if (isAnimated === false) { // no need to animate anything - straight to end state
				to_stackView.layer.style.left = "0" // and we must reset this in case it was self._styleLeftForUnderlyingViewAnimation()
				_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
				__trampolineFor_transitionEnded() // must unlock this function; called 'fn' for us
			} else { // else not return because we need to continue executing parent fn to get to btm, e.g. for model update and nav bar update
				//
				to_stackView.layer.style.left = self._styleLeftForUnderlyingViewAnimation() // in preparation for the animation - jic it wasn't set 
				//
				setTimeout(
					function()
					{ // wait til not blocked or we get choppiness
						// I. Kick off animating underlying (to/new) view back onto screen
						Animate(
							to_stackView.layer,
							{
								left: "0px"
							},
							{
								duration: self._animation_navigationPush_duration_ms(),
								easing: self._animation_navigationPush_easing()
							}
						)
						Animate(
							old_topStackView.layer,
							{
								left: `${self.stackViewStageView.layer.offsetWidth}px`
							},
							{
								duration: self._animation_navigationPush_duration_ms(),
								easing: self._animation_navigationPush_easing(),
								complete: function()
								{
									_afterHavingFullyPresentedNewTopView_removeOldTopStackView()
									__trampolineFor_transitionEnded() // must unlock this function; called 'fn' for us
								}
							}
						)
					}
				)
			}
		}
		function _afterHavingFullyPresentedNewTopView_removeOldTopStackView()
		{
			const didPopToRevealView_fn = to_stackView.navigationView_didPopToRevealView
			if (didPopToRevealView_fn && typeof didPopToRevealView_fn === 'function') {
				didPopToRevealView_fn.apply(to_stackView)
			}
			//
			// console.log("old_topStackView" , old_topStackView.Description())
			const willPopFrom_fn = old_topStackView.navigationView_viewIsBeingPoppedFrom
			if (willPopFrom_fn && typeof willPopFrom_fn === 'function') {
				willPopFrom_fn.apply(old_topStackView)
			}
			old_topStackView.removeFromSuperview()
		}
		{ // pop all views in model
			const stackViews_afterPop = self.stackViews.slice(0, indexOf_to_stackView + 1) // +1 as end is end idx not included in slice
			// TODO: set the popped views' navigation controllers to null ^
			// console.log("stackViews_afterPop", stackViews_afterPop)
			self.stackViews = stackViews_afterPop
			if (to_stackView.IsEqualTo(self.stackViews[self.stackViews.length - 1]) === false) {
				// we don't need to call __trampolineFor_transitionEnded here since we would have already triggered it in above isAnimated == false check branch
				throw `Popped to to_stackView ${to_stackView.Description()} at idx ${indexOf_to_stackView} but it was not the last of self.stackViews after pop all views until that idx.`
			}
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
	SetNavigationBarButtonsNeedsUpdate()
	{ // not animated
		const self = this
		self.navigationBarView.SetButtonsNeedsUpdate(
			self.topStackView, 
			self.stackViews, // needs to be passed
			false,
			undefined // ifAnimated_isFromRightNotLeft
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
	TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState(isAnimated)
	{
		const self = this
		self.PopToRootView(isAnimated)
	}
}
module.exports = StackNavigationView