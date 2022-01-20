"use strict"

let Currencies = require('../CcyConversionRates/Currencies')

const new_selectLayer = exports.new_selectLayer = function()
{
	let selectLayer = document.createElement("select")
	let allCcySymbols = Currencies.allOrderedCurrencySymbols
	let numberOf_allCcySymbols = allCcySymbols.length
	for (var i = 0 ; i < numberOf_allCcySymbols ; i++) {
		let ccySymbol = allCcySymbols[i]
		const optionLayer = document.createElement("option")
		optionLayer.style.textAlign = "center"
		optionLayer.value = ccySymbol
		optionLayer.innerText = ccySymbol
		selectLayer.appendChild(optionLayer)
	}
	selectLayer.Component_selected_ccySymbol = function()
	{ // v---- TODO: does this cause a retain cycle?
		return selectLayer.options[selectLayer.selectedIndex].value
	}
	//
	return selectLayer
}