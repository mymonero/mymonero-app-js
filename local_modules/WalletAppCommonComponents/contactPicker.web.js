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
	didClearPickedContact_fn
)
{
	if (!contactsListController) {
		throw "New_contactPickerLayer requires a contactsListController"
	}
	const containerLayer = document.createElement("div")
	{
		containerLayer.style.position = "relative"
		containerLayer.style.width = "100%"
		containerLayer.style.height = "30px"
	}
	const inputLayer = _new_inputLayer(placeholderText)
	{
		containerLayer.appendChild(inputLayer)
		//
		const isFocused = false
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
					if (isFocused === false) {
						_removeAllAndHideAutocompleteResults()
					}
				}, 50)
			}
		)
		inputLayer.addEventListener(
			"focus",
			function(event)
			{
				isFocused = true
				//
				const this_inputLayer = this
				const value = this_inputLayer.value
				if (!value || value.length === 0) {
					return
				}
				_searchForAndDisplaySearchResults()
			}
		)
		var typingDebounceTimeout = null
		inputLayer.addEventListener(
			"keyup",
			function(event)
			{
				if (typingDebounceTimeout !== null) {
					clearTimeout(typingDebounceTimeout)
				}
				const this_inputLayer = this
				typingDebounceTimeout = setTimeout(function()
				{ // to prevent searching too fast
					typingDebounceTimeout = null // clear for next
					//
					const value = this_inputLayer.value
					if (!value || value.length === 0) {
						_removeAllAndHideAutocompleteResults()
						return
					}
					_searchForAndDisplaySearchResults()
				}, 170)
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
		var results = []
		{
			const searchString = inputLayer.value
			const search_regex = new RegExp(searchString, "i") // case insensitive
			const contacts = contactsListController.contacts
			const numberOf_contacts = contacts.length // we're assuming we've booted by the time they're using the RequestFunds form
			for (var i = 0 ; i < numberOf_contacts ; i++) {
				const contact = contacts[i]
				const isMatch = contact.fullname.search(search_regex) !== -1 // positional rather than boolean
				if (isMatch === true) {
					results.push(contact)
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
					_selectContact(clicked_contact)
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
	function _selectContact(contact)
	{
		_removeAllAndHideAutocompleteResults()
		_clearAndHideInputLayer()
		_displaySelectedContact(contact)
		//
		didPickContact_fn(contact)
	}
	function _displaySelectedContact(contact)
	{
		const selectedContactLayer = _new_selectedContactLayer(
			contact,
			function(this_selectedContactLayer)
			{
				containerLayer.removeChild(this_selectedContactLayer)
				_redisplayInputLayer()
				didClearPickedContact_fn()
			}
		)
		containerLayer.appendChild(selectedContactLayer)
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
 		layer.style.float = "left"
		layer.style.textAlign = "left"
		layer.style.fontSize = "14px"
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
		layer.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif' // TODO
		layer.style.width = `calc(100% - ${2 * padding_h}px)`
		layer.style.lineHeight = "200%"
		layer.style.padding = `0 ${padding_h}px`
		layer.style.height = "32px"
		layer.innerHTML = `${contact.emoji}&nbsp;&nbsp;&nbsp;&nbsp;${contact.fullname}`
	}
	{
		layer.addEventListener("mouseover", function() { this.highlight() })
		layer.addEventListener("mouseleave", function() { this.unhighlight() }) // will this be enough?
		layer.addEventListener("click", function(e)
		{
			e.preventDefault()
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
function _new_selectedContactLayer(contact, didClickCloseBtn_fn)
{
	const layer = document.createElement("div")
	{
		layer.innerHTML = `${contact.emoji}&nbsp;&nbsp;&nbsp;&nbsp;${contact.fullname}`
		layer.style.padding = "5px 10px"
	}
	const xButtonLayer = document.createElement("a")
	{
		xButtonLayer.innerHTML = "X" // TODO
		xButtonLayer.style.display = "inline-block" // to get margin
		xButtonLayer.style.marginLeft = "20px"
		xButtonLayer.addEventListener("click", function(e)
		{
			e.preventDefault()
			const this_a = this
			const this_selectedContactLayer = this_a.parentNode
			didClickCloseBtn_fn(this_selectedContactLayer)
			return false
		})
		//
		layer.appendChild(xButtonLayer)
	}
	return layer
}