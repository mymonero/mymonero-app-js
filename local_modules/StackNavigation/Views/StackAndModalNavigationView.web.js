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
const Animate = require('velocity-animate')
//
const StackNavigationView = require('./StackNavigationView.web')
//
class StackAndModalNavigationView extends StackNavigationView
{
	setup()
	{
		super.setup()
		//
		const self = this
		{ // initial state
			self.modalViews = []
			self.topModalView = null
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
		self.modalViews = null
		self.topModalView = null
	}
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Shared
	//
	_animation_modalPresent_duration_ms()
	{
		return 630
	}
	_animation_modalPresent_easing()
	{
		return "easeOutQuint"
	}
	_animation_modalDismiss_duration_ms()
	{
		return 130
	}
	_animation_modalDismiss_easing()
	{
		return "easeInSine"
	}
	//
	//
	// Runtime - Imperatives - Modal presentation & dismissal
	//
	PresentView(
		modalView,
		isAnimated_orTrue // defaults to true if you don't pass anything here
	)
	{
		const self = this
		if (modalView === null || typeof modalView === 'undefined') {
			throw "StackNavigationView asked to PresentView nil modalView"
		}
		const isAnimated =
			isAnimated_orTrue === true
				|| typeof isAnimated_orTrue === 'undefined'
				|| isAnimated_orTrue == null
			? true /* default true */
			: false
		//
		const old_topStackView = self.topStackView
		if (typeof old_topStackView === 'undefined' || old_topStackView == null) {
			throw self.constructor.name + " PresentView currently expects there to be an old_topStackView"
		}
		if (self.isCurrentlyTransitioningAManagedView__Modal === true) {
			console.warn("⚠️  Asked to " + self.constructor.name + "/PresentView but already self.isCurrentlyTransitioningAManagedView__Modal. Deferring execution.")
			setTimeout(
				function()
				{	// NOTE/TODO: There's probably a better way to do this (via a stack) which will not only prevent possibility of infinite loops
					// but retain call order. Not sure whether it's a big enough problem to merit that yet though
					self.PresentView(
						modalView,
						isAnimated_orTrue
					)
				}, self._animation_modalPresent_duration_ms() // just a guess
			)
			return
		}
		{
			self.isCurrentlyTransitioningAManagedView__Modal = true
		}
		function __trampolineFor_transitionEnded()
		{
			self.isCurrentlyTransitioningAManagedView__Modal = false
		}
		const old_topModalView = self.topModalView
		const old_topModalOrStackView = old_topModalView ? old_topModalView : old_topStackView
		const old_topModalOrStackView_wasModal = old_topModalView ? true : false
		//
		{ // make modalView the new top view
			modalView.modalParentView = self
			self.modalViews.push(modalView)
			self.topModalView = modalView
		}
		{ // and then actually present the view:
			const modalView_layer = modalView.layer
			const preExisting_boxShadow = modalView_layer.style.boxShadow
			if (isAnimated === true) { // prepare for animation
				if (typeof old_topModalView !== 'undefined' && old_topModalView) {
					old_topModalView.layer.style.position = "absolute"
					old_topModalView.layer.style.zIndex = "9"
				}
				modalView_layer.style.position = "absolute"
				modalView_layer.style.zIndex = "20" // 2 because we'll want to insert a semi-trans curtain view under the modalView_layer above the old_topStackView
				modalView_layer.style.top = `${ self.layer.offsetHeight }px`
				//
				if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
					const to_boxShadow = "0px 0px 100px 2px rgba(0,0,0,0.5)"
					modalView_layer.style.boxShadow = to_boxShadow
				}
			}
			{ // manually simulate a view visibility events
				old_topStackView.viewWillDisappear()
			}
			self.addSubview(modalView)
			{ // manually simulate a view visibility events
				old_topStackView.viewDidDisappear()
			}
			if (isAnimated === false) { // no need to animate anything - straight to end state
				_afterHavingFullyPresentedNewModalView_removeOldTopModalView()
				__trampolineFor_transitionEnded()
			} else {
				setTimeout(
					function()
					{ // wait til not blocked or animation will be choppy
						Animate(
							modalView_layer,
							{
								top: "0px"
							},
							{
								duration: self._animation_modalPresent_duration_ms(),
								easing: self._animation_modalPresent_easing(),
								complete: function()
								{
									modalView_layer.style.zIndex = "10"
									if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) { // since we didn't change it if this is not the case
										modalView_layer.style.boxShadow = preExisting_boxShadow // restore pre-existing, in case consumer had put one on
									}
									_afterHavingFullyPresentedNewModalView_removeOldTopModalView()
									__trampolineFor_transitionEnded()
								}
							}
						)
					}
				)
			}
		}
		function _afterHavingFullyPresentedNewModalView_removeOldTopModalView()
		{
			if (old_topModalView && typeof old_topModalView !== 'undefined') {
				// before we remove the old_topModalOrStackView, let's record its styling if it's a modal, which would be lost on removal like scroll offset
				old_topModalView.removeFromSuperview()
			}
		}
	}
	DismissTopModalView(
		isAnimated_orTrue,
		fn
	)
	{
		const self = this
		const numberOf_modalViews = self.modalViews.length
		if (numberOf_modalViews == 0) {
			throw "DismissTopModalView called with 0 self.modalViews"
		}
		if (numberOf_modalViews == 1) { // then pop all modals
			self.DismissModalViewsToView(
				null,
				isAnimated_orTrue,
				fn
			)
			return
		}
		const indexOf_justPrevious_modalView = numberOf_modalViews - 2
		const justPrevious_modalView = self.modalViews[indexOf_justPrevious_modalView]
		self.DismissModalViewsToView(
			justPrevious_modalView,
			isAnimated_orTrue,
			fn
		)
	}
	DismissModalViewsToView(
		to_modalView_orNullForTopStackView,
		isAnimated_orTrue,
		fn
	)
	{
		const self = this
		fn = fn || function() {}
		const isAnimated =
			isAnimated_orTrue === true
				|| typeof isAnimated_orTrue === 'undefined'
				|| isAnimated_orTrue == null
			? true /* default true */
			: false
		const topStackView = self.topStackView
		if (typeof topStackView === 'undefined' || topStackView == null) {
			throw self.constructor.name + " DismissModalViewsToView currently expects there to be an topStackView"
		}
		const old_topModalView = self.topModalView
		if (typeof old_topModalView === 'undefined' || old_topModalView == null) {
			// throw self.constructor.name + " DismissModalViewsToView requires there to be a modal view"
			// console.warn("⚠️  DismissModalViewsToView called but already at root. (Probably fine.)")
			fn()
			return // just bailing
		}
		if (self.isCurrentlyTransitioningAManagedView__Modal === true) {
			console.warn("⚠️  Asked to " + self.constructor.name + "/PresentView but already self.isCurrentlyTransitioningAManagedView__Modal. Deferring execution.")
			setTimeout(
				function()
				{	// NOTE/TODO: There's probably a better way to do this (via a stack) which will not only prevent possibility of infinite loops
					// but retain call order. Not sure whether it's a big enough problem to merit that yet though
					self.DismissModalViewsToView(
						to_modalView_orNullForTopStackView,
						isAnimated_orTrue,
						fn
					)
				}, self._animation_modalDismiss_duration_ms() // just a guess
			)
			return
		}
		{
			self.isCurrentlyTransitioningAManagedView__Modal = true
		}
		function __trampolineFor_transitionEnded()
		{
			self.isCurrentlyTransitioningAManagedView__Modal = false
		}
		function _afterHavingFullyPresentedNewTopView_removeOldTopModalView()
		{
			// console.log("old_topModalView" , old_topModalView.Description())
			old_topModalView.removeFromSuperview()
			old_topModalView.modalParentView = null
		}
		if (to_modalView_orNullForTopStackView === null) { // pop all modalViews to top stackView
			function __afterHavingFullyDismissedToTopStackView_cleanUpAndCallBack()
			{
				_afterHavingFullyPresentedNewTopView_removeOldTopModalView()
				{ // manually simulate a view visibility events
					topStackView.viewDidAppear() // NOTE: topStackView
					// this is the first case where we'll call this - the other is when dismissing a modal to modal under
					const didDismissModalToRevealView_fn = topStackView.navigationView_didDismissModalToRevealView
					if (didDismissModalToRevealView_fn && typeof didDismissModalToRevealView_fn === 'function') {
						didDismissModalToRevealView_fn.apply(topStackView)
					}
				}
				__trampolineFor_transitionEnded()
				fn()
			}
			old_topModalView.layer.style.position = "absolute"
			old_topModalView.layer.style.zIndex = "9"
			//
			self.modalViews.forEach(
				function(modalView, i)
				{
					modalView.modalParentView = null
				}
			)
			self.modalViews = [] // free
			self.topModalView = null
			//
			if (isAnimated === false) { // no need to animate anything - straight to end state
				__afterHavingFullyDismissedToTopStackView_cleanUpAndCallBack()
				return
			}
			setTimeout(
				function()
				{ // wait til not blocked or we get choppiness
					Animate(
						old_topModalView.layer,
						{
							top: `${self.layer.offsetHeight}px`
						},
						{
							duration: self._animation_modalDismiss_duration_ms(),
							easing: self._animation_modalDismiss_easing(),
							complete: function()
							{
								__afterHavingFullyDismissedToTopStackView_cleanUpAndCallBack()
							}
						}
					)
				}
			)
			//
			return
		} // ^-- and then exit method early
		// or, dismissing to a modal underneath…
		const numberOf_modalViews = self.modalViews.length
		const to_modalView = to_modalView_orNullForTopStackView // because we know now it's not null
		var indexOf_to_modalView = -1 // to find:
		for (var i = 0 ; i < numberOf_modalViews ; i++) {
			const modalView = self.modalViews[i]
			if (modalView.IsEqualTo(to_modalView) === true) {
				indexOf_to_modalView = i
				break
			}
		}
		if (indexOf_to_modalView === -1) {
			__trampolineFor_transitionEnded()
			throw "to_modalView not found in self.modalViews"
		}
		function __afterHavingFullyDismissedToModalView_cleanUpAndCallBack()
		{
			_afterHavingFullyPresentedNewTopView_removeOldTopModalView()
			{ // manually simulate a view visibility events
				to_modalView.viewDidAppear() // NOTE: to_modalView
				// the second place we'll call this:
				const didDismissModalToRevealView_fn = to_modalView.navigationView_didDismissModalToRevealView
				if (didDismissModalToRevealView_fn && typeof didDismissModalToRevealView_fn === 'function') {
					didDismissModalToRevealView_fn.apply(to_modalView)
				}
			}
			__trampolineFor_transitionEnded()
			fn()
		}
		{ // make to_modalView the new top view
			self.topModalView = to_modalView
		}
		{ // pre-insert the new top view, to_modalView, underneath the old_topModalView
			const subviewUUIDs = self.subviews.map(function(v) { return v.View_UUID() })
			const indexOf_old_topModalView_inSubviews = subviewUUIDs.indexOf(old_topModalView.View_UUID())
			if (indexOf_old_topModalView_inSubviews === -1) {
				__trampolineFor_transitionEnded()
				throw `Asked to DismissModalViewsToView ${to_modalView.View_UUID()} but old_topModalView UUID not found in UUIDs of ${self.Description()} subviews.`
			}
			if (isAnimated === true) { // prepare for animation
				old_topModalView.layer.style.position = "absolute"
				old_topModalView.layer.style.zIndex = "20" // starts out on top, as it would if we inserted to_modalView under it
				//
				to_modalView.layer.style.position = "absolute"
				to_modalView.layer.style.zIndex = "9" // because we want to make sure it goes under the current top modal view
			}
			{ // manually simulate a view visibility events
				to_modalView.viewWillAppear()
			}
			self.insertSubview(
				to_modalView,
				indexOf_old_topModalView_inSubviews
			)
			if (isAnimated === false) { // no need to animate anything - straight to end state
				__afterHavingFullyDismissedToModalView_cleanUpAndCallBack()
				return
			}
			setTimeout(
				function()
				{ // wait til not blocked or we get choppiness
					Animate(
						old_topModalView.layer,
						{
							top: `${self.layer.offsetHeight}px`
						},
						{
							duration: self._animation_modalDismiss_duration_ms(),
							easing: self._animation_modalDismiss_easing(),
							complete: function()
							{
								__afterHavingFullyDismissedToModalView_cleanUpAndCallBack()
							}
						}
					)
				}
			)
		}
		{ // pop all views in model
			const numberOf_modalViews = self.modalViews.length
			for (let i = indexOf_to_modalView + 1 ; i < numberOf_modalViews ; i++) { // over the modalViews which will be popped
				const modalView = self.modalViews[i]
				modalView.modalParentView = null // un-set modalParentView on this modalView which will be popped
			}
			const modalViews_afterPop = self.modalViews.slice(0, indexOf_to_modalView + 1) // +1 as end is end idx not included in slice
			self.modalViews = modalViews_afterPop
			if (to_modalView.IsEqualTo(self.modalViews[self.modalViews.length - 1]) === false) {
				// we don't need to call __trampolineFor_transitionEnded here since we would have already triggered it in above two isAnimated == false check branches
				throw `Popped to to_modalView ${to_modalView.Description()} at idx ${indexOf_to_modalView} but it was not the last of self.modalViews after pop all views until that idx.`				
			}
		}
	}
	//
	//
	// Runtime - Delegation - Overrides - Disallowing operations while modal is up
	//

	//
	//
	// Runtime - Delegation - Implementation/support for TabBarAndContentView events
	//
	TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected()
	{
		const self = this
		if (self.modalViews.length != 0) {
			console.warn(`⚠️  Disallowing ${self.constructor.name}/TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected while modal view(s) presented.`)
			return
		}
		super.TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected()
	}
	TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState(isAnimated)
	{
		const self = this
		self.DismissModalViewsToView( // pop all modals
			null,
			isAnimated
		)
		// ^- call Dismiss before calling method on super
		super.TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState(isAnimated)
	}
}
module.exports = StackAndModalNavigationView