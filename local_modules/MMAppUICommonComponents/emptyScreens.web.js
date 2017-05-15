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
const View = require('../Views/View.web')
const emoji_web = require('../Emoji/emoji_web')
//
const default__margin_h = 16
const default__margin_v = 18
//
// CSS rules
const Views__cssRules = require('../Views/cssRules.web')
const NamespaceName = "emptyScreens"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.${NamespaceName} {
		position: relative;
		display: table; /* for valign */
		border: 1px solid #373537;
		border-radius: 5px;
	}`,
	`.${NamespaceName} .content-container .message-label {
		margin: 0 0 0 0;
		width: 100%;
		height: auto;
		line-height: 19px;
		color: #9e9c9e;
		text-align: center;
	}`,
	`.${NamespaceName} .content-container .emoji-label {
		margin: 0 0 23px 0;
		width: 100%;
		height: 21px;
		font-size: 13px;
		text-align: center;
		-webkit-font-smoothing: subpixel-antialiased;
	}`,
	`.${NamespaceName} .content-container .emoji-label .emojione {
		transform: scale(${17/64});
		margin-left: 0px;
		margin-top: -19px;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function New_EmptyStateMessageContainerView(
	optl_emoji, 
	optl_messageText, 
	context, 
	optl_explicitMarginH, 
	optl_explicitMarginV, 
	optl_contentTranslateYPX
)
{
	__injectCSSRules_ifNecessary()
	//
	const nativeEmoji = typeof optl_emoji === 'string' ? optl_emoji : "😀"
	const messageText = typeof optl_messageText === 'string' ? optl_messageText : ""
	const margin_h = typeof optl_explicitMarginH !== 'undefined' ? optl_explicitMarginH : default__margin_h
	const margin_v = typeof optl_explicitMarginV !== 'undefined' ? optl_explicitMarginV : default__margin_v
	const view = new View({}, context)
	{
		view.__EmptyStateMessageContainerView_margin_h = margin_h
		view.__EmptyStateMessageContainerView_margin_v = margin_v
	}
	{
		const layer = view.layer
		layer.classList.add(NamespaceName)
		layer.style.width = `calc(100% - ${2 * margin_h}px - 2px)` // -2px for border
		layer.style.height = `calc(100% - ${2 * margin_v}px - 2px)` // -2px for border
		layer.style.margin = `${margin_v}px ${margin_h}px`
	}
	var contentContainerLayer;
	{
		const layer = document.createElement("div")
		layer.classList.add("content-container")
		layer.style.display = "table-cell"
		layer.style.verticalAlign = "middle"
		const translateY_px = typeof optl_contentTranslateYPX == 'undefined' ? -16 : optl_contentTranslateYPX
		layer.style.transform = "translateY(" + translateY_px + "px)" // pull everything up per design
		
		contentContainerLayer = layer
		view.layer.appendChild(layer)
	}
	var emoji_layer;
	{
		const layer = document.createElement("div")
		layer.classList.add("emoji-label")
		emoji_layer = layer
		const emoji = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
			context,
			nativeEmoji
		)
		layer.innerHTML = emoji
		contentContainerLayer.appendChild(layer)
	}
	var message_layer;
	{
		const layer = document.createElement("div")
		layer.classList.add("message-label")
		context.themeController.StyleLayer_FontAsMiddlingNormalSansSerif(layer)
		message_layer = layer
		layer.innerHTML = messageText

		contentContainerLayer.appendChild(layer)
	}
	view.SetContent = function(to_emoji, to_message)
	{
		emoji_layer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
			context,
			to_emoji
		)
		message_layer.innerHTML = to_message
	}
	return view
}
exports.New_EmptyStateMessageContainerView = New_EmptyStateMessageContainerView