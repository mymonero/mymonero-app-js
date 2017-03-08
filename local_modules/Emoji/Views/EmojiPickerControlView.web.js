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
const Views__cssRules = require('../../Views/cssRules.web')
//
// CSS rules
const NamespaceName = "EmojiPickerControlView"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.${NamespaceName} {
		display: block;
		text-decoration: none;
		border-radius: 3px;
		
		box-sizing: border-box;
		width: 58px;
		height: 31px;
		
		text-align: left;
		text-indent: 8px;
		line-height: 31px;
		font-size: 13px;
		
		background-image: url(../../Emoji/Resources/popoverDisclosureArrow.png);
		background-size: 8px 7px;
		background-position: 42px 13px;
		background-repeat: no-repeat;
		
		transition: background-color 0.1s ease-out, box-shadow 0.1s ease-out;
		background-color: #383638;
		box-shadow: 0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749;
	}`,
	`.${NamespaceName}.active,
	 .${NamespaceName}:hover {
		 background-color: #494749;
		 box-shadow: 0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #5A585A;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
class EmojiPickerControlView extends View
{
	// Lifecycle - Init
	constructor(options, context)
	{
		options = options || {}
		options.tag = "a"
		super(options, context)
		//
		const self = this
		self.value = options.value || ""
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		self._setup_self_layer()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.href = "#" // so it's clickable
		layer.innerHTML = self.value
		//
		layer.classList.add("EmojiPickerControlView")
		__injectCSSRules_ifNecessary()
	}
	// Lifecycle - Teardown
	TearDown()
	{
		super.TearDown()
		//
		const self = this
	}
	// Runtime - Accessors
	Value()
	{
		return self.value
	}
}
module.exports = EmojiPickerControlView