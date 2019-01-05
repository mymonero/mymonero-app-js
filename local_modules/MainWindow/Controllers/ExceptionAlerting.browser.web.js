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
const animationDuration_s = 0.5
const displayDelay_s = 20
//
const Views__cssRules = require('../../Views/cssRules.web')
const NamespaceName = "ExceptionAlerting"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
function cssRules_generatorFn(context)
{
	const cssRules =
	[
		`.exceptiontoast {
			visibility: hidden;
			min-width: 250px;
			margin-left: -125px;
			background-color: #333;
			color: #F99999;
			text-align: left;
			border-radius: 4px;
			border: 1px solid rgba(255, 255, 255, 0.3);
			padding: 16px;
			position: fixed;
			font-family: ${context.themeController.FontFamily_sansSerif()};
			z-index: 1;
			left: 50%;
			bottom: 30px;
			font-size: 13px;
			font-weight: 500;

		    -webkit-touch-callout: all !important;
		    -webkit-text-size-adjust: all !important;
		    -webkit-user-select: all !important;

		    -moz-touch-callout: all !important;
		    -moz-text-size-adjust: all !important;
		    -moz-user-select: all !important;

		    -ms-touch-callout: all !important;
		    -ms-text-size-adjust: all !important;
		    -ms-user-select: all !important;

		    touch-callout: all !important;
		    text-size-adjust: all !important;
		    user-select: all !important;
		}`,
		`.exceptiontoast.show {
			visibility: visible;
			-webkit-animation: fadein_exceptiontoast ${animationDuration_s}s, fadeout_exceptiontoast ${animationDuration_s}s ${displayDelay_s}s;
			animation: fadein_exceptiontoast ${animationDuration_s}s, fadeout_exceptiontoast ${animationDuration_s}s ${displayDelay_s}s;
		}`,
		`@-webkit-keyframes fadein_exceptiontoast {
			from {bottom: 0; opacity: 0;} 
			to {bottom: 30px; opacity: 1;}
		}`,
		`@keyframes fadein_exceptiontoast {
			from {bottom: 0; opacity: 0;}
			to {bottom: 30px; opacity: 1;}
		}`,
		`@-webkit-keyframes fadeout_exceptiontoast {
			from {bottom: 30px; opacity: 1;} 
			to {bottom: 0; opacity: 0;}
		}`,
		`@keyframes fadeout_exceptiontoast {
			from {bottom: 30px; opacity: 1;}
			to {bottom: 0; opacity: 0;}
		}`,
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
class ExceptionAlerting
{
	constructor(options, context)
	{
		const self = this
		//
		self.options = options
		self.context = context
		//
		self.setup()
	}
	setup()
	{
		const self = this
		__injectCSSRules_ifNecessary(self.context)
		self._startObserving()
	}
	_startObserving()
	{
		const self = this
		window.onerror = function(message, file, line, col, error) 
		{
			self.alertErrMsg(error.message, 1)
			return false;
		}
		window.addEventListener("error", function(e) 
		{
			self.alertErrMsg(e.error.message, 2)
			return false;
		})
		window.addEventListener('unhandledrejection', function(e) 
		{
			self.alertErrMsg(e.reason.message, 3)
			return false
		})
	}
	//
	// Imperatives
	alertErrMsg(message, handlerId)
	{
		const self = this
		if (message.indexOf("undefined") !== -1 && message.indexOf("handler") !== -1) {
			return // most likely an error from webflow - can skip erroring these ; TODO: remove this when removing webflow
		}
		if (typeof message !== 'undefined' && message && message !== "") {
			self.doToastMessage("Unhandled error. Please inform MyMonero Support of this message: " + message, message);
		} else {
			self.doToastMessage("Unrecognized error occured. Please contact Support with steps and browser informations.", undefined)
		}
	}
	doToastMessage(message, raw_message)
	{
		var el = document.createElement("div")
		el.classList.add("exceptiontoast")
		el.appendChild(document.createTextNode(message)) // safely escape content
		document.body.appendChild(el)
		setTimeout(function()
		{
			el.classList.add("show")
			const finalRemoveDelay_s = animationDuration_s + displayDelay_s
			setTimeout(function() { 
				el.classList.remove("show") // just so we can get the visibility:hidden in place -- probably not necessary
				el.parentNode.removeChild(el)
			}, finalRemoveDelay_s * 1000);
		})
		setTimeout(function()
		{
			window.ga('send', 'exception', {
				'exDescription': raw_message ? raw_message : 'undefined'
			});
		})
	}
}
module.exports = ExceptionAlerting
