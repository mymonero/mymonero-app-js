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
const Views__cssRules = require('../../Views/cssRules.web')
const ListCustomSelectView = require('../../Lists/Views/ListCustomSelectView.web')
const WalletCellContentsView = require('../../Wallets/Views/WalletCellContentsView.web')
const commonComponents_walletIcons = require('../../MMAppUICommonComponents/walletIcons.web')
//
const NamespaceName = "WalletSelectView"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.${NamespaceName} {
		display: block; /* own line */
		outline: none; /* no focus ring */

		height: 66px;
		width: 100%;
		padding: 0;
		box-sizing: border-box;

		appearance: none;
		background: #383638;
		border-width: 0;
		box-shadow: 0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749;
		border-radius: 5px;

		text-align: left;
		font-size: 14px;
		color: #FCFBFC;
	}`,
	`.${NamespaceName} .selectionDisplayCellView,
	 .${NamespaceName} .options_containerView {
		border-radius: 5px;
		overflow: hidden;
	}`,
	`.${NamespaceName} > .options_containerView {
		border-radius: 5px;
		box-shadow: 0 15px 12px 0 rgba(0,0,0,0.22), 0 19px 38px 0 rgba(0,0,0,0.30);
	}`,
	`.${NamespaceName} > .options_containerView > .background {
		background: #383638;
		border-radius: 5px;
		box-shadow: 0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749;
	}`,
	`.${NamespaceName} > .options_containerView .optionCell.active {
		background-color: rgba(73, 71, 73, 0.95) !important;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function _fromContext_wantsHoverAndSelectable(context)
{
	if (context.isLiteApp == true) {
		return false // special case - b/c we'll only ever have max 1 wallet
	}
	return true
}
//
class WalletsSelectView extends ListCustomSelectView
{
	// Lifecycle - Setup
	constructor(options, context)
	{
		options = options || {}
		options.cellView_height_fn = function(selectView, cellView)
		{ // must implement this (currently) so the CustomSelectView can avoid asking cells for their offsetHeight
			return 66
		} 
		options.listController = context.walletsListController // must pass
		options.cellContentsViewClass = WalletCellContentsView // must pass
		options.cellContentsView_init_baseOptions = // optl but set here for things like icon_sizeClass
		{
			icon_sizeClass: commonComponents_walletIcons.SizeClasses.Medium32,
			wantsHoverable: _fromContext_wantsHoverAndSelectable(context),
			wantsNoSecondaryBalances: true,
			wantsOnlySpendableBalance: true // this could be changed to false for e.g. the creatfundsrequestform
		}
		super(options, context)
	}
	overridable_wantsSelectionDisplayCellView_clickable()
	{
		return _fromContext_wantsHoverAndSelectable(this.context);
	}
	setup_views()
	{
		__injectCSSRules_ifNecessary() // may as well do this here
		//
		const self = this
		{
			const layer = self.layer
			layer.classList.add(NamespaceName) // must add class for css rules
		}
		super.setup_views()
		{
			const layer = self.selectionDisplayCellView.layer
			layer.style.backgroundColor = "none"
			if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
			} else { // avoiding shadow
				layer.style.boxShadow = "inset 0 0.5px 0 0 #494749"
			}
		}
		{
			const layer = document.createElement("div")
			layer.style.position = "absolute"
			layer.style.left = "0"
			layer.style.top = "0"
			layer.style.width = "100%"
			layer.style.height = "100%"
			layer.style.zIndex = "10" // below cells
			layer.className = "background"
			self.options_containerView.layer.appendChild(layer)
		}
		if (self.context.isLiteApp == true) {
			self.disclosureArrowLayer.style.display = "none"
		}
	}
	// Overrides
	overridable_maxNumberOfCellsToDisplayAtATime() { return 2.65 }
	overridable_setup_cellView(cellView, rowItem)
	{
		const self = this
		super.overridable_setup_cellView(cellView, rowItem)
		cellView.layer.backgroundColor = "none" // so we can see the decoration around self.options_containerView/.bg
		
	} 
}
module.exports = WalletsSelectView