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
function New_contactPickerLayer(
	placeholderText, 
	contactsListController,
	didPickContact_fn,
	didClearPickedContact_fn,
	didFinishTypingInInput_fn
) //  -> Component (which is just a customized DOM element obj)
{ // NOTE: You must call Component_TearDown when you're done with this component
	if (!contactsListController) {
		throw "New_contactPickerLayer requires a contactsListController"
	}
	const containerLayer = document.createElement("div")
	{
		containerLayer.style.position = "relative"
		containerLayer.style.width = "100%"
		containerLayer.style.webkitUserSelect = "none" // disable selection
	}
	const inputLayer = _new_inputLayer(placeholderText)
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
			}
		)
		var typingDebounceTimeout = null
		inputLayer.addEventListener(
			"keyup",
			function(event)
			{
				const wasEscapeKey = event.keyCode == 27
				if (wasEscapeKey) { // toggle search results visibility
					if (autocompleteResultsLayer.style.display != "none") {
						_removeAllAndHideAutocompleteResults()
					} else {
						_searchForAndDisplaySearchResults()
					}
					return // think it's ok to just return here and not mess with the typingDebounceTimeout
				}
				if (typingDebounceTimeout !== null) {
					clearTimeout(typingDebounceTimeout)
				}
				const this_inputLayer = this
				typingDebounceTimeout = setTimeout(function()
				{ // to prevent searching too fast
					typingDebounceTimeout = null // clear for next
					//
					if (didFinishTypingInInput_fn) {
						didFinishTypingInInput_fn()
					}
					_searchForAndDisplaySearchResults()
				}, 250)
			}
		)
	}
	const autocompleteResultsLayer = _new_autocompleteResultsLayer()
	{
		containerLayer.appendChild(autocompleteResultsLayer)
	}
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
			const contacts = contactsListController.contacts
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
			const layer = _new_autocompleteResultRowLayer(
				contact, 
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
	// observing contacts list controller for deletions 
	var _contactsListController_EventName_deletedContactWithId_fn = function(_id)
	{ // the currently picked contact was deleted, so unpick it
		if (__pickedContact && __pickedContact._id === _id) {
			_unpickExistingContact_andRedisplayPickInput(true)
		}
	}
	contactsListController.on(
		contactsListController.EventName_deletedContactWithId(),
		_contactsListController_EventName_deletedContactWithId_fn
	)
	containerLayer.Component_TearDown = function()
	{ // IMPORTANT: You must call this when you're done with this component
		console.log("♻️  Tearing down contacts picker.")
		contactsListController.removeListener(
			contactsListController.EventName_deletedContactWithId(),
			_contactsListController_EventName_deletedContactWithId_fn
		)
		_contactsListController_EventName_deletedContactWithId_fn = null
	}
	//
	return containerLayer
}
exports.New_contactPickerLayer = New_contactPickerLayer
//
function _new_inputLayer(placeholderText)
{
	const layer = document.createElement("input")
	{
		layer.type = "text"
		layer.placeholder = placeholderText
		// TODO: factor when building UI to-design
		layer.style.display = "block"
		layer.style.height = "30px"
		layer.style.width = `calc(100% - ${2 * 10}px)`
		layer.style.border = "1px inset #222"
		layer.style.borderRadius = "4px"
		layer.style.textAlign = "left"
		layer.style.fontSize = "13px"
		layer.style.color = "#ccc"
		layer.style.backgroundColor = "#444"
		layer.style.padding = "0 10px"
		layer.style.fontFamily = "monospace"
	}				
	return layer
}
function _new_autocompleteResultsLayer()
{
	const layer = document.createElement("div")
	{
		layer.style.position = "absolute"
		layer.style.top = "30px" // below txt field -- TODO:? pass value as arg/constant
		layer.style.width = "100%"
		layer.style.maxHeight = "155px"
		layer.style.minHeight = "30px"
		layer.style.backgroundColor = "white"
		layer.style.borderRadius = "3px"
		layer.style.boxShadow = "0px 3px 9px -1px rgba(0,0,0,0.75)"
		layer.style.overflowY = "scroll"
		//
		layer.style.display = "none" // for now - no results at init!
	}
	return layer
}
function _new_autocompleteResultRowLayer(contact, clicked_fn)
{
	const layer = document.createElement("div")
	{
		const padding_h = 10
		layer.style.color = "#111" // TODO
		layer.style.fontSize = "14px"
		layer.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif' // TODO
		layer.style.width = `calc(100% - ${2 * padding_h}px)`
		layer.style.lineHeight = "200%"
		layer.style.padding = `0 ${padding_h}px`
		layer.style.height = "32px"
		layer.style.webkitUserSelect = "none" // redundant but for explicitness
		layer.style.cursor = "pointer"
		layer.innerHTML = `${contact.emoji}&nbsp;&nbsp;&nbsp;&nbsp;${contact.fullname}`
	}
	{
		layer.addEventListener("mouseover", function() { this.highlight() })
		layer.addEventListener("mouseleave", function() { this.unhighlight() }) // will this be enough?
		layer.addEventListener("drag", function(e) { e.preventDefault(); e.stopPropagation(); return false; }) // prevent accidental drag from interfering with user's expectation of a successful click
		layer.addEventListener("mousedown", function(e)
		{ // not click, because of race conditions w/ the input focus and drags etc; plus it's snappier
			e.preventDefault()
			e.stopPropagation()
			clicked_fn(contact)
			return false
		})
	}
	{
		layer.highlight = function()
		{
			this.style.backgroundColor = "#dfdedf"
		}
		layer.unhighlight = function()
		{
			this.style.backgroundColor = "transparent"
		}
	}
	return layer
}
function _new_pickedContactLayer(contact, didClickCloseBtn_fn)
{
	const layer = document.createElement("div")
	const contentLayer = document.createElement("div")
	{ // ^-- using a content layer here so we can get width-of-content behavior with inline-block
		// while getting parent to give us display:block behavior
		contentLayer.innerHTML = `${contact.emoji}&nbsp;&nbsp;&nbsp;&nbsp;${contact.fullname}`
		contentLayer.style.padding = "5px 10px"
		contentLayer.style.border = "1px outset #999"
		contentLayer.style.borderRadius = "4px"
		contentLayer.style.display = "inline-block"
		contentLayer.style.cursor = "default"
	}
	layer.appendChild(contentLayer)
	const xButtonLayer = document.createElement("a")
	{
		xButtonLayer.innerHTML = "X" // TODO
		xButtonLayer.style.display = "inline-block" // to get margin
		xButtonLayer.style.marginLeft = "20px"
		xButtonLayer.style.cursor = "pointer"
		xButtonLayer.addEventListener("click", function(e)
		{
			e.preventDefault()
			const this_a = this
			const this_pickedContactLayer = this_a.parentNode.parentNode // two levels due to contentLayer
			didClickCloseBtn_fn(this_pickedContactLayer)
			return false
		})
		//
		contentLayer.appendChild(xButtonLayer)
	}
	return layer
}