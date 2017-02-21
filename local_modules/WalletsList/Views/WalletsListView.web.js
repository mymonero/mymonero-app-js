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
const View = require('../../Views/View.web')
const WalletsListCellView = require('./WalletsListCellView.web')
const WalletDetailsView = require('../../Wallets/Views/WalletDetailsView.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
const commonComponents_actionButtons = require('../../WalletAppCommonComponents/actionButtons.web')
const commonComponents_emptyScreens = require('../../WalletAppCommonComponents/emptyScreens.web')
//
const AddWallet_WizardController = require('../../WalletWizard/Controllers/AddWallet_WizardController.web')
//
class WalletsListView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
		{ // initialization / zeroing / declarations 
			self.wallets = []
			self.current_walletDetailsView = null
			self.current_wizardController = null
		}
		self._setup_views()
		self._setup_startObserving()
		//
		// configure UI with initial state
		self.reloadData()
	}
	_setup_views()
	{
		const self = this
		{
			self.walletCellViews = [] // initialize container
		}
		self._setup_self_layer()
		self._setup_emptyStateContainerView()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.webkitUserSelect = "none"
		//
		layer.style.position = "relative"
		layer.style.width = "100%"
		// we're actually going to wait til viewWillAppear is called by the nav controller to set height
		//
		layer.style.backgroundColor = "#272527"
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.overflowY = "scroll"
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	_setup_emptyStateContainerView()
	{
		const self = this
		const view = new View({}, self.context)
		self.emptyStateContainerView = view
		const layer = view.layer
		const margin_side = 15
		const marginTop = 60 - 44
		layer.style.marginTop = `${marginTop}px`
		layer.style.marginLeft = margin_side + "px"
		layer.style.width = `calc(100% - ${2 * margin_side}px)`
		layer.style.height = `calc(100% - ${marginTop}px)`
		{
			const emptyStateMessageContainerView = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
				"😃", 
				"Welcome to MyMonero!<br/>Let's get started.",
				self.context,
				0
			)
			self.emptyStateMessageContainerView = emptyStateMessageContainerView
			view.addSubview(emptyStateMessageContainerView)
		}
		{ // action buttons toolbar
			const margin_h = margin_side
			const margin_fromWindowLeft = self.context.themeController.TabBarView_thickness() + margin_h // we need this for a position:fixed, width:100% container
			const margin_fromWindowRight = margin_h
			const actionButtonsContainerView = commonComponents_actionButtons.New_ActionButtonsContainerView(
				margin_fromWindowLeft, 
				margin_fromWindowRight, 
				self.context)
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
	_setup_startObserving()
	{
		const self = this
		const walletsListController = self.context.walletsListController
		walletsListController.on(
			walletsListController.EventName_listUpdated(),
			function()
			{
				self._WalletsListController_EventName_listUpdated()
			}
		)
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
		if (self.current_walletDetailsView !== null) {
			self.current_walletDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_walletDetailsView = null // must zero again and should free
		}
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
		if (self.wallets.length === 0) {
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
	// Runtime - Imperatives - View Configuration
	//
	reloadData(optl_isFrom_EventName_listUpdated)
	{
		const self = this
		if (optl_isFrom_EventName_listUpdated === true) { // because if we're told we can update we can do it immediately w/o re-requesting Boot
			// and… we have to, because sometimes listUpdated is going to be called after we deconstruct the booted walletsList, i.e., on 
			// user idle. meaning… this solves the user idle bug where the list doesn't get emptied behind the scenes (security vuln)
			self._configureWith_wallets(self.context.walletsListController.records) // since it will be immediately available
			return
		}
		if (self.isAlreadyWaitingForWallets === true) { // because accessing wallets is async
			console.warn("⚠️  Asked to WalletsListCellView/reloadData while already waiting for wallets.")
			return // prevent redundant calls
		}
		self.isAlreadyWaitingForWallets = true // lock
		self.context.walletsListController.WhenBooted_Records(
			function(records)
			{
				self.isAlreadyWaitingForWallets = false // unlock
				self._configureWith_wallets(records)
			}
		)
	}
	_configureWith_wallets(wallets)
	{
		const self = this
		{ // update model data
			self.wallets = wallets
		}
		const context = self.context
		{ // teardown/revert
			// TODO: diff these wallets with existing wallets?
			if (self.walletCellViews.length != 0) {
				// for now, just flash list:
				self.walletCellViews.forEach(
					function(view, i)
					{
						view.removeFromSuperview() // before we call TearDown so layer is not nil too early
						view.TearDown() // important so the event listeners get deregistered
					}
				)
				self.walletCellViews = []
			}
		}
		{ // so we update to return no right bar btn when there are no wallets as we show empty state action bar
			self.navigationController.SetNavigationBarButtonsNeedsUpdate(false) // explicit: no animation
			self.emptyStateContainerView.SetVisible(self.wallets.length === 0 ? true : false)
		}
		{ // add subviews
			self.wallets.forEach(
				function(wallet, i)
				{
					const options = 
					{
						cell_tapped_fn: function(cellView)
						{
							self.pushWalletDetailsView(cellView.wallet)
						}
					}
					const view = new WalletsListCellView(options, context)
					self.walletCellViews.push(view)
					view.ConfigureWith_wallet(wallet)
					self.addSubview(view)
				}
			)
		}
	}
	//
	//
	// Runtime - Internal - Imperatives - Navigation/presentation
	//
	pushWalletDetailsView(wallet)
	{
		const self = this
		if (self.current_walletDetailsView !== null) {
			// Commenting this throw as we are going to use this as the official way to lock this function,
			// e.g. if the user is double-clicking on a cell to push a details view
			// throw "Asked to pushWalletDetailsView while self.current_walletDetailsView !== null"
			return
		}
		{ // check wallet
			if (typeof wallet === 'undefined' || wallet === null) {
				throw "WalletsListView requires self.wallet to pushWalletDetailsView"
				return
			}
			if (wallet.didFailToInitialize_flag === true || wallet.didFailToBoot_flag === true) { // unlikely, but possible
				console.log("Not pushing as wallet failed to init or boot.")
				return // just don't push - no need to error 
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw "WalletsListView requires navigationController to pushWalletDetailsView"
			return
		}
		{
			const options = 
			{
				wallet: wallet
			}
			const view = new WalletDetailsView(options, self.context)
			navigationController.PushView(
				view, 
				true // animated
			)
			// Now… since this is JS, we have to manage the view lifecycle (specifically, teardown) so
			// we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
			// by tearing it down on self.viewDidAppear() below and on TearDown() (although since this is a root stackView
			// the latter ought not to happen)
			self.current_walletDetailsView = view
		}
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
	// Runtime - Delegation - Data source
	//
	_WalletsListController_EventName_listUpdated()
	{
		const self = this
		self.reloadData(
			true // isFrom_EventName_listUpdated
		)
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		//
		if (self.current_walletDetailsView !== null) {
			self.current_walletDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_walletDetailsView = null // must zero again and should free
		}
		if (self.current_wizardController !== null) {
			self.current_wizardController.TearDown()
			self.current_wizardController = null
		}
	}
}
module.exports = WalletsListView
