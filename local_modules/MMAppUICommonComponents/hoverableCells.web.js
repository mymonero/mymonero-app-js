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
const Views__cssRules = require('../Views/cssRules.web')
//
const NamespaceName = "hoverableCell"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.hoverable-cell {
		transition: background-color 0.1s ease-out;
	}`,
	`.hoverable-cell.utility:not(.disabled):not(.active):not([disabled]):hover {
		background-color: #3f3e3f !important;
	}`,
	`.hoverable-cell.action:not(.disabled):not(.active):not([disabled]):hover {
		background-color: #33d1ff !important;
	}`,
	`.hoverable-cell.destructive:not(.disabled):not(.active):not([disabled]):hover {
		background-color: #F77E7E !important;
	}`,
	`.hoverable-cell.disableable[disabled=disabled],
	 .hoverable-cell.disableable.disabled {
	 	opacity: 0.5;
	}`
]
function __injectCSSRules_ifNecessary()
{
	Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}

exports.ClassFor_HoverableCell = function()
{
	__injectCSSRules_ifNecessary() 
	return "hoverable-cell"
}
exports.ClassFor_GreyCell = function()
{
	__injectCSSRules_ifNecessary()
	return "utility"
}
exports.ClassFor_BlueCell = function()
{
	__injectCSSRules_ifNecessary()
	return "action"
}
exports.ClassFor_RedCell = function()
{
	__injectCSSRules_ifNecessary()
	return "destructive"
}
exports.ClassFor_Disableable = function()
{
	__injectCSSRules_ifNecessary() 
	return "disableable"
}
