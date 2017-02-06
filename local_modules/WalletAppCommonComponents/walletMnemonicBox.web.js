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
const commonComponents_cssRules = require('./cssRules.web')
//
const NamespaceName = "walletMnemonicBox"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
document[haveCSSRulesBeenInjected_documentKey] = false
const cssRules =
[
	`.mnemonic-container {
		background: #1D1B1D;
		border: 1px solid #282527; /* invisible border for validation highlight layout */
		box-shadow: inset 0 1px 0 0 #161416, 0 0.5px 0 0 rgba(56, 54, 56, 0.5);
		border-radius: 5px;
		margin: 0 auto 7px auto;
	}`,
	`.mnemonic-container.errored {
		border: 1px solid #f97777;
	`,
	`.mnemonic-container a {
		cursor: default;
	}`,
	`.mnemonic-pill,
	 .mnemonic-pill--selectedPlaceholder {
		color: white;
		cursor: default;
		text-decoration: none;
		text-transform: uppercase;
		font-size: 11px;
		letter-spacing: 0.8px;
		font-weight: 300;
		background: #383638;
		padding: 4px 8px;
		margin: 4px;
		border-radius: 3px;
		box-shadow: inset 0 0.5px 0 0 #494749, 0 0.5px 1px 0 #161416;
		transition: all 0.1s ease-out;
		display: inline-block;
	}`,
	`.mnemonic-pill:not(.disabled):hover,
	 .mnemonic-pill--selectedPlaceholder:not(.disabled):hover {
		background: #494749;
		box-shadow: inset 0 0.5px 0 0 #5A585A, 0 0.5px 1px 0 #161416;
		transition: all 0.1s ease-out;
	}`,
	`.mnemonic-pill--selectedPlaceholder {
		color: #1D1B1D;
		background: #1D1B1D;
		box-shadow: inset 0 1px 0 0 #161416, 0 0.5px 0 0 rgba(56, 54, 56, 0.5);
	}`,
	`.mnemonic-pill--selectedPlaceholder:not(.disabled):hover {
		color: #1D1B1D;
		background: #1D1B1D;
		box-shadow: inset 0 1px 0 0 #161416, 0 0.5px 0 0 rgba(56, 54, 56, 0.5);
	}`
]
function __injectCSSRules_ifNecessary()
{
	commonComponents_cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_MnemonicTextDisplayView(mnemonicString, context)
{
	__injectCSSRules_ifNecessary()
	//
	const view = new View({}, context)
	const layer = view.layer
	layer.className = "mnemonic-container"
	const padding_v = 35
	layer.style.minHeight = `${128 - 2*padding_v}px`
	layer.style.padding = `${padding_v}px 24px`
	layer.style.width = `calc(100% - ${2*16}px - ${2*24}px)`
	layer.style.wordBreak = "break-word"
	layer.style.lineHeight = "20px"
	layer.style.fontSize = "13px"
	layer.style.marginBottom = "23px"
	layer.style.color = "#9e9c9e"
	layer.style.webkitUserSelect = "all" // allow selection here
	layer.style.fontFamily = context.themeController.FontFamily_monospace()
	layer.innerHTML = mnemonicString
	//
	return view
}
exports.New_MnemonicTextDisplayView = New_MnemonicTextDisplayView
//
function New_MnemonicConfirmation_SelectedWordsView(mnemonicString, context, didSelectWord_fn, didDeselectWord_fn)
{
	__injectCSSRules_ifNecessary()
	//
	didSelectWord_fn = didSelectWord_fn || function(word) {}
	didDeselectWord_fn = didDeselectWord_fn || function(word) {}
	//
	const view = new View({}, context)
	{
		const layer = view.layer
		layer.className = "mnemonic-container"
		const padding_v = 20 // instead of 24, because word elements have v margin of 4
		layer.style.minHeight = `${129 - 2*padding_v}px`
		layer.style.padding = `${padding_v}px 24px`
		layer.style.width = `calc(100% - ${2*16}px - ${2*24}px)`
		layer.style.textAlign = "center"
	}
	const mnemonicWords = mnemonicString.split(" ")
	const ordered_selectedWords = []
	view.Component_SelectedWords = ordered_selectedWords
	const selectedWord_viewsByWord = {}
	// Component - Methods - Setup - Imperatives
	view.Component_ConfigureWith_selectableWordsView = function(mnemonicConfirmation_selectableWordsView)
	{
		view.mnemonicConfirmation_selectableWordsView = mnemonicConfirmation_selectableWordsView
	}
	// Component - Methods - Teardown - Imperatives
	view.TearDown = function()
	{
		view.mnemonicConfirmation_selectableWordsView = null
	}
	// Component - Methods - Runtime - Imperatives
	view.Component_SelectMnemonicWord = function(word, mnemonicConfirmation_selectableWordsView)
	{
		if (view.isEnabled == false) {
			console.warn("Selected but not enabled")
			return
		}
		ordered_selectedWords.push(word)
		//
		const wordView = _new_MnemonicConfirmation_WordView(word, context)
		const wordView_layer = wordView.layer
		wordView_layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				if (view.isEnabled == false) {
					console.warn("Word deselected but control not enabled")
					return
				}
				const this_wordView_layer = this
				this_wordView_layer.href = "" // no longer clickable
				const word = this_wordView_layer.__component_mnemonicWord
				if (!word || typeof word === 'undefined') {
					throw "No word associated with clicked layer"
				}
				view.Component_DeselectMnemonicWord(word)
				return false
			}
		)
		selectedWord_viewsByWord[word] = wordView
		view.layer.appendChild(wordView_layer)
		//
		didSelectWord_fn(word)
	}
	view.Component_DeselectMnemonicWord = function(word)
	{
		{
			const indexOf_word = ordered_selectedWords.indexOf(word)
			if (indexOf_word === -1) {
				throw "Word not found in list of selected words."
			}
			ordered_selectedWords.splice(indexOf_word, 1) // remove
		}
		{
			const wordView = selectedWord_viewsByWord[word]
			const wordView_layer = wordView.layer
			delete selectedWord_viewsByWord[word]
			view.layer.removeChild(wordView_layer)
			//
			view.mnemonicConfirmation_selectableWordsView.Component_WordWasDeselected(word)
			//
			didDeselectWord_fn(word)
		}
	}
	view.Component_DeselectAllWords = function()
	{
		const copyOf_ordered_selectedWords = ordered_selectedWords.slice()
		copyOf_ordered_selectedWords.forEach(
			function(word, i)
			{
				view.Component_DeselectMnemonicWord(word)
			}
		)
	}
	view.Component_SetEnabled = function(isEnabled)
	{
		if (view.isEnabled == isEnabled) {
			console.warn("Already isEnabled", isEnabled)
			return
		}
		view.isEnabled = isEnabled
		const wordKeys = Object.keys(selectedWord_viewsByWord)
		wordKeys.forEach(
			function(wordKey, i)
			{
				const wordView = selectedWord_viewsByWord[wordKey]
				if (isEnabled == false) {
					wordView.layer.classList.add("disabled")
				} else {
					wordView.layer.classList.remove("disabled")
				}
			}
		)
	}
	//
	return view
}
exports.New_MnemonicConfirmation_SelectedWordsView = New_MnemonicConfirmation_SelectedWordsView
//
function _new_MnemonicConfirmation_WordView(word, context, showAsAlreadySelectedPlaceholder)
{
	showAsAlreadySelectedPlaceholder = showAsAlreadySelectedPlaceholder === true ? true : false
	//
	const view = new View({ tag: "a" }, context)
	const layer = view.layer
	layer.className = "mnemonic-pill"
	if (showAsAlreadySelectedPlaceholder) {
		layer.href = "" // non-clickable
	} else {
		layer.href = "#"
	}
	layer.style.fontFamily = context.themeController.FontFamily_monospace()
	layer.innerHTML = word.toUpperCase()
	layer.__component_mnemonicWord = word
	//
	return view
}
//
function New_MnemonicConfirmation_SelectableWordsView(
	mnemonicString, 
	mnemonicConfirmation_selectedWordsView, 
	context
)
{
	__injectCSSRules_ifNecessary()
	//
	const view = new View({}, context)
	{
		const layer = view.layer
		const padding_v = 24
		layer.style.padding = `${padding_v}px 24px`
		layer.style.width = `calc(100% - ${2*16}px - ${2*24}px)`
		layer.style.textAlign = "center"
		layer.style.marginTop = "10px"
	}
	const shuffled_mnemonicWords = new_shuffledArray(mnemonicString.split(" "))
	const wordViews_byWord = {}
	shuffled_mnemonicWords.forEach(
		function(word, i)
		{
			const wordView = _new_MnemonicConfirmation_WordView(word, context)
			wordViews_byWord[word] = wordView
			//
			const wordView_layer = wordView.layer
			view.layer.appendChild(wordView_layer)
			//
			wordView_layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					if (mnemonicConfirmation_selectedWordsView.isEnabled == false) {
						console.warn("Word selected but disabled.")
						return false
					}
					const this_wordView_layer = this
					const selectedClass = "mnemonic-pill--selectedPlaceholder"
					if (this_wordView_layer.className !== selectedClass) { // so, if it's not already picked
						this_wordView_layer.className = selectedClass // flip to selected type
						this_wordView_layer.href = "" // no longer clickable
						const word = this_wordView_layer.__component_mnemonicWord
						if (!word || typeof word === 'undefined') {
							throw "No word associated with clicked layer"
						}
						mnemonicConfirmation_selectedWordsView.Component_SelectMnemonicWord(word)
					}
					return false
				}
			)
		}
	)
	// Component - Methods - Teardown - Imperatives
	view.TearDown = function()
	{ // nothing to do (yet)
	}
	// Component - Methods - Runtime - Delegation
	view.Component_WordWasDeselected = function(word)
	{ 
		const wordView = wordViews_byWord[word]
		const this_wordView_layer = wordView.layer
		this_wordView_layer.className = "mnemonic-pill" // flip back to selectable type
		this_wordView_layer.href = "#" // clickable again
	}
	return view
}
exports.New_MnemonicConfirmation_SelectableWordsView = New_MnemonicConfirmation_SelectableWordsView
//
function new_shuffledArray(array)
{
	var currentIndex = array.length
	var temporaryValue
	var randomIndex
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1
		//
		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}
	return array
}