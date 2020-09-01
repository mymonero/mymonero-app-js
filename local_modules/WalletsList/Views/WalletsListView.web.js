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
const View = require('../../Views/View.web')
const ListView = require('../../Lists/Views/ListView.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_emptyScreens = require('../../MMAppUICommonComponents/emptyScreens.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
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
	overridable_recordDetailsViewClass(record)
	{
		return WalletDetailsView
	}
	_setup_views()
	{
		super._setup_views()
		//
		const self = this
		self._setup_emptyStateContainerView()
	}
	_setup_emptyStateContainerView()
	{
		const self = this
		const view = new View({}, self.context)
		self.emptyStateContainerView = view
		const layer = view.layer
		const margin_side = 16
		const marginTop = 60 - 41 // TODO: configure this with navigation bar height in VDA/VWA
		layer.style.marginTop = `${marginTop}px`
		layer.style.marginLeft = margin_side + "px"
		layer.style.width = `calc(100% - ${2 * margin_side}px)`
		layer.style.height = `calc(100% - ${marginTop}px)`
		{
			const emptyStateMessageContainerView = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
				"😃", 
				"Welcome to MyMonero!<br/>Let's get started.",
				self.context,
				0,
				0
			)
			self.emptyStateMessageContainerView = emptyStateMessageContainerView
			view.addSubview(emptyStateMessageContainerView)
		}
		{ // action buttons toolbar
			const margin_h = margin_side
			var actionButtonsContainerView;
			if (self.context.themeController.TabBarView_isHorizontalBar() === false) {
				const margin_fromWindowLeft = self.context.themeController.TabBarView_thickness() + margin_h // we need this for a position:fixed, width:100% container
				const margin_fromWindowRight = margin_h
				actionButtonsContainerView = commonComponents_actionButtons.New_ActionButtonsContainerView(
					margin_fromWindowLeft, 
					margin_fromWindowRight, 
					self.context
				)
			} else {
				actionButtonsContainerView = commonComponents_actionButtons.New_Stacked_ActionButtonsContainerView(
					0, 
					0, 
					15,
					self.context
				)
			}
			self.actionButtonsContainerView = actionButtonsContainerView
			{ // as these access self.actionButtonsContainerView
				self._setup_actionButton_useExistingWallet()
				self._setup_actionButton_createNewWallet()
			}
			view.addSubview(actionButtonsContainerView)
		}
		{ // essential: update empty state message container to accommodate
			const actionBar_style_height = commonComponents_actionButtons.ActionButtonsContainerView_h
			const actionBar_style_marginBottom = commonComponents_actionButtons.ActionButtonsContainerView_bottomMargin
			const actionBarFullHeightDisplacement = margin_side + actionBar_style_height + actionBar_style_marginBottom
			const style_height = `calc(100% - ${actionBarFullHeightDisplacement}px)`
			self.emptyStateMessageContainerView.layer.style.height = style_height
		}
		view.SetVisible = function(isVisible)
		{
			view.isVisible = isVisible
			if (isVisible) {
				if (layer.style.display !== "block") {
					layer.style.display = "block"
				}
			} else {
				if (layer.style.display !== "none") {
					layer.style.display = "none"
				}
			}
		}
		view.SetVisible(false)
		self.addSubview(view)
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
			self.context,
			undefined,
			"blue"
		)
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
	}
	tearDownAnySpawnedReferencedPresentedViews()
	{ // overridden - called for us
		const self = this
		super.tearDownAnySpawnedReferencedPresentedViews()
		self._teardown__current_wizardController()
	}
	_teardown__current_wizardController()
	{
		const self = this
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
		const self = this
		if (self.context.isLiteApp == true) { // should come before check for 0 wallets
			const logo_w = 30
			const logo_h = 20
			var backgroundCSS = "background-image: url(\""
				+ self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath
				+ "MainWindow/Resources/www_logo@3x.png\");"
			backgroundCSS += `background-size: ${logo_w}px ${logo_h}px;`
			backgroundCSS += `background-position: 0 10px;`
			backgroundCSS += `background-repeat: no-repeat;`
			return `<a href="https://mymonero.com" target="_blank" style="text-decoration: none; color: rgb(252, 251, 252); "><span style='width: ${logo_w}px; height: ${logo_h}px; display: inline-block; margin-right: 6px;'><span style='width: 30px; height: 30px; display: inline-block; ${backgroundCSS}'>&nbsp;</span></span>MyMonero</a>`
		}
		if (!self.listController.records || !self.listController.records.length) { // ok to access this w/o checking boot cause should be [] pre boot and view invisible to user preboot
			return "MyMonero"
		}
		return "Wallets"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		if (self.context.isLiteApp == true) {
			return null
		}
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
	// Runtime - Imperatives - Wizard 
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
	// Runtime - Delegation - UI building
	//
	overridable_willBuildUIWithRecords(records)
	{
		super.overridable_willBuildUIWithRecords(records)
		//
		const self = this
		// so we update to return no right bar btn when there are no wallets as we show empty state action bar
		self.navigationController.SetNavigationBarButtonsNeedsUpdate() // no animation
		self.navigationController.SetNavigationBarTitleNeedsUpdate() // because it's derived from whether there are wallets
		const isEmptyVisible = records.length === 0 // This has been removed despite commit 490b69f6 bc it causes the empty/landing screen to be invisible when no records are present throughout the entire app (nothing to trigger PW entry) … I'm unable to reproduce what that commit was really fixing (showing the empty screen under pw entry on lock-down) : && (self.context.passwordController.hasUserSavedAPassword == false || self.context.passwordController.HasUserEnteredValidPasswordYet())
		// NOTE: a possible better way to fix this, albeit one which would require placing a cb function on this overridable_willBuildUIWithRecords to retain serial execution, would be to actually fetch the number of saved records, rather than checking records.length – since `records` is the number of loaded/decrypted records
		// ^-- passwordController state checked to avoid improperly showing empty screen when no records loaded but pw not yet entered
		{
			self.emptyStateContainerView.SetVisible(isEmptyVisible)
		}
		{ // style cellsContainerView
			const view = self.cellsContainerView
			const layer = view.layer
			if (isEmptyVisible == true) {
				layer.style.display = "none"
			} else {
				layer.style.margin = "16px 0 0 0"
			}
		}
	}
	//
	// Delegation - View - Visibility
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		if (self.listController.records) { // it's ok to access this w/o checking boot cause should be [] pre boot and view invisible to user preboot
			self.listController.records.forEach(function(el, idx)
			{
				el.requestFromUI_manualRefresh()
			})
		}
	}
}
module.exports = WalletsListView
