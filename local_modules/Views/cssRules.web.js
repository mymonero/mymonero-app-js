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
function InjectCSSRules_ifNecessary(
	haveCSSRulesBeenInjected_documentKey, 
	cssRules__orGeneratorFn,
	context__orNil
)
{
	if (document[haveCSSRulesBeenInjected_documentKey] !== true) {
		var cssRules;
		if (typeof cssRules__orGeneratorFn === 'function') {
			cssRules = cssRules__orGeneratorFn(context__orNil)
		} else {
			cssRules = cssRules__orGeneratorFn
		}
		//
		const reversed_cssRules = cssRules.reverse()
		reversed_cssRules.forEach(
			function(cssRuleString, i)
			{
				try {
					document.styleSheets[0].insertRule(cssRuleString, 0)
				} catch(e) {
					console.warn("Unable to insert rule: ", cssRuleString)
				}
			}
		)
		document[haveCSSRulesBeenInjected_documentKey] = true
	}
}
exports.InjectCSSRules_ifNecessary = InjectCSSRules_ifNecessary
//
function InjectCSSFile_ifNecessary(stylesheetHref)
{
	const key = "hasCSSFileBeenInjected_" + stylesheetHref
	if (document[key] !== true) {
		var head = document.getElementsByTagName('head')[0]
		var link = document.createElement('link')
		link.id = key
		link.rel = 'stylesheet'
		link.type = 'text/css'
		link.href = stylesheetHref
		link.media = 'all'
		head.appendChild(link)
		//
		document[key] = true
	}
}
exports.InjectCSSFile_ifNecessary = InjectCSSFile_ifNecessary
//
function InjectCSSFiles_ifNecessary(
	stylesheetHrefs__orGeneratorFn,
	context__orNil
)
{
	var stylesheetHrefs;
	if (typeof stylesheetHrefs__orGeneratorFn === 'function') {
		stylesheetHrefs = stylesheetHrefs__orGeneratorFn(context__orNil)
	} else {
		stylesheetHrefs = stylesheetHrefs__orGeneratorFn
	}
	//
	const numberOf_stylesheetHrefs = stylesheetHrefs.length
	for (let i = 0 ; i < numberOf_stylesheetHrefs ; i++) {
		const stylesheetHref = stylesheetHrefs[i]
		InjectCSSFile_ifNecessary(stylesheetHref)
	}
}
exports.InjectCSSFiles_ifNecessary = InjectCSSFiles_ifNecessary