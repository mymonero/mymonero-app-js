"use strict"

const commonComponents_walletIcons = require('./walletIcons.web')

function New_1OfN_WalletColorPickerInputView(context, selectHexColorString_orUndefForDefault)
{
	const walletsListController = context.walletsListController
	const hexColorStrings = walletsListController.All_SwatchHexColorStrings()
	const numberOf_hexColorStrings = hexColorStrings.length
	var selectHexColorString = null
	{
		if (typeof selectHexColorString_orUndefForDefault !== 'undefined') {
			selectHexColorString = selectHexColorString_orUndefForDefault
		} else {
			const alreadyInUseHexStrings = walletsListController.GivenBooted_SwatchesInUse()
			var aFree_hexColorString = null;
			for (let i = 0 ; i < numberOf_hexColorStrings ; i++) {
				const this_hexColorString = hexColorStrings[i]
				if (alreadyInUseHexStrings.indexOf(this_hexColorString) === -1) {
					aFree_hexColorString = this_hexColorString
					break
				}				
			}
			if (aFree_hexColorString !== null) {
				selectHexColorString = aFree_hexColorString
			} else {
				selectHexColorString = hexColorStrings[0] // just use the first one - all are already in use
			}
		}
	}
	//
	const View = require('../Views/View.web')
	const view = new View({ tag: "ul" }, context)
	const fieldName = view.View_UUID()
	const ul = view.layer
	ul.className = "oneOfN-walletColorPicker"
	ul.style.listStyleType = "none"
	const inputs = []
	const lis = []
	for (let i = 0 ; i < numberOf_hexColorStrings ; i++) {
		const hexColorString = hexColorStrings[i]
		const li = document.createElement("li")
		li.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 .5px 0 0 #494749"
		lis.push(li)
		{
			li.classList.add('hoverable-cell')
			li.classList.add('utility')
		}
		{
			const div = commonComponents_walletIcons.New_WalletIconLayer(context)
			div.ConfigureWithHexColorString(hexColorString)
			li.appendChild(div)
		}
		const input_id = fieldName + "__" + i
		let radioInput = null // and not 'var' cause this is a for loop.
		const label = document.createElement("label")
		label.htmlFor = input_id
		label.addEventListener(
			"click", 
			function()
			{
				if (radioInput.disabled !== true) {
					radioInput.focus()
					radioInput.checked = "checked"
				}
			}
		)
		li.appendChild(label)
		{
			const input = document.createElement("input")
			inputs.push(input)
			radioInput = input // for reference above
			input.type = "radio"
			input.name = fieldName
			input.id = input_id
			input.value = hexColorString
			if (hexColorString === selectHexColorString) {
				input.checked = "checked"
			}
			//
			label.appendChild(input) // append to label to get clickable
		}
		{ // selection indicator layer - must be /after/ input for sibling CSS to work
			const div = document.createElement("div")
			div.className = "selectionIndicator"
			label.appendChild(div) // append to label to make sibling of radio input f orCSS
		}
		ul.appendChild(li)
	}
	view.Component_Value = function()
	{
		var inputs = document.getElementsByName(fieldName) // fieldName is unique
		const numberOf_inputs = inputs.length // should be same as numberOf_hexColorStrings
		for (var i = 0; i < numberOf_inputs ; i++) {
			const input = inputs[i]
			if (input.checked) {
				return input.value
			}
		}
		throw "Didn't find a selected wallet swatch color."
		// return undefined
	}
	view.SetEnabled = function(isEnabled)
	{
		const numberOf_lis = lis.length // should be same as numberOf_hexColorStrings
		// going to assume the lis and inputs correspond 1:1
		for (var i = 0; i < numberOf_lis ; i++) {
			const li = lis[i]
			const input = inputs[i]
			if (isEnabled) {
				li.classList.remove("disabled")
				input.disabled = undefined
			} else {
				li.classList.add("disabled")
				input.disabled = true
			}
		}
	}
	return view
}
exports.New_1OfN_WalletColorPickerInputView = New_1OfN_WalletColorPickerInputView

