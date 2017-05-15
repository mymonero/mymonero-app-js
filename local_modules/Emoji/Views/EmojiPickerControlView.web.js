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
const dom_traversal = require('../../Views/dom_traversal.web')
const EmojiPickerPopoverView = require('./EmojiPickerPopoverView.web')
const emoji_web = require('../emoji_web')
//
// CSS rules
const Views__cssRules = require('../../Views/cssRules.web')
const NamespaceName = "EmojiPickerControlView"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
function cssRules_generatorFn(context)
{
	const assetsPath = context.crossPlatform_appBundledAssetsRootPath
	const useMobRendOpts = context.Views_selectivelyEnableMobileRenderingOptimizations === true
	const cssRules =
	[
		`.${NamespaceName} {
			box-sizing: border-box;
			width: 58px;
			height: 31px;
		}`,
		`.${NamespaceName} > a {
			border-radius: 3px;
			
			display: block;
			box-sizing: border-box;
			width: 58px;
			height: 31px;
			
			text-decoration: none;
			text-align: left;
			text-indent: 8px;
			line-height: 31px;
			font-size: 13px;
			
			background-image: url(${assetsPath}/Emoji/Resources/popoverDisclosureArrow@3x.png);
			background-size: 8px 7px;
			background-position: 42px 13px;
			background-repeat: no-repeat;
			
			transition: background-color 0.1s ease-out, box-shadow 0.1s ease-out;
			background-color: #383638;
			box-shadow: ${useMobRendOpts?"":"0 0.5px 1px 0 #161416, "}inset 0 0.5px 0 0 #494749;
		}`,
		`.${NamespaceName} > a.active,
		 .${NamespaceName} > a:hover {
			 background-color: #494749;
			 box-shadow: ${useMobRendOpts?"":"0 0.5px 1px 0 #161416, "}inset 0 0.5px 0 0 #5A585A;
		}`,
		`.${NamespaceName} > a .emojione {
			transform: scale(${17/64});
			margin-left: -24px;
			margin-top: -14px;
		}`
	]
	return cssRules
}
function __injectCSSRules_ifNecessary(context)
{
	Views__cssRules.InjectCSSRules_ifNecessary(
		haveCSSRulesBeenInjected_documentKey, 
		cssRules_generatorFn,
		context
	)
}
//
class EmojiPickerControlView extends View
{
	// Lifecycle - Init
	constructor(options, context)
	{
		options = options || {}
		options.tag = "div"
		super(options, context)
		//
		const self = this
		self.value = options.value || ""
		self.didPickEmoji_fn = options.didPickEmoji_fn || function(emoji) {}
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
		self.startObserving()
	}
	setup_views()
	{
		const self = this
		self._setup_self_layer()
		self._setup_aLayer()
		self._setup_popoverView()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.classList.add("EmojiPickerControlView")
		__injectCSSRules_ifNecessary(self.context)
		layer.style.position = "relative" // for pos:abs children
	}
	_setup_aLayer()
	{
		const self = this
		const layer = document.createElement("a")
		self.aLayer = layer
		layer.style.position = "absolute"
		layer.style.left = "0"
		layer.style.top = "0"
		layer.style.width = "100%"
		layer.style.height = "100%"
		layer.href = "#" // so it's clickable
		self._configureALayerWithEmoji()
		self.layer.appendChild(layer)
		//
		layer.addEventListener(self._crossPlatform_click_eventName(), function(e) {
			e.preventDefault()
			// TODO: this appears to trigger on 'enter' too… should that be detected and used to select hovered/highlighted cell if any?
			self.togglePopoverViewVisibility(true)
			return false
		})
		layer.addEventListener("keydown", function(e) {
			// to trigger the effect of the click event from the keyboard
			var code = e.which
			if (code === 13 || code === 32) { // 13 = Return, 32 = Space
				self.togglePopoverViewVisibility(true)
			}
		})
	}
	_setup_popoverView()
	{
		const self = this
		const view = new EmojiPickerPopoverView({
			didPickEmoji_fn: function(emoji)
			{
				self.value = emoji // must set this so consumers accessing Value() have correct value
				self._configureALayerWithEmoji()
				self.didPickEmoji_fn(emoji)
				setTimeout(function() { // just so it's on next tick
					self.hidePopoverView()
				})
			}
		}, self.context)
		view.layer.style.right = "-37px" // to get arrow center aligned with emoji center
		view.layer.style.top = "12px"
		self.popoverView = view
		self.hidePopoverView(false) // now that reference assigned but layer not yet in DOM; we can call this cause self.isPopoverVisible is still undefined
		self.addSubview(view)
	}
	startObserving()
	{
		const self = this
		// dismiss if not clicked on self
		self._window_click_fn = function(e)
		{	// Now we must check if we can trigger a 'hide' of the options container layer.
			// We do so by checking if the target of the click is the 'show opens container layer' spawn element or one of its children. If it isn't, we can hide the options.
			// If we don't check, we end up stepping on a the 'show' request on the self click
			const e__target = e.target
			const self__layer = self.layer
			if (e__target !== self__layer) { // so, not clicking the self__layer itself…
				const isTargetAChildOf_self = dom_traversal.DoesAnyParentOfElementMatch__sync(
					e__target, 
					function(anAncestorNode)
					{ // match fn
						if (anAncestorNode === self__layer) {
							return true // a match - an eventual parent is the self__layer
						}
						return false // keep climbing…
					}
				)
				if (isTargetAChildOf_self == false) {
					self.hidePopoverView(true)
				}
			}
		}
		window.addEventListener(self._crossPlatform_click_eventName(), self._window_click_fn)
		// user hitting escape
		self._document_keydown_fn = function(e)
		{
			e = e || window.event
			if (e.key === "Escape" || e.key === "Esc" || e.keyCode == 27) {
				self.hidePopoverView(true) // if necessary
			}
		}
		document.addEventListener("keydown", self._document_keydown_fn)
	}
	_crossPlatform_click_eventName()
	{ // ^-- window 'click' will not fire on mobile; ontouchstart will be null or non-nil rather than undefined on mobile platforms
		return typeof document.body.ontouchstart === "undefined" ? "click" : "touchstart"
	}
	// Lifecycle - Teardown
	TearDown()
	{
		super.TearDown()
		//
		const self = this
		self.stopObserving()
	}
	stopObserving()
	{
		const self = this
		self.stopObserving_fn(self)
		// TODO: assert self._window_click_fn != nil
		window.removeEventListener(self._crossPlatform_click_eventName(), self._window_click_fn)
		// TODO: assert self._document_keydown_fn != nil
		document.removeEventListener("keydown", self._document_keydown_fn)
	}
	// Runtime - Accessors
	Value()
	{
		const self = this
		return self.value
	}
	// Runtime - Accessors - State
	SetValue(emoji)
	{
		const self = this
		// TODO: validate emoji in set of emoji?
		self.value = emoji
		self._configureALayerWithEmoji()
		if (self.isPopoverVisible) {
			self.hidePopoverView()
		}
	}
	// Runtime - Imperatives - Popover visibility
	togglePopoverViewVisibility(optl_isAnimated)
	{
		const self = this
		if (self.isPopoverVisible == false) {
			self.showPopoverView(optl_isAnimated)
		} else {
			self.hidePopoverView(optl_isAnimated)
		}
	}
	showPopoverView(optl_isAnimated)
	{
		const isAnimated = optl_isAnimated === false ? false : true // default true
		//
		const self = this
		if (self.isPopoverVisible === true) {
			console.log("Popover already visible. Bailing.")
			return
		}
		self.isPopoverVisible = true
		self.aLayer.classList.add("active")
		if (isAnimated) {
			self.popoverView.layer.style.opacity = "0"
			self.popoverView.layer.style.display = "block"
			self.popoverView.SetPreVisibleSelectedEmoji(self.value) // only now that display is block - cause otherwise we won't be able to get the scroll offset of the selected emoji!
			Animate(
				self.popoverView.layer,
				{ opacity: "1" },
				{
					duration: 100,
					easing: "ease-out",
					complete: function(){}
				}
			)
		} else {
			self.popoverView.layer.style.display = "block"
			self.popoverView.SetPreVisibleSelectedEmoji(self.value) // only now that display is block - cause otherwise we won't be able to get the scroll offset of the selected emoji!
			self.popoverView.layer.style.opacity = "1"
		}
	}
	hidePopoverView(optl_isAnimated)
	{
		const isAnimated = optl_isAnimated === false ? false : true // default true
		//
		const self = this
		if (self.isPopoverVisible === false) {
			// console.log("Popover already not visible. Bailing.") // likely user just clicking around - make this low comp overhead and just bail
			return
		}
		self.isPopoverVisible = false
		self.aLayer.classList.remove("active")
		if (!isAnimated) {
			self.popoverView.layer.style.display = "none"
		} else {
			Animate(
				self.popoverView.layer,
				{ opacity: "0" },
				{
					duration: 75,
					easing: "ease-out",
					complete: function()
					{
						self.popoverView.layer.style.display = "none"
					}
				}
			)
		}
	}
	// Imperatives - UI config - Content
	_configureALayerWithEmoji()
	{
		const self = this
		self.aLayer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
			self.context, 
			self.value
		)
	}
}
module.exports = EmojiPickerControlView