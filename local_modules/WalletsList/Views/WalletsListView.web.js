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
const ListView = require('../../Lists/Views/ListView.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
const commonComponents_actionButtons = require('../../WalletAppCommonComponents/actionButtons.web')
//
const WalletsListCellView = require('./WalletsListCellView.web')
const WalletDetailsView = require('../../Wallets/Views/WalletDetailsView.web')
//
const AddWallet_WizardController = require('../../WalletWizard/Controllers/AddWallet_WizardController.web')
//
class WalletsListView extends ListView
{
	constructor(options, context)
	{
		options.listController = context.walletsListController
		// ^- injecting dep so consumer of self doesn't have to
		super(options, context)
	}
	setup()
	{
		const self = this
		{ // initialization / zeroing / declarations 
			self.current_wizardController = null
		}
		super.setup()
	}
	overridable_listCellViewClass()
	{ // override and return youir 
		return WalletsListCellView
	}
	overridable_pushesDetailsViewOnCellTap()
	{
		return true
	}
	overridable_recordDetailsViewClass()
	{
		return WalletDetailsView
	}
	overridable_initial_emptyStateView_emoji()
	{
		return "😃"
	}
	overridable_initial_emptyStateView_message()
	{
		return "Welcome to MyMonero!<br/>Let's get started."
	}
	overridable_setupActionButtons()
	{
		const self = this
		self._setup_actionButton_useExistingWallet()
		self._setup_actionButton_createNewWallet()
	}	
	_setup_actionButton_useExistingWallet()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Use existing wallet", 
			null, // no image
			false,
			function(layer, e)
			{
				self._presentAddWalletWizardIn(function(wizardController)
				{
					return wizardController.WizardTask_Mode_FirstTime_UseExisting()
				})
			},
			self.context
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_actionButton_createNewWallet()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Create new wallet", 
			null, // no image
			true,
			function(layer, e)
			{
				self._presentAddWalletWizardIn(function(wizardController)
				{
					return wizardController.WizardTask_Mode_FirstTime_CreateWallet()
				})
			},
			self.context
		)
		{
			const layer = buttonView.layer
			layer.style.color = "#150000"
			layer.style.backgroundColor = "#00c6ff"
			layer.style.boxShadow = "inset 0 0.5px 0 0 rgba(255,255,255,0.20)"
		}
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
		//
		if (self.current_wizardController !== null) {
			self.current_wizardController.TearDown()
			self.current_wizardController = null
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Wallets"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		if (self.listController.records.length === 0) { // ok to access this w/o checking boot cause should be [] pre boot and view invisible to user preboot
			return null
		}
		const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					self._presentAddWalletWizardIn(function(wizardController)
					{
						return wizardController.WizardTask_Mode_PickCreateOrUseExisting()
					})
					return false
				}
			)
		}
		return view
	}
	//
	//
	// Runtime - Imperatives - 
	//
	_presentAddWalletWizardIn(returnTaskModeWithController_fn)
	{
		const self = this
		const controller = new AddWallet_WizardController({}, self.context)
		self.current_wizardController = controller
		const taskMode = returnTaskModeWithController_fn(controller)
		const navigationView = controller.EnterWizardTaskMode_returningNavigationView(taskMode)
		self.navigationController.PresentView(navigationView)
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		//
		if (self.current_wizardController !== null) {
			self.current_wizardController.TearDown()
			self.current_wizardController = null
		}
	}
}
module.exports = WalletsListView
