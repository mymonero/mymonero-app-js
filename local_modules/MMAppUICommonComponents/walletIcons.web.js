"use strict"

const SizeClasses =
{
	Large48: "large-48",
	Large43: "large-43",
	Medium32: "medium-32",
}
exports.SizeClasses = SizeClasses
//
function New_WalletIconLayer(context, optl_sizeClass)
{
	var sizeClass = optl_sizeClass || SizeClasses.Large48
	const div = document.createElement("div")
	div.classList.add("walletIcon")
	div.classList.add(sizeClass)

	div.ConfigureWithHexColorString = function(to_hexColorString)
	{
		const to_hexColorString_sansPound = to_hexColorString.substring(1, to_hexColorString.length)
		div.style.backgroundImage = `url(../../../assets/img/wallet-${to_hexColorString_sansPound}@3x.png)`
	}

	return div
}
exports.New_WalletIconLayer = New_WalletIconLayer