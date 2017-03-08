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
const emoji = require('../emoji')
//
const Views__cssRules = require('../../Views/cssRules.web')
const NamespaceName = "EmojiPickerPopoverContentView"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.${NamespaceName} {
		overflow-y: scroll;
	}`,
	`.${NamespaceName} > .EmojiButtonView {
		width: 34px;
		height: 30px;
		line-height: ${30 + 4}px;
		text-indent: -4px;
		display: inline-block;
		text-align: center;
		vertical-align: middle;
		font-size: 16px;
		cursor: pointer;
		background: rgba(0,0,0,0);
		transition: background-color 0.05s ease-out, box-shadow 0.05s ease-out;
	}`,
	`.${NamespaceName} > .EmojiButtonView.active,
	 .${NamespaceName} > .EmojiButtonView:hover {
 		background: #F2F1F2;
 		box-shadow: 0 0.5px 0 0 #FFFFFF, inset 0 0.5px 1px 0 #DFDEDF;
 		border-radius: 3px;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
class EmojiPickerPopoverContentView extends View
{
	// Lifecycle - Init
	constructor(options, context)
	{
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
		self.emojiButtonViews = []

		self.setup_views()
	}
	setup_views()
	{
		const self = this
		__injectCSSRules_ifNecessary()
		const layer = self.layer
		layer.style.position = "absolute" 
		layer.style.left = "40px" // left shadow
		layer.style.top = "31px" // top arrow/shadow; instead of 30 to leave a 1px space on top
		layer.style.boxSizing = "border-box"
		layer.style.width = "265px"
		layer.style.maxHeight = "175px" // instead of 176 because we want to leave a 1px space on btm
		layer.style.padding = "8px 6px 7px 6px" // btm is 1 lower because we already have 1px space
		layer.style.borderRadius = "4px"
		layer.style.overflowX = "hidden"
		layer.style.overflowY = "scroll"
		layer.classList.add(NamespaceName)
		//
		const emojis = emoji.Emojis
		const emojis_length = emojis.length
		for (let i = 0 ; i < emojis_length ; i++) {
			const emoji = emojis[i]
			const isSelected = emoji === self.value
			const emojiButtonView = self._new_emojiButtonView(emoji, isSelected)
			self.addSubview(emojiButtonView)
			self.emojiButtonViews.push(emojiButtonView)
		}
		//
		// TODO: hydrate by selecting and scrolling to value
	}
	_new_emojiButtonView(emoji, isSelected)
	{
		const self = this
		const view = new View({}, self.context)
		const layer = view.layer
		layer.style.display = "inline-block"
		layer.innerHTML = emoji
		if (isSelected) {
			layer.classList.add("active")
			self.selected_emojiButtonView = view // must set this
		}
		layer.classList.add("EmojiButtonView")
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				self.SelectEmoji(view, emoji)
				return false
			}
		)
		return view
	}
	// Lifecycle - Teardown
	TearDown()
	{
		self.emojiButtonViews = null // freeing
		super.TearDown()
		//
		const self = this
	}
	// Runtime - Imperatives
	SelectEmoji(emojiButtonView, emoji)
	{
		const self = this
		if (self.selected_emojiButtonView) {
			self.selected_emojiButtonView.layer.classList.remove("active")
		}
		self.selected_emojiButtonView = emojiButtonView
		emojiButtonView.layer.classList.add("active")
		self.value = emoji
		self.didPickEmoji_fn(emoji)
	}
}
module.exports = EmojiPickerPopoverContentView