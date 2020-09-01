// Copyright (c) 2014-2019, MyMonero.com
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
//
class InfoDisclosingView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		{
			self.padding_left = typeof options.padding_left == 'undefined' ? 18 : options.padding_left
			self.padding_right = typeof options.padding_right == 'undefined' ? 42 : options.padding_right
			self.padding_v = typeof options.padding_v == 'undefined' ? 16 : options.padding_v
			self.shouldToggle_fn = options.shouldToggle_fn || function(to_isDisclosed, async_reply_fn) { async_reply_fn(true) }
			//
			self.previewView = options.previewView
			if (!self.previewView) {
				throw `${self.constructor.name} requires a self.previewView`
			}
			self.disclosedView = options.disclosedView
			if (!self.disclosedView) {
				throw `${self.constructor.name} requires a self.disclosedView`
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self._setup_views()
	}
	_setup_views()
	{
		const self = this
		{
			const layer = self.layer
			layer.style.position = "relative"
			layer.style.left = "0"
			layer.style.top = "0"
			layer.style.padding = "0"
			layer.style.overflow = "hidden"
			layer.addEventListener(
				"click",
				function(e)
				{
					let target = e.target
					let hasClass_doNotUseForDisclosureToggling = target.classList.contains(self._className_doNotUseForDisclosureToggling())
					if (hasClass_doNotUseForDisclosureToggling) {
						return
					}
					let target_isInteractiveSubElement = false; // derive
					{
						if (target.tagName.toLowerCase() == "a") {
							target_isInteractiveSubElement = true;
						} else if (target.style.userSelect == "all"
							|| target.style.webkitUserSelect == "all"
							|| target.style.MozUserSelect == "all"
							|| target.style.msUserSelect == "all") {
							target_isInteractiveSubElement = true;
						}
					}
					if (target_isInteractiveSubElement) {
						return
					}
					self.disclosureButtonView.toggleDisclosed()
				}
			)
		}
		{
			const to_width = `calc(100% - ${self.padding_right + self.padding_left}px)`
			{
				const layer = self.previewView.layer
				layer.boxSizing = "border-box"
				layer.style.position = "relative"
				layer.style.width = to_width
				layer.style.padding = `${self.padding_v}px ${self.padding_right}px ${self.padding_v}px ${self.padding_left}px`
			}
			{
				const layer = self.disclosedView.layer
				layer.boxSizing = "border-box"
				layer.style.position = "relative"
				layer.style.width = to_width
				layer.style.padding = `${self.padding_v}px ${self.padding_right}px ${self.padding_v}px ${self.padding_left}px`
			}
		}
		{ // disclosure button view
			const view = new View({ tag: "a" }, self.context)
			const layer = view.layer
			layer.classList.add(self._className_doNotUseForDisclosureToggling()) // even though the toggling animation code ignores 'spam'…
			layer.style.position = "absolute"
			layer.style.left = "14px"
			layer.style.top = "15px"
			layer.style.backgroundImage = "url('"+self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"InfoDisclosingView/Resources/disclosureArrow_icon@3x.png')"
			layer.style.backgroundSize = "8px 10px"
			layer.style.backgroundRepeat = "no-repeat"
			layer.style.backgroundPosition = "center"
			layer.style.display = "block"
			layer.style.width = "14px"
			layer.style.height = "14px"
			layer.style.zIndex = "99"
			view.setDisclosed = function(isDisclosed, optl_isAnimated)
			{
				const isAnimated = optl_isAnimated === false ? false : true
				view.isDisclosed = isDisclosed
				var rotation_deg = 0
				if (isDisclosed) {
					rotation_deg = 90
				}
				const rotate_deg_str = `${rotation_deg}deg`
				if (isAnimated) {
					Animate(
						layer,
						{ rotateZ: rotate_deg_str },
						{
							duration: self._arrowRotate_transitionAnimationDuration_ms(),
							easing: "ease-out",
							complete: function() {}
						}
					)
				} else {
					const to_transform = `rotate(${rotate_deg_str})` // pull everything up per design
					layer.style.transform = to_transform
				}
			}
			view.toggleDisclosed = function(optl_isAnimated)
			{
				let to_isDisclosed = self.isDisclosed ? false : true // verbosity bc "!" is a little hard to see
				let final_isAnimated = optl_isAnimated || true
				self.setDisclosed(to_isDisclosed, final_isAnimated)
			}
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					view.toggleDisclosed()
					return false
				}
			)
			self.disclosureButtonView = view
			self.addSubview(view)
		}
		{ // set up state for runtime
			self.isDisclosed = false
			self.addSubview(self.previewView)
		}
	}
	//
	//
	// Runtime - Accessors 
	//
	_arrowRotate_transitionAnimationDuration_ms()
	{
		return 90
	}
	_layout_transitionAnimationDuration_ms()
	{
		return 340
	}
	_fade_transitionAnimationDuration_ms()
	{
		return 280
	}
	_className_doNotUseForDisclosureToggling()
	{
		return "__infoDisclosing_doNotUseForDisclosureToggling"
	}
	//
	//
	// Imperatives - Disclosure
	//
	setDisclosed(isDisclosed, optl_isAnimated)
	{
		const self = this
		if (self.isTransitioning === true) {
			return
		}
		if (self.isDisclosed === isDisclosed) {
			console.warn(`⚠️  ${self.constructor.name} asked to setDisclosed(${isDisclosed}) but already so.`)
			return
		}
		function __really_proceed()
		{
			self.isTransitioning = true // unset wherever method finishes
			//
			const isAnimated = optl_isAnimated == false ? false : true
			//
			const wasDisclosed = self.isDisclosed
			self.isDisclosed = isDisclosed
			self.disclosureButtonView.setDisclosed(isDisclosed, optl_isAnimated)
			const fromView = isDisclosed ? self.previewView : self.disclosedView
			const toView = isDisclosed ? self.disclosedView : self.previewView
			if (isAnimated == false) {
				fromView.removeFromSuperview()
				self.addSubview(toView)
				self.isTransitioning = false
				return
			}
			fromView.layer.style.position = "absolute"
			toView.layer.style.position = "absolute"
			toView.layer.style.opacity = "0"
			self.addSubview(toView)
			// v--- must ask for height /after/ inserting into the DOM
			const to_height_px = toView.layer.offsetHeight
			//
			self.layer.style.height = fromView.layer.offsetHeight + "px" // flip from "auto" to px system
			Animate(
				self.layer,
				{
					height: to_height_px + "px"
				},
				{
					duration: self._layout_transitionAnimationDuration_ms(),
					easing: "ease-in-out",
					complete: function() {}
				}
			)
			//
			Animate(
				fromView.layer, { opacity: 0 },
				{
					delay: self._fade_transitionAnimationDuration_ms()/7, // so it starts slightly after the layout anim
					duration: self._fade_transitionAnimationDuration_ms(),
					easing: "ease-in-out",
					complete: function()
					{
						fromView.removeFromSuperview() // which we can do as soon as it's invisible… because
						// the layout won't be changed by doing so, because we set self.layer.style.height to the offsetHeight and do px animation instead of relying on contents
						fromView.layer.style.position = "relative"
					}
				}
			)
			Animate(
				toView.layer, { opacity: 1.0 },
				{
					delay: self._fade_transitionAnimationDuration_ms()/10, // so it starts slightly after the layout anim
					duration: self._fade_transitionAnimationDuration_ms(),
					easing: "ease-in-out",
					complete: function()
					{
						toView.layer.style.position = "relative"
						self.layer.style.height = "auto" // flip back
						//
						self.isTransitioning = false // going to consider this 'done'
					}
				}
			)
		}
		self.shouldToggle_fn(
			isDisclosed, // to_isDisclosed
			function(shouldToggle)
			{
				if (shouldToggle) {
					__really_proceed()
				}
			}
		)
	}
}
module.exports = InfoDisclosingView
