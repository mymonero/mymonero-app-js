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
const commonComponents_forms = require('./forms.web')
//
const emoji_web = require('../Emoji/emoji_web')
//
const NamespaceName = "contactPicker"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	// autocomplete-results rows
	`.${NamespaceName} .autocomplete-results .row .emojione {
		position: absolute;
		left: 5px;
		top: -1px;
		transform: scale(.5);
	}`,
	`.${NamespaceName} .autocomplete-results .row .title {
		position: absolute;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		top: 0px;
		left: 48px;
		width: calc(100% - 48px - 12px)
	}`,
	`.${NamespaceName} .autocomplete-results .row .title.withNonNativeEmoji	 {
	}`,
	//
	// picked contacts
	`.${NamespaceName} .picked-contact .emojione {
		position: absolute;
		left: 1px;
		top: -1px;
		transform: scale(.5);
	}`,
	`.${NamespaceName} .picked-contact .title {
		margin-left: 10px;
	}`,
	`.${NamespaceName} .picked-contact .title.withNonNativeEmoji {
		margin-left: 21px;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function New_contactPickerLayer(
	context,
	placeholderText, 
	contactsListController,
	didPickContact_fn,
	didClearPickedContact_fn,
	didFinishTypingInInput_fn // ((event?) -> Void)? 
) //  -> Component (which is just a customized DOM element obj)
{ // NOTE: You must call Component_TearDown when you're done with this component
	if (!contactsListController) {
		throw "New_contactPickerLayer requires a contactsListController"
	}
	__injectCSSRules_ifNecessary()
	//
	const containerLayer = document.createElement("div")
	containerLayer.classList.add(NamespaceName)
	containerLayer.style.position = "relative"
	containerLayer.style.width = "100%"
	containerLayer.style.webkitUserSelect = "none" // disable selection
	//
	const inputLayer = _new_inputLayer(placeholderText, context)
	containerLayer.ContactPicker_inputLayer = inputLayer // so it can be accessed by consumers who want to check if the inputLayer is empty on their submission
	containerLayer.appendChild(inputLayer)
	{ // observation of inputLayer
		var isFocused = false
		var hideResultsOnBlur_timeout = null
		inputLayer.addEventListener(
			"blur",
			function(event)
			{
				isFocused = false
				setTimeout(function()
				{ // wait for a few ms in case this blur is happening because of it a click - because if it is,
					// it prevents a click on the result as the results are hidden (due to blur) before the result
					// layer can receive the click
					if (isFocused === false) { // user did not refocus
						_removeAllAndHideAutocompleteResults()
					}
				}, 100) // 50ms didn't do it (which is kind of concerning)
			}
		)
		inputLayer.addEventListener(
			"focus",
			function(event)
			{
				isFocused = true
				// always search, even if no query, as long as focused
				_searchForAndDisplaySearchResults()
				//
				if (context.CommonComponents_Forms_scrollToInputOnFocus == true) {
					inputLayer.Component_ScrollIntoViewInFormContainerParent()
				}
			}
		)
		inputLayer.Component_ScrollIntoViewInFormContainerParent = function()
		{ // this could also be called on window resize
			const this_layer = this
			commonComponents_forms._shared_scrollConformingElementIntoView(this_layer)
		}
		inputLayer.addEventListener(
			"input", 
			function()
			{
				_inputLayer_receivedInputOrChanged(undefined) // this might seem redundant and/or to race with "keyup" but it doesn't affect _inputLayer_receivedInputOrChanged 
			}
		)
		inputLayer.addEventListener(
			"change", // try to catch paste on as many platforms as possible
			function()
			{
				_inputLayer_receivedInputOrChanged(undefined) // this might seem redundant and/or to race with "keyup" but it doesn't affect _inputLayer_receivedInputOrChanged 
			}
		)
		inputLayer.addEventListener(
			"keyup",
			function(event)
			{
				const code = event.code
				const wasEscapeKey = code == "Escape" || event.keyCode == 27 /* should we use keyCode? */
				if (wasEscapeKey) { // toggle search results visibility
					if (autocompleteResultsLayer.style.display != "none") {
						_removeAllAndHideAutocompleteResults()
					} else {
						_searchForAndDisplaySearchResults()
					}
					// TODO: clear input? esp if esc hit twice?
					return // think it's ok to just return here and not mess with the typingDebounceTimeout
				}
				const wasOnlyModifierKey = code.indexOf("Meta") != -1 || code.indexOf("Alt") != -1 || code.indexOf("Control") != -1
				if (wasOnlyModifierKey) {
					console.log("Input was only modifier key. Ignoring.")
					return
				}
				_inputLayer_receivedInputOrChanged(event)
			}
		)
	}
	const autocompleteResultsLayer = _new_autocompleteResultsLayer()
	containerLayer.appendChild(autocompleteResultsLayer)
	//
	// imperatives
	function _removeAllAndHideAutocompleteResults()
	{
		_removeAllSearchResults()
		autocompleteResultsLayer.style.display = "none"
	}
	function _searchForAndDisplaySearchResults()
	{
		var results;
		{
			const contacts = contactsListController.records
			// filter?
			const searchString = inputLayer.value
			if (typeof searchString === 'undefined' || !searchString || searchString === "") {
				results = contacts
			} else {
				results = []
				{ // finalize
					const search_regex = new RegExp(searchString, "i") // case insensitive
					const numberOf_contacts = contacts.length // we're assuming we've booted by the time they're using the RequestFunds form
					for (var i = 0 ; i < numberOf_contacts ; i++) {
						const contact = contacts[i]
						const isMatch = contact.fullname.search(search_regex) !== -1 // positional rather than boolean
						if (isMatch === true) {
							results.push(contact)
						}
					}
				}
			}
		}
		if (results.length == 0) {
			_removeAllAndHideAutocompleteResults() // not that it would be visible
			return
		}
		_hydrateWithSearchResults(results)
		autocompleteResultsLayer.style.display = "block"
	}
	function _hydrateWithSearchResults(contacts)
	{
		_removeAllSearchResults()
		//
		const numberOf_contacts = contacts.length
		for (var i = 0 ; i < numberOf_contacts ; i++) {
			const contact = contacts[i]
			const isAtEnd = i === (numberOf_contacts-1)
			const layer = _new_autocompleteResultRowLayer(
				context,
				contact, 
				isAtEnd,
				function(clicked_contact)
				{
					_pickContact(clicked_contact)
				}
			)
			autocompleteResultsLayer.appendChild(layer)
		}
	}
	function _removeAllSearchResults()
	{
		const layer = autocompleteResultsLayer
		var firstChild = layer.firstChild
		while (firstChild !== null) {
			layer.removeChild(firstChild)
			firstChild = layer.firstChild // next
		}
	}
	function _clearAndHideInputLayer()
	{
		inputLayer.value = ""
		inputLayer.style.display = "none"
		inputLayer.blur() // just in case mobile keyboard is up
	}
	function _redisplayInputLayer()
	{
		inputLayer.style.display = "block"
	}
	var __pickedContact = null
	function _pickContact(contact)
	{
		_removeAllAndHideAutocompleteResults()
		_removeExistingPickedContact() // but don't do stuff like focusing the input layer
		_clearAndHideInputLayer()
		//
		__pickedContact = contact
		_displayPickedContact(contact)
		//
		didPickContact_fn(contact)
	}
	containerLayer.ContactPicker_pickContact = _pickContact // exposing this as consumers need it
	var __pickedContactLayer = null;
	function _removeExistingPickedContact()
	{
		const existing__pickedContact = __pickedContact
		const hadExistingContact = existing__pickedContact !== null
		__pickedContact = null
		if (__pickedContactLayer !== null) {
			containerLayer.removeChild(__pickedContactLayer)
			__pickedContactLayer = null
		}
		if (hadExistingContact) {
			if (didClearPickedContact_fn) {
				didClearPickedContact_fn(existing__pickedContact)
			}
		}
	}
	function _unpickExistingContact_andRedisplayPickInput(andDoNotFocus)
	{
		_removeExistingPickedContact()
		_redisplayInputLayer()
		if (andDoNotFocus !== true) {
			setTimeout(function()
			{ // to decouple redisplay of input layer and un-picking from the display of the unfiltered results triggered by this focus:
				inputLayer.focus() 
			})
		}
	}
	containerLayer.ContactPicker_unpickExistingContact_andRedisplayPickInput = _unpickExistingContact_andRedisplayPickInput
	function _displayPickedContact(contact)
	{
		__pickedContactLayer = _new_pickedContactLayer(
			context,
			contact,
			function(this_pickedContactLayer)
			{
				if (inputLayer.disabled === true) { // TODO: modify this once we have an public interface for disabling the contact picker
					console.log("💬  Disallowing user unpick of contact while inputLayer is disabled.")
					return
				}
				_unpickExistingContact_andRedisplayPickInput() // allow to autofocus layer
			}
		)
		containerLayer.appendChild(__pickedContactLayer)
	}
	//
	// Delegation
	var typingDebounceTimeout = null
	function _inputLayer_receivedInputOrChanged(optl_event)
	{
		//
		// timeout-clearing key pressed
		if (typingDebounceTimeout !== null) {
			clearTimeout(typingDebounceTimeout)
		}
		const this_inputLayer = this
		typingDebounceTimeout = setTimeout(function()
		{ // to prevent searching too fast
			typingDebounceTimeout = null // clear for next
			//
			if (didFinishTypingInInput_fn) {
				didFinishTypingInInput_fn(optl_event)
			}
			_searchForAndDisplaySearchResults()
		}, 350)
	}
	//
	// observing contacts list controller for deletions 
	var _contactsListController_EventName_deletedRecordWithId_fn = function(_id)
	{ // the currently picked contact was deleted, so unpick it
		if (__pickedContact && __pickedContact._id === _id) {
			_unpickExistingContact_andRedisplayPickInput(true)
		}
	}
	contactsListController.on(
		contactsListController.EventName_deletedRecordWithId(),
		_contactsListController_EventName_deletedRecordWithId_fn
	)
	containerLayer.Component_TearDown = function()
	{ // IMPORTANT: You must call this when you're done with this component
		console.log("♻️  Tearing down contacts picker.")
		contactsListController.removeListener(
			contactsListController.EventName_deletedRecordWithId(),
			_contactsListController_EventName_deletedRecordWithId_fn
		)
		_contactsListController_EventName_deletedRecordWithId_fn = null
	}
	//
	return containerLayer
}
exports.New_contactPickerLayer = New_contactPickerLayer
//
function _new_inputLayer(placeholderText, context)
{
	const layer = commonComponents_forms.New_fieldValue_textInputLayer(context, {
		placeholderText: placeholderText
	})
	return layer
}
function _new_autocompleteResultsLayer()
{
	const layer = document.createElement("div")
	layer.classList.add("autocomplete-results")
	layer.style.position = "absolute"
	layer.style.top = "30px" // below txt field -- TODO:? pass value as arg/constant
	layer.style.width = "100%"
	layer.style.maxHeight = "155px"
	layer.style.minHeight = "30px"
	layer.style.backgroundColor = "#FCFBFC"
	layer.style.borderRadius = "3px"
	layer.style.boxShadow = "0 15px 12px 0 rgba(0,0,0,0.22), 0 19px 38px 0 rgba(0,0,0,0.30)"
	layer.style.overflowY = "auto"
	// layer.style.webkitOverflowScrolling = "touch"
	layer.style.zIndex = "10000" // above everything - even action buttons (absolute z-index alone may not be a sustainable methodology here)
	//
	layer.style.display = "none" // for now - no results at init!
	//
	return layer
}
function _new_autocompleteResultRowLayer(context, contact, isAtEnd, clicked_fn)
{
	const height = 31
	const padding_h = 15
	const layer = document.createElement("div")
	layer.classList.add("row")
	layer.style.position = "relative"
	layer.style.left = "0"
	layer.style.boxSizing = "border-box"
	layer.style.padding = `0 ${padding_h}px`
	layer.style.width = `100%`
	layer.style.height = height+"px"
	layer.style.color = "#1D1B1D"
	layer.style.fontSize = "13px"
	layer.style.fontWeight = "500"
	layer.style.fontFamily = context.themeController.FontFamily_sansSerif()
	layer.style.lineHeight = height+"px" // this is commented because it's overridden in the CSS rules above
	layer.style.webkitUserSelect = "none" // redundant but for explicitness
	layer.style.cursor = "pointer"
	layer.style.whiteSpace = "nowrap"
	layer.style.overflow = "hidden"
	layer.style.textOverflow = "ellipsis"
	const imageBackedEmojiHTMLString = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
		context,
		contact.emoji
	)
	var titleClasses = "title"
	if (context.Emoji_renderWithNativeEmoji !== true) {
		titleClasses += " withNonNativeEmoji"
	}
	layer.innerHTML = `${imageBackedEmojiHTMLString}&nbsp;<span class="${titleClasses}">${contact.fullname}</span>`
	{
		layer.addEventListener("mouseover", function() { this.highlight() })
		layer.addEventListener("mouseleave", function() { this.unhighlight() }) // will this be enough?
		layer.addEventListener("drag", function(e) { e.preventDefault(); e.stopPropagation(); return false; }) // prevent accidental drag from interfering with user's expectation of a successful click
		//
		const clickLike_eventName = 
			typeof document.body.ontouchstart === "undefined" 
			? "mousedown"
			: "touchstart"
		layer.addEventListener(clickLike_eventName, function(e)
		{ // not click, because of race conditions w/ the input focus and drags etc; plus it's snappier
			e.preventDefault()
			e.stopPropagation()
			clicked_fn(contact)
			return false
		})
	}
	layer.highlight = function()
	{
		this.style.backgroundColor = "#DFDEDF"
	}
	layer.unhighlight = function()
	{
		this.style.backgroundColor = "transparent"
	}
	//
	if (isAtEnd !== true) {
		const lineLayer = document.createElement("div")
		lineLayer.style.position = "absolute"
		lineLayer.style.left = "50px"
		lineLayer.style.right = "0"
		const lineHeight = 1
		lineLayer.style.height = lineHeight+"px"
		lineLayer.style.top = (height - lineHeight) + "px"
		lineLayer.style.backgroundColor = "#DFDEDF"
		layer.appendChild(lineLayer)
	}
	//
	return layer
}
function _new_pickedContactLayer(context, contact, didClickCloseBtn_fn)
{
	const layer = document.createElement("div")
	layer.classList.add("picked-contact")
	const contentLayer = document.createElement("div")
	layer.appendChild(contentLayer)
	{ // ^-- using a content layer here so we can get width-of-content behavior with inline-block
		// while getting parent to give us display:block behavior
		const imageBackedEmojiHTMLString = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
			context,
			contact.emoji
		)
		var titleClasses = "title"
		if (context.Emoji_renderWithNativeEmoji !== true) {
			titleClasses += " withNonNativeEmoji"
		}
		contentLayer.innerHTML = `${imageBackedEmojiHTMLString}&nbsp;<span class="${titleClasses}">${contact.fullname}</span>`
		contentLayer.style.boxSizing = "border-box"
		contentLayer.style.position = "relative"
		contentLayer.style.maxWidth = "274px"
		if (context.Emoji_renderWithNativeEmoji !== true) {
			contentLayer.style.left = "0"
			contentLayer.style.height = "31px"
			contentLayer.style.padding = `8px ${8 + 30}px 5px 10px`
		} else {
			contentLayer.style.padding = `3px ${8 + 30}px 5px 10px`
		}
		contentLayer.style.whiteSpace = "nowrap"
		contentLayer.style.overflow = "hidden"
		contentLayer.style.textOverflow = "ellipsis"
		contentLayer.style.backgroundColor = "#383638"
		if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
			contentLayer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
		} else { // avoiding drop shadow
			contentLayer.style.boxShadow = "inset 0 0.5px 0 0 #494749"

		}
		contentLayer.style.borderRadius = "3px"
		contentLayer.style.display = "inline-block"
		contentLayer.style.cursor = "default"

		contentLayer.style.fontSize = "13px"
		contentLayer.style.fontWeight = "300"
		contentLayer.style.fontFamily = context.themeController.FontFamily_monospaceRegular()

		contentLayer.style.color = "#FCFBFC"
		// contentLayer.style.webkitFontSmoothing = "subpixel-antialiased"
		const xButtonLayer = document.createElement("a")
		contentLayer.appendChild(xButtonLayer)
		{
			xButtonLayer.style.display = "block" // to get margin and bounds
			xButtonLayer.style.position = "absolute"
			xButtonLayer.style.right = "0px"
			xButtonLayer.style.top = "0px"
			xButtonLayer.style.width = "34px"
			xButtonLayer.style.height = "100%"
			xButtonLayer.style.backgroundImage = "url("+context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"MMAppUICommonComponents/Resources/contactPicker_xBtnIcn@3x.png)"
			xButtonLayer.style.backgroundSize = "11px 10px"
			xButtonLayer.style.backgroundPosition = "center"
			xButtonLayer.style.backgroundRepeat = "no-repeat"
			xButtonLayer.style.cursor = "pointer"
			xButtonLayer.addEventListener("click", function(e)
			{
				e.preventDefault()
				const this_a = this
				const this_pickedContactLayer = this_a.parentNode.parentNode // two levels due to contentLayer
				didClickCloseBtn_fn(this_pickedContactLayer)
				return false
			})
		}
	}
	return layer
}