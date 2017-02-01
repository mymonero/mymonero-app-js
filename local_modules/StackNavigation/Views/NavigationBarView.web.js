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
				return
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{ // initial state
		}
		{ // self.layer
			const layer = self.layer
			{
				layer.style.position = "absolute" // https://developers.google.com/web/updates/2016/12/position-sticky
				layer.style.top = "0%"
				layer.style.zIndex = "9"
			}
			{
				layer.style.width = "100%"
				layer.style.height = `${self.NavigationBarHeight()}px`
			}
			{
				layer.style.webkitAppRegion = "drag" // make draggable
				layer.style.webkitUserSelect = "none"
			}
		}
		{ // background decoration view
			const view = new View({}, self.context)
			{
				const layer = self.layer
				{
					layer.style.position = "absolute"
					layer.style.width = "100%"
					layer.style.height = `${self.NavigationBarHeight()}px`
				}
				layer.style.backgroundColor = "#282527"
			}
			self.backgroundView = view
			self.addSubview(view)
		}
		{
			const layer = document.createElement("span")
			{
				self.defaultNavigationBarTitleColor = "#F8F7F8" // so we can use it at runtime
				layer.style.color = self.defaultNavigationBarTitleColor
				layer.style.fontSize = "16px"
				layer.style.position = "absolute"
				layer.style.fontFamily = `"Helvetica Neue", Helvetica, Arial, sans-serif`
				layer.style.top = "0%"
				self.titleLayer_marginX_pxComponent = 16
				self.titleLayer_marginX_pctComponent = .15
				layer.style.left = `calc(${100*self.titleLayer_marginX_pctComponent}% + ${self.titleLayer_marginX_pxComponent}px)`
				layer.style.width = `calc(${ 100 - 2*100*self.titleLayer_marginX_pctComponent }% - ${2 * self.titleLayer_marginX_pxComponent}px`
				layer.style.height = `${self.NavigationBarHeight()}px`
				layer.style.textAlign = "center"
				layer.style.lineHeight = `${self.NavigationBarHeight()}px`
			}
			self.layer.appendChild(layer)
			self.titleLayer = layer
		}
		{ // leftBarButtonHolderView
			const view = new View({}, self.context)
			const layer = view.layer
			{
				layer.style.position = "absolute"
				layer.style.left = "16px"
				layer.style.width = "15%"
				layer.style.minWidth = `${self.NavigationBarHeight()}px`
				layer.style.height = `${self.NavigationBarHeight()}px`
				//
				// layer.style.border = "1px solid green"
			}
			self.addSubview(view)
			self.leftBarButtonHolderView = view
		}
		{ // rightBarButtonHolderView
			const view = new View({}, self.context)
			const layer = view.layer
			{
				layer.style.position = "absolute"
				layer.style.right = "16px"
				layer.style.width = "15%"
				layer.style.minWidth = `${self.NavigationBarHeight()}px`
				layer.style.height = `${self.NavigationBarHeight()}px`
				//
				// layer.style.border = "1px solid red"
			}
			self.addSubview(view)
			self.rightBarButtonHolderView = view
		}
		{ // navBarBottonScrollShadowLayer			
			const layer = document.createElement("div")
			{ // navBarBottonScrollShadowLayer
				layer.style.position = "absolute"
				layer.style.pointerEvents = "none" // allow to be clicked and scrolled through
				layer.style.top = `${self.NavigationBarHeight()}px`
				layer.style.left = "0px"
				layer.style.width = "100%"
				layer.style.height = "1px" // this can be modified later to display the shadow - maybe with a child element doing the decoration
				layer.style.backgroundColor = "rgba(17, 17, 17, 0.5)" 
				//
				layer.style.opacity = "0" // initial state
				self.navBarBottomScrollShadowLayer__cached_currentOpacity = "0" // see usage of this below for explanation
			}
			self.navBarBottomScrollShadowLayer = layer
			self.layer.appendChild(layer)
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
		return "NavigationBarView" + "-of-" + self.navigationController.idPrefix() // borrow its uuid namespacing
	}
	_animationDuration_ms_navigationPush()
	{
		const self = this
		//
		return self.navigationController._animationDuration_ms_navigationPush()
	}
	//
	//
	//
	// Runtime - Accessors - Internal - UI elements
	//
	new_back_leftBarButtonView()
	{
		const self = this
		const view = new View({ tag: "a" }, self.context)
		const layer = view.layer
		{ // setup/style
			layer.href = "#" // to make it clickable
			layer.innerHTML = "&lt;" // TODO
		}
		{
			layer.style.display = "block"
			layer.style.marginTop = "10px"
			layer.style.width = "26px"
			layer.style.height = "24px"
			layer.style.borderRadius = "2px"
			layer.style.backgroundColor = "#18bbec"
			layer.style.textDecoration = "none"
			layer.style.fontSize = "22px"
			layer.style.lineHeight = "115%" // % extra to get + aligned properly
			layer.style.color = "#ffffff"
			layer.style.fontWeight = "bold"
			layer.style.textAlign = "center"
		}
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						self.emit(self.EventName_backButtonTapped()) // animated
					}
					return false
				}
			)
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
		{
			self.__stopObserving_old_topStackView(old_topStackView)
		}
		self.SetTitleFromTopStackView(stackView, old_topStackView, isAnimated, ifAnimated_isFromRightNotLeft, trueIfPoppingToRoot)
		self.SetBarButtonsFromTopStackView(stackView, old_topStackView, isAnimated, trueIfPoppingToRoot)
		{ // configure scroll shadow visibility
			if (typeof stackView !== 'undefined' && stackView !== null) {
				const scrollTop = stackView.layer.scrollTop
				self._configureNavBarScrollShadowWithScrollTop(scrollTop)
			}
		}
		{ // start observing this new top view
			self.__startObserving_new_topStackView(stackView)
		}	
	}
	SetTitleNeedsUpdate(stackView)
	{
		const self = this
		if (typeof stackView === 'undefined' || stackView === null) {
			self.titleLayer.innerHTML = "" // clear
			return
		}
		{
			if (typeof stackView.Navigation_Title !== 'function') {
				console.error("Error: stackView didn't define Navigation_Title()", stackView)
				throw "stackView.Navigation_Title() not a function"
			}
		}
		var titleTextColor = self.defaultNavigationBarTitleColor
		if (typeof stackView.Navigation_TitleColor === 'function') {
			const read_titleColor = stackView.Navigation_TitleColor()
			if (read_titleColor !== null && typeof read_titleColor !== 'undefined' && read_titleColor.length !== 0) {
				titleTextColor = read_titleColor
			}
		}
		const titleString = stackView.Navigation_Title()
		//
		self.titleLayer.style.color = titleTextColor
		self.titleLayer.innerHTML = titleString
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
		{
			if (typeof stackView.Navigation_Title !== 'function') {
				console.error("Error: stackView didn't define Navigation_Title()", stackView)
				throw "stackView.Navigation_Title() not a function"
			}
		}
		var titleTextColor = self.defaultNavigationBarTitleColor
		if (typeof stackView.Navigation_TitleColor === 'function') {
			const read_titleColor = stackView.Navigation_TitleColor()
			if (read_titleColor !== null && typeof read_titleColor !== 'undefined' && read_titleColor.length !== 0) {
				titleTextColor = read_titleColor
			}
		}
		const titleString = stackView.Navigation_Title()
		if (isAnimated === false) {
			self.titleLayer.style.color = titleTextColor
			self.titleLayer.innerHTML = titleString
			return
		}
		const old_titleLayer = self.titleLayer
		const successor_titleLayer = self.titleLayer.cloneNode()
		{
			successor_titleLayer.style.color = titleTextColor
			successor_titleLayer.innerHTML = titleString // set up with new title
		}
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
				duration: self._animationDuration_ms_navigationPush(),
				complete: function()
				{
					successor_titleLayer.style.left = `calc(${100*self.titleLayer_marginX_pctComponent}% + ${self.titleLayer_marginX_pxComponent}px)`
					// ^ setting this to maintain some consistency in the starting state of the above animation
					// and more importantly to retain flexibility of layout
					//
					self.titleLayer = successor_titleLayer
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
				duration: self._animationDuration_ms_navigationPush(),
				complete: function()
				{
				}
			}
		)
	}	
	SetBarButtonsFromTopStackView(
		stackView, 
		old_topStackView,
		isAnimated,
		trueIfPoppingToRoot
	)
	{
		const self = this
		{ // remove existing
			{ // left btn
				const view = self.leftBarButtonView
				self.leftBarButtonView = null // free
				if (typeof view !== 'undefined' && view !== null) {
					if (isAnimated) {
						// fade out then remove
						const layer = view.layer
						Animate(layer, "stop", true) // stop all animations, and clear all queued animations
						Animate(
							layer, 
							{ opacity: 0 }, 
							{
								duration: self._animationDuration_ms_navigationPush(),
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
						// fade out then remove
						const layer = view.layer
						Animate(layer, "stop", true) // stop all animations, and clear all queued animations
						Animate(
							layer, 
							{ opacity: 0 }, 
							{
								duration: self._animationDuration_ms_navigationPush(),
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
		{ // add new
			if (typeof stackView !== 'undefined' && stackView !== null) {
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
								buttonView = self.new_back_leftBarButtonView()
							}
						}
					}
					if (typeof buttonView !== 'undefined' && buttonView !== null) { 
						{
							buttonView.layer.style.webkitAppRegion = "no-drag" // make clickable
						}
						{ // take over layout
							buttonView.layer.style.position = "absolute"
							buttonView.layer.style.left = "0" // so it sticks to the left of the btn holder view layer
						}
						self.leftBarButtonView = buttonView
						{ // now present
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
								self.leftBarButtonHolderView.addSubview(buttonView) // then add to the view
								// then fade in
								Animate(
									layer, 
									{ opacity: toOpacity_float }, 
									{
										duration: self._animationDuration_ms_navigationPush(),
										complete: function() {}
									}
								)
							} else {
								self.leftBarButtonHolderView.addSubview(buttonView)
							}
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
						{
							buttonView.layer.style.webkitAppRegion = "no-drag" // make clickable
						}
						{ // take over layout
							buttonView.layer.style.position = "absolute"
							buttonView.layer.style.right = "0" // so it sticks to the left of the btn holder view layer
						}
						self.rightBarButtonView = buttonView
						{ // now present
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
								self.rightBarButtonHolderView.addSubview(buttonView) // then add to the view
								// then fade in
								Animate(
									layer, 
									{ opacity: toOpacity_float }, 
									{
										duration: self._animationDuration_ms_navigationPush(),
										complete: function() {}
									}
								)
							} else {
								self.rightBarButtonHolderView.addSubview(buttonView)
							}
						}
					}
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
		if (self.navBarBottomScrollShadowLayer__cached_currentOpacity !== "0") { // cache used to prevent having to talk to the DOM
			self.navBarBottomScrollShadowLayer__cached_currentOpacity = "0"
			//
			const layer = self.navBarBottomScrollShadowLayer
			Animate(layer, "stop", true) // stop all animations, and clear all queued animations
			Animate(layer, { opacity: 0 }, { duration: 60 });
		}
	}
	_configureNavBarScrollShadowAs_positiveScroll_showShadow()
	{
		const self = this
		if (self.navBarBottomScrollShadowLayer__cached_currentOpacity !== "1") { // cache used to prevent having to talk to the DOM
			self.navBarBottomScrollShadowLayer__cached_currentOpacity = "1"
			//
			const layer = self.navBarBottomScrollShadowLayer
			Animate(layer, "stop", true) // stop all animations, and clear all queued animations
			Animate(layer, { opacity: 1 }, { duration: 60 });
		}
	}
}
module.exports = NavigationBarView