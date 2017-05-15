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
const View = require('../../Views/View.web')
const BarButtonBaseView = require('./BarButtonBaseView.web')
//
const emoji_web = require('../../Emoji/emoji_web')
//
// CSS rules
const Views__cssRules = require('../../Views/cssRules.web')
const NamespaceName = "NavigationBarView"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.${NamespaceName} .title-label {
	}`,
	`.${NamespaceName} .title-label .emojione {
		transform: scale(${17/64});
		margin: -9px 0 0 -32px;
		position: absolute; 
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
class NavigationBarView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		{
			self.navigationController = options.navigationController
			if (typeof self.navigationController === 'undefined' || self.navigationController === null) {
				throw "NavigationBarView self.navigationController nil"
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		__injectCSSRules_ifNecessary()
		{ // self.layer
			const layer = self.layer
			layer.classList.add(NamespaceName)
			layer.style.position = "absolute" // https://developers.google.com/web/updates/2016/12/position-sticky
			layer.style.top = "0%"
			layer.style.zIndex = "9"
			//
			layer.style.width = "100%"
			layer.style.height = `${self.NavigationBarHeight()}px`
			layer.style.backgroundColor = "#272527"
			layer.style.transition = "box-shadow 0.06 ease-in-out"
			//
			layer.style.webkitAppRegion = "drag" // make draggable
			layer.style.webkitUserSelect = "none"
		}
		{ // background decoration view
			const view = new View({}, self.context)
			const layer = view.layer
			layer.style.position = "absolute"
			layer.style.width = "100%"
			layer.style.height = `${self.NavigationBarHeight()}px`
			layer.style.backgroundColor = "#272527"
			self.backgroundView = view
			self.addSubview(view)
		}
		{
			const layer = document.createElement("span")
			layer.classList.add("title-label")
			self.titleLayer = layer
			//
			self.defaultNavigationBarTitleColor = "#fcfbfc" // so we can use it at runtime
			layer.style.color = self.defaultNavigationBarTitleColor
			layer.style.position = "absolute"
			layer.style.top = "-1px"
			self.context.themeController.StyleLayer_FontAsMiddlingBoldSansSerif(layer)
			self.titleLayer_marginX_pxComponent = 16
			self.titleLayer_marginX_pctComponent = .15
			layer.style.boxSizing = "border-box"
			layer.style.left = `calc(${100*self.titleLayer_marginX_pctComponent}% + ${self.titleLayer_marginX_pxComponent}px)`
			const extra_paddingLeft = 10
			layer.style.width = self._new_titleLayer_styleWidth_withExtraPaddingLeft(extra_paddingLeft)
			layer.style.paddingLeft = extra_paddingLeft+"px" // not necessary but added for clarity
			layer.style.height = `${self.NavigationBarHeight()}px`
			layer.style.textAlign = "center"
			layer.style.lineHeight = `${self.NavigationBarHeight()}px`
			layer.style.whiteSpace = "nowrap"
			layer.style.overflow = "hidden"
			layer.style.textOverflow = "ellipsis"
			//
			self.layer.appendChild(layer)
		}
		{ // leftBarButtonHolderView
			const view = new View({}, self.context)
			self.leftBarButtonHolderView = view
			const layer = view.layer
			layer.style.position = "absolute"
			layer.style.left = "16px"
			layer.style.width = "15%"
			layer.style.minWidth = `${self.NavigationBarHeight()}px`
			layer.style.height = `${self.NavigationBarHeight()}px`
			self.addSubview(view)
		}
		{ // rightBarButtonHolderView
			const view = new View({}, self.context)
			self.rightBarButtonHolderView = view
			const layer = view.layer
			layer.style.position = "absolute"
			layer.style.right = "16px"
			layer.style.width = "15%"
			layer.style.minWidth = `${self.NavigationBarHeight()}px`
			layer.style.height = `${self.NavigationBarHeight()}px`
			self.addSubview(view)
		}
	}
	//
	//
	// Runtime - Accessors - Public - Events
	//
	EventName_backButtonTapped()
	{
		return "EventName_backButtonTapped"
	}
	//
	//
	// Runtime - Accessors - Public - UI Metrics
	//
	NavigationBarHeight()
	{
		return 41
	}
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Shared
	//
	_animation_navigationPush_duration_ms()
	{
		const self = this
		return self.navigationController._animation_navigationPush_duration_ms()
	}
	_animation_navigationPush_easing()
	{
		const self = this
		return self.navigationController._animation_navigationPush_easing()
	}
	_new_titleLayer_styleWidth_withExtraPaddingLeft(paddingLeft)
	{
		paddingLeft = typeof paddingLeft !== 'undefined' ? paddingLeft : 0
		const self = this
		const width = `calc(${ 100 - 2*100*self.titleLayer_marginX_pctComponent }% - ${2 * self.titleLayer_marginX_pxComponent}px - ${paddingLeft}px)`
		//
		return width
	}
	//
	//
	// Runtime - Accessors - Internal - UI elements
	//
	new_back_leftBarButtonView()
	{
		const self = this
		const clicked_fn = function()
		{
			self.emit(self.EventName_backButtonTapped()) // animated
		}
		const themeController = self.context.themeController
		if (typeof themeController === 'undefined' || !themeController) {
			throw self.constructor.name + " didn't find a context.themeController"
		}
		const _new_back_leftBarButtonView__fn = themeController.NavigationBarView__New_back_leftBarButtonView
		if (typeof _new_back_leftBarButtonView__fn !== 'function' || !_new_back_leftBarButtonView__fn) {
			throw "themeController didn't implement NavigationBarView__New_back_leftBarButtonView"
		}
		const view = _new_back_leftBarButtonView__fn.apply(themeController, [ clicked_fn ])
		if (view == null || typeof view === 'undefined') {
			throw "Got nil leftBarButtonView from themeController"
		}
		return view
	}
	//
	//
	// Runtime - Imperatives - Public
	//
	SetTopStackView(
		stackView, 
		old_topStackView,
		isAnimated, 
		ifAnimated_isFromRightNotLeft,
		trueIfPoppingToRoot
	)
	{
		const self = this
		//
		self.__stopObserving_old_topStackView(old_topStackView)
		//
		self.SetTitleFromTopStackView(stackView, old_topStackView, isAnimated, ifAnimated_isFromRightNotLeft, trueIfPoppingToRoot)
		self.SetBarButtonsFromTopStackView(stackView, old_topStackView, isAnimated, ifAnimated_isFromRightNotLeft, trueIfPoppingToRoot)
		// configure scroll shadow visibility
		if (typeof stackView !== 'undefined' && stackView !== null) {
			const scrollTop = stackView.layer.scrollTop
			self._configureNavBarScrollShadowWithScrollTop(scrollTop)
		}
		//
		self.__startObserving_new_topStackView(stackView)
	}
	SetTitleNeedsUpdate(stackView)
	{
		const self = this
		if (typeof stackView === 'undefined' || stackView === null) {
			self.titleLayer.innerHTML = "" // clear
			return
		}
		if (typeof stackView.Navigation_Title !== 'function') {
			console.error("Error: stackView didn't define Navigation_Title()", stackView)
			throw "stackView.Navigation_Title() not a function"
		}
		//
		var titleTextColor = self.defaultNavigationBarTitleColor
		if (typeof stackView.Navigation_TitleColor === 'function') {
			const read_titleColor = stackView.Navigation_TitleColor()
			if (read_titleColor !== null && typeof read_titleColor !== 'undefined' && read_titleColor.length !== 0) {
				titleTextColor = read_titleColor
			}
		}
		const titleString = stackView.Navigation_Title()
		var extra_paddingLeft = 0
		if (typeof stackView.Navigation_Title_pageSpecificCSS_paddingLeft == 'function') {
			extra_paddingLeft = stackView.Navigation_Title_pageSpecificCSS_paddingLeft()
		}
		//
		self.titleLayer.style.color = titleTextColor
		self.titleLayer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
			self.context,
			titleString
		)
		self.titleLayer.style.width = self._new_titleLayer_styleWidth_withExtraPaddingLeft(extra_paddingLeft)
		self.titleLayer.style.paddingLeft = extra_paddingLeft+"px"
	}
	SetTitleFromTopStackView(
		stackView,
		old_topStackView,
		isAnimated, 
		ifAnimated_isFromRightNotLeft,
		trueIfPoppingToRoot
	)
	{
		const self = this
		if (typeof stackView === 'undefined' || stackView === null) {
			self.titleLayer.innerHTML = "" // clear
			return
		}
		if (typeof stackView.Navigation_Title !== 'function') {
			console.error("Error: stackView didn't define Navigation_Title()", stackView)
			throw "stackView.Navigation_Title() not a function"
		}
		//
		var titleTextColor = self.defaultNavigationBarTitleColor
		if (typeof stackView.Navigation_TitleColor === 'function') {
			const read_titleColor = stackView.Navigation_TitleColor()
			if (read_titleColor !== null && typeof read_titleColor !== 'undefined' && read_titleColor.length !== 0) {
				titleTextColor = read_titleColor
			}
		}
		const titleString = stackView.Navigation_Title()
		var extra_paddingLeft = 0
		if (typeof stackView.Navigation_Title_pageSpecificCSS_paddingLeft == 'function') {
			extra_paddingLeft = stackView.Navigation_Title_pageSpecificCSS_paddingLeft()
		}
		const to_styleWidth = self._new_titleLayer_styleWidth_withExtraPaddingLeft(extra_paddingLeft)
		//
		if (isAnimated === false) {
			self.titleLayer.style.color = titleTextColor
			self.titleLayer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
				self.context,
				titleString
			)
			self.titleLayer.style.width = to_styleWidth
			self.titleLayer.style.paddingLeft = extra_paddingLeft+"px"
			return
		}
		const old_titleLayer = self.titleLayer
		const successor_titleLayer = self.titleLayer.cloneNode()
		successor_titleLayer.style.color = titleTextColor
		successor_titleLayer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
			self.context,
			titleString
		) // set up with new title
		successor_titleLayer.style.width = to_styleWidth
		successor_titleLayer.style.paddingLeft = extra_paddingLeft+"px"
		//
		const parentWidth = self.titleLayer.parentNode.offsetWidth
		const titleLayer_width = self.titleLayer.offsetWidth
		const layer_fadeOutPosition_leftmost = "0px"
		const layer_fadeOutPosition_rightmost = `${parentWidth - titleLayer_width}px`
		const successor_starting_left = ifAnimated_isFromRightNotLeft ? layer_fadeOutPosition_rightmost : layer_fadeOutPosition_leftmost
		{
			successor_titleLayer.style.opacity = "0"
			successor_titleLayer.style.left = successor_starting_left
		}
		self.titleLayer.parentNode.appendChild(successor_titleLayer) 
		// animate successor onto screen
		const successor_final_left = `${parentWidth * self.titleLayer_marginX_pctComponent + self.titleLayer_marginX_pxComponent}px`
		Animate(
			successor_titleLayer,
			{
				opacity: 1,
				left: successor_final_left
			},
			{
				duration: self._animation_navigationPush_duration_ms(),
				easing: self._animation_navigationPush_easing(),
				complete: function()
				{
					successor_titleLayer.style.left = `calc(${100*self.titleLayer_marginX_pctComponent}% + ${self.titleLayer_marginX_pxComponent}px)`
					// ^ setting this to maintain some consistency in the starting state of the above animation
					// and more importantly to retain flexibility of layout
					//
					self.titleLayer = successor_titleLayer // and swap references
					//
					old_titleLayer.parentNode.removeChild(old_titleLayer)
				}
			}
		)
		// old title layer:
		const old_titleLayer_final_left = ifAnimated_isFromRightNotLeft ? layer_fadeOutPosition_leftmost : layer_fadeOutPosition_rightmost
		Animate(
			old_titleLayer,
			{
				opacity: 0,
				left: old_titleLayer_final_left
			},
			{
				duration: self._animation_navigationPush_duration_ms(),
				easing: self._animation_navigationPush_easing(),
				complete: function()
				{
				}
			}
		)
	}
	SetButtonsNeedsUpdate(stackView, stackViews, optl_isAnimated, ifAnimated_isFromRightNotLeft)
	{
		const isAnimated = optl_isAnimated === true ? true : false
		//
		const self = this
		var idxOfThisStackView = -1;
		if (typeof stackViews === 'undefined' || !stackViews) {
			console.warn("SetButtonsNeedsUpdate called while nil self.stackViews")
			return // for now… assume this will be called again later
		}
		const numberOf_stackViews = stackViews.length
		for (let i = 0 ; i < numberOf_stackViews ; i++) {
			const this_stackView = stackViews[i]
			if (this_stackView.IsEqualTo(stackView)) {
				idxOfThisStackView = i
				break
			}
		}
		if (idxOfThisStackView === -1) {
			throw "stackView is not currently in navigation stack."
			// return false
		}
		var mocked__old_topStackView = null
		if (idxOfThisStackView === 0) {
			mocked__old_topStackView = null
		} else { 
			if (numberOf_stackViews <= 1) {
				throw "expected more than one stack view here. code fault?"
				// return false
			}
			mocked__old_topStackView = stackViews[idxOfThisStackView - 1]
		}
		self.SetBarButtonsFromTopStackView(
			stackView,
			mocked__old_topStackView,
			isAnimated,
			ifAnimated_isFromRightNotLeft,
			false // not popping to root
		)
	}
	SetBarButtonsFromTopStackView(
		stackView, 
		old_topStackView,
		isAnimated,
		ifAnimated_isFromRightNotLeft,
		trueIfPoppingToRoot
	)
	{
		const self = this
		const self_layer_width = self.layer.offsetWidth
		{ // remove existing
			const buttonOffsetForTransition_outgoingButtons_fromLeft = (self_layer_width * 0.5)+ "px" // from left+outgoing: mimick page sliding out
			const buttonOffsetForTransition_outgoingButtons_fromRight = (self_layer_width * 0.26)+ "px" // from right+outgoing: mimick btn slide out to reveal new page coming in
			{ // left btn
				const view = self.leftBarButtonView
				self.leftBarButtonView = null // free
				if (typeof view !== 'undefined' && view !== null) {
					if (isAnimated) {
						// fade & slide out then remove
						const layer = view.layer
						Animate(layer, "stop", true) // stop all animations, and clear all queued animations
						Animate(
							layer, 
							{ 
								opacity: 0,
								left: ifAnimated_isFromRightNotLeft ? "-"+buttonOffsetForTransition_outgoingButtons_fromRight/*TODO: offsetbyw*/ : buttonOffsetForTransition_outgoingButtons_fromLeft
							}, 
							{
								duration: self._animation_navigationPush_duration_ms(),
								easing: self._animation_navigationPush_easing(),
								complete: function()
								{
									view.removeFromSuperview()
								}
							}
						)
					} else {
						view.removeFromSuperview()
					}
				}
			}
			{ // right btn
				const view = self.rightBarButtonView
				self.rightBarButtonView = null // free
				if (typeof view !== 'undefined' && view !== null) {
					if (isAnimated) {
						// fade & slide out then remove
						const layer = view.layer
						Animate(layer, "stop", true) // stop all animations, and clear all queued animations
						Animate(
							layer, 
							{ 
								opacity: 0,
								right: ifAnimated_isFromRightNotLeft ? buttonOffsetForTransition_outgoingButtons_fromRight : "-"+buttonOffsetForTransition_outgoingButtons_fromLeft
							}, 
							{
								duration: self._animation_navigationPush_duration_ms(),
								easing: self._animation_navigationPush_easing(),
								complete: function()
								{
									view.removeFromSuperview()
								}
							}
						)
					} else {
						view.removeFromSuperview()
					}
				}
			}
		}
		// add new
		if (typeof stackView === 'undefined' || stackView === null) { // validate
			return
		}
		const buttonOffsetForTransition_incomingButtons_fromLeft = (self_layer_width * 0.26)+ "px" // the constant factor is to mimick the page on top sliding out to reveal existing buttons
		const buttonOffsetForTransition_incomingButtons_fromRight = (self_layer_width * 0.5)+ "px" // from right+incoming: mimick btns of new page sliding in
		{ // left btn
			var buttonView = null
			const factoryFn = stackView.Navigation_New_LeftBarButtonView
			if (typeof factoryFn === 'function') {
				buttonView = factoryFn.apply(stackView) // use .apply to maintain stackView as this
			}
			if (typeof buttonView === 'undefined' || buttonView === null) { // if no button specified by stackView
				if (typeof old_topStackView !== 'undefined' && old_topStackView !== null) {
					// then it means stackView is not the root stackView on the nav controller,
					// and since the left buttonView is nil here, that means we should throw up a back button
					// TODO: we could ask the stackView being presented if it wants to explicitly
					// 		 disallow back buttons here when/if that becomes necessary
					if (trueIfPoppingToRoot !== true) { // because we don't want a back button in this case
						var hidesBackButton = false
						const hidesBackButton_fn = stackView.Navigation_HidesBackButton
						if (typeof hidesBackButton_fn === 'function') {
							hidesBackButton = hidesBackButton_fn.apply(stackView) // use .apply to maintain stackView as this
						}
						if (hidesBackButton !== true) {
							buttonView = self.new_back_leftBarButtonView()
						}
					}
				}
			}
			if (typeof buttonView !== 'undefined' && buttonView !== null) { 
				buttonView.layer.style.webkitAppRegion = "no-drag" // make clickable
				buttonView.layer.style.position = "absolute" // take over layout - we must set 'left'
				self.leftBarButtonView = buttonView
				// now present
				if (isAnimated === true) {
					const layer = buttonView.layer
					Animate(layer, "stop", true) // stop all animations, and clear all queued animations
					const opacity = layer.style.opacity
					const toOpacity = opacity !== "" && opacity !== null && typeof opacity !== undefined ? opacity : "1" // read instead of hardcode
					const toOpacity_float = parseFloat(toOpacity)
					if (isNaN(toOpacity_float)) {
						throw "toOpacity is NaN"
					}
					layer.style.opacity = "0" // first make invisible 
					layer.style.left = ifAnimated_isFromRightNotLeft ? buttonOffsetForTransition_incomingButtons_fromRight : "-"+buttonOffsetForTransition_incomingButtons_fromLeft
					self.leftBarButtonHolderView.addSubview(buttonView) // then add to the view
					// then fade in
					Animate(
						layer, 
						{ 
							opacity: toOpacity_float,
							left: "0px" // so it sticks to left
						}, 
						{
							duration: self._animation_navigationPush_duration_ms(),
							easing: self._animation_navigationPush_easing(),
							complete: function() {}
						}
					)
				} else {
					buttonView.layer.style.left = "0" // so it sticks to left
					self.leftBarButtonHolderView.addSubview(buttonView)
				}
			}
		}
		{ // right btn
			var buttonView = null
			const factoryFn = stackView.Navigation_New_RightBarButtonView
			if (typeof factoryFn === 'function') {
				buttonView = factoryFn.apply(stackView) // use .apply to maintain stackView as this
			}
			if (typeof buttonView !== 'undefined' && buttonView !== null) {
				buttonView.layer.style.webkitAppRegion = "no-drag" // make clickable
				buttonView.layer.style.position = "absolute" // take over layout - we must set 'right' before exit
				self.rightBarButtonView = buttonView
				// now present
				if (isAnimated === true) {
					const layer = buttonView.layer
					Animate(layer, "stop", true) // stop all animations, and clear all queued animations
					const opacity = layer.style.opacity
					const toOpacity = opacity !== "" && opacity !== null && typeof opacity !== undefined ? opacity : "1" // read instead of hardcode
					const toOpacity_float = parseFloat(toOpacity)
					if (isNaN(toOpacity_float)) {
						throw "toOpacity is NaN"
					}
					layer.style.opacity = "0" // first make invisible 
					layer.style.right = ifAnimated_isFromRightNotLeft ? "-"+buttonOffsetForTransition_incomingButtons_fromRight : buttonOffsetForTransition_incomingButtons_fromLeft
					self.rightBarButtonHolderView.addSubview(buttonView) // then add to the view
					// then fade in
					Animate(
						layer, 
						{ 
							opacity: toOpacity_float,
							right: "0px" // so it sticks to right
						}, 
						{
							duration: self._animation_navigationPush_duration_ms(),
							easing: self._animation_navigationPush_easing(),
							complete: function() {}
						}
					)
				} else {
					buttonView.layer.style.right = "0" // so it sticks to right
					self.rightBarButtonHolderView.addSubview(buttonView)
				}
			}
		}
	}
	//
	//
	// Runtime - Imperatives - Private - Under-nav-bar scroll shadow visibility - Observation, and configuration
	//
	__stopObserving_old_topStackView(old_topStackView)
	{
		const self = this
		if (typeof old_topStackView !== 'undefined' && old_topStackView !== null) {
			const existing_listenerFn__scroll = self.listenerFn__scroll
			if (typeof existing_listenerFn__scroll !== 'undefined' && existing_listenerFn__scroll !== null) {
				old_topStackView.layer.removeEventListener('scroll', existing_listenerFn__scroll)
				self.listenerFn__scroll = null
			}
		}
	}
	__startObserving_new_topStackView(stackView)
	{
		const self = this
		if (typeof stackView !== 'undefined' && stackView !== null) {
			const layer = stackView.layer
			self.listenerFn__scroll = function(e)
			{
				const scrolledLayer = this
				const scrollTop = scrolledLayer.scrollTop
				self._configureNavBarScrollShadowWithScrollTop(scrollTop)
			}
			layer.addEventListener('scroll', self.listenerFn__scroll)
		}
	}
	_configureNavBarScrollShadowWithScrollTop(scrollTop)
	{
		const self = this
		if (scrollTop <= 0) {
			self._configureNavBarScrollShadowAs_zeroOrNegScroll_hideShadow()
		} else {
			self._configureNavBarScrollShadowAs_positiveScroll_showShadow()
		}
	}	
	_configureNavBarScrollShadowAs_zeroOrNegScroll_hideShadow()
	{
		const self = this
		if (self.isShowingScrollShadow !== false) {
			self.isShowingScrollShadow = false
			if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				self.layer.style.boxShadow = "none"
			} else {
				self.layer.style.backgroundColor = "none"
			}
		}
	}
	_configureNavBarScrollShadowAs_positiveScroll_showShadow()
	{
		const self = this
		if (self.isShowingScrollShadow !== true) {
			self.isShowingScrollShadow = true
			if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				self.layer.style.boxShadow = "0 1px 0 0 rgba(0,0,0,0.60), 0 3px 6px 0 rgba(0,0,0,0.40)"
			} else { // avoiding shadow
				self.layer.style.backgroundColor = "black"
			}
		}
	}
}
module.exports = NavigationBarView