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
const Views__cssRules = require('../Views/cssRules.web')
// 
function ColorClassFor_NeutralBG() { return "neutralBG" }
function ColorClassFor_DarkBG() { return "darkBG" }
function ColorClassFor_LightBG() { return "lightBG" }
exports.ColorClassFor_NeutralBG = ColorClassFor_NeutralBG
exports.ColorClassFor_DarkBG = ColorClassFor_DarkBG
exports.ColorClassFor_LightBG = ColorClassFor_LightBG
//
const SizeClasses =
{
	Large48: "large-48",
	Large43: "large-43",
	Medium32: "medium-32",
}
exports.SizeClasses = SizeClasses
//
const NamespaceName = "walletIcons"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	// set bg clr on .walletIcon and .walletIcon > span
	`.walletIcon {
	  position: relative;
	}`,
	`.walletIcon:before {
	  content: " ";
	  display: block;
	  background: rgba(0, 0, 0, 0.2);
	}`,
	`.walletIcon:after {
	  content: " ";
	  margin: auto;
	  display: block;
	}`,
	`.walletIcon span {
	  margin: auto;
	  display: block;
	}`,
	`.walletIcon span:before {
	  content: " ";
	  width: 100%;
	  height: 100%;
	  display: block;
	  background: rgba(255, 255, 255, 0.2);
	}`,
	//
	// size classes…
	// large-48
	`.walletIcon.large-48 {
	  width: 48px;
	  height: 48px;
	  border-radius: 6px;
	}`,
	`.walletIcon.large-48:before {
	  width: 48px;
	  height: 10px;
	  border-radius: 6px 6px 0 0;
	  box-shadow: inset 0 -1px 1px 0 rgba(16, 14, 67, 0.2), 0 1px 0 0 rgba(255, 255, 255, 0.1);
	}`,
	// // :after - base
	`.walletIcon.large-48:after {
	  width: 38px;
	  height: 33px;
	  border-radius: 0 0 3px 3px;
	}`,
	// // :after - variations
	`.walletIcon.large-48:after, 
	 .walletIcon.neutralBG.large-48:after {
	  box-shadow: inset 0 -2px 4px 0 rgba(255, 255, 255, 0.4), 0 0 4px 0 rgba(255, 255, 255, 0.4);
	}`,
	`.walletIcon.darkBG.large-48:after {
	  box-shadow: inset 0 -2px 4px 0 rgba(255, 255, 255, 0.2), 0 0 4px 0 rgba(255, 255, 255, 0.2);
	}`,
	`.walletIcon.lightBG.large-48:after {
	  box-shadow: inset 0 -2px 4px 0 rgba(255, 255, 255, 0.6), 0 0 4px 0 rgba(255, 255, 255, 0.6);
	}`,
	// // span - the card
	`.walletIcon.large-48 span {
	  width: 38px;
	  height: 6px;
	  border-radius: 3px 3px 0 0;
	  margin-top: -6px;
	}`,
	`.walletIcon.large-48 span:before {
	  border-radius: 3px 3px 0 0;
	  box-shadow: inset 0 -1px 1px 0 rgba(16, 14, 67, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
	}`,
	//
	// large-43
	`.walletIcon.large-43 {
	  width: 43px;
	  height: 43px;
	  border-radius: 5px;
	}`,
	`.walletIcon.large-43:before {
	  width: 43px;
	  height: 9px;
	  border-radius: 5px 5px 0 0;
	  box-shadow: inset 0 -1px 1px 0 rgba(16, 14, 67, 0.2), 0 1px 0 0 rgba(255, 255, 255, 0.1);
	}`,
	// // :after - base
	`.walletIcon.large-43:after {
	  width: 35px;
	  height: 30px;
	  border-radius: 0 0 3px 3px;
	}`,
	// // :after - variations
	`.walletIcon.large-43:after, 
	 .walletIcon.neutralBG.large-43:after {
   	  box-shadow: inset 0 -1px 4px 0 rgba(255, 255, 255, 0.4), 0 0 3px 0 rgba(255, 255, 255, 0.4);
	}`,
	`.walletIcon.darkBG.large-43:after {
  	  box-shadow: inset 0 -1px 4px 0 rgba(255, 255, 255, 0.2), 0 0 3px 0 rgba(255, 255, 255, 0.2);
	}`,
	`.walletIcon.lightBG.large-43:after {
  	  box-shadow: inset 0 -1px 4px 0 rgba(255, 255, 255, 0.6), 0 0 3px 0 rgba(255, 255, 255, 0.6);
	}`,
	// // span (the card)
	`.walletIcon.large-43 span {
	  width: 35px;
	  height: 5px;
	  border-radius: 3px 3px 0 0;
	  margin-top: -5px;
	}`,
	`.walletIcon.large-43 span:before {
	  border-radius: 3px 3px 0 0;
	  box-shadow: inset 0 -1px 1px 0 rgba(16, 14, 67, 0.3), inset 0 0.5px 0 0 rgba(255, 255, 255, 0.2);
	}`,
	//
	// medium-32
	`.walletIcon.${SizeClasses.Medium32} {
	  width: 32px;
	  height: 32px;
	  border-radius: 5px;
	}`,
	`.walletIcon.${SizeClasses.Medium32}:before {
	  width: 32px;
	  height: 7px;
	  border-radius: 5px 5px 0 0;
	  box-shadow: inset 0 -0.5px 1px 0 rgba(16, 14, 67, 0.2), 0 1px 0 0 rgba(255, 255, 255, 0.1);
	}`,
	// // :after - base
	`.walletIcon.${SizeClasses.Medium32}:after {
	  width: 26px;
	  height: 23px;
	  border-radius: 0 0 3px 3px;
	}`,
	// // :after - variations
	`.walletIcon.${SizeClasses.Medium32}:after, 
	 .walletIcon.neutralBG.${SizeClasses.Medium32}:after {
   	  box-shadow: inset 0 -0.5px 1.5px 0 rgba(255, 255, 255, 0.4), 0 0 1.5px 0 rgba(255, 255, 255, 0.4);
	}`,
	`.walletIcon.darkBG.${SizeClasses.Medium32}:after {
  	  box-shadow: inset 0 -0.5px 1.5px 0 rgba(255, 255, 255, 0.2), 0 0 1.5px 0 rgba(255, 255, 255, 0.2);
	}`,
	`.walletIcon.lightBG.${SizeClasses.Medium32}:after {
  	  box-shadow: inset 0 -0.5px 1.5px 0 rgba(255, 255, 255, 0.6), 0 0 1.5px 0 rgba(255, 255, 255, 0.6);
	}`,
	// // span (the card)
	`.walletIcon.${SizeClasses.Medium32} span {
	  width: 26px;
	  height: 4px;
	  border-radius: 3px 3px 0 0;
	  margin-top: -4px;
	}`,
	`.walletIcon.${SizeClasses.Medium32} span:before {
	  border-radius: 3px 3px 0 0;
	  box-shadow: inset 0 -.5px .5px 0 rgba(16, 14, 67, 0.2), inset 0 0.5px 0 0 rgba(255, 255, 255, 0.1);
	}`,
]
function __injectCSSRules_ifNecessary()
{
	Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_WalletIconLayer(optl_sizeClass)
{
	var sizeClass = optl_sizeClass || SizeClasses.Large48
	//
	__injectCSSRules_ifNecessary()
	//
	const div = document.createElement("div")
	div.classList.add("walletIcon")
	div.classList.add(sizeClass)
	//
	const span = document.createElement("span")
	div.appendChild(span)
	//
	div.ConfigureWithHexColorString = function(to_hexColorString)
	{
		div.style.background = to_hexColorString
		span.style.background = to_hexColorString
		{
			div.classList.remove(ColorClassFor_NeutralBG())
			div.classList.remove(ColorClassFor_DarkBG())
			div.classList.remove(ColorClassFor_LightBG())
			//
			var to_colorClass ;
			switch (to_hexColorString) {
				// TODO: these colors should probalby be accessed via context.walletsListController or (?) context.themeController
				case "#6B696B": // dark grey	
				case "#D975E1": // purple
				case "#F97777": // salmon/red
				case "#EB8316": // orange
					to_colorClass = ColorClassFor_DarkBG()
					break
				case "#00F4CD": // teal
					to_colorClass = ColorClassFor_LightBG()
					break
				default:
					to_colorClass = ColorClassFor_NeutralBG() // not necessary to set tho
					break
			}
			//
			div.classList.add(to_colorClass)
		}
	}
	//
	return div
}
exports.New_WalletIconLayer = New_WalletIconLayer