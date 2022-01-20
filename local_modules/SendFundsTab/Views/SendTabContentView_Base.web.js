"use strict"

const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')

class SendTabContentView_Base extends StackAndModalNavigationView
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{
		super.setup() // we must call on super
		const self = this
		{ // walletsListView
			const options = {}
			const SendFundsView = self._required_rootViewClassModule()
			const view = new SendFundsView(options, self.context)
			self.sendFundsView = view
		}
		{
			self.SetStackViews(
				[
					self.sendFundsView
				]
			)
		}
	}
	_required_rootViewClassModule()
	{
		throw "You must override and implement SendTabContentView_Base/_required_rootViewClassModule"
	}
	//
	//
	// Runtime - Accessors - Implementation of TabBarItem protocol - custom tab bar item styling
	//
	TabBarItem_layer_customStyle()
	{
		return {}
	}
	TabBarItem_icon_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url(../../../assets/img/icon_tabBar_sendFunds@3x.png)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "24px 25px"
		}
	}
	TabBarItem_icon_selected_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url(../../../assets/img/icon_tabBar_sendFunds__active@3x.png)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "24px 25px"
		}
	}
	// interactivity
	TabBarItem_shallDisable()
	{
		const self = this
		const passwordController = self.context.passwordController
		if (passwordController.hasUserSavedAPassword !== true) {
			return true // no existing data - do disable
		}
		if (passwordController.HasUserEnteredValidPasswordYet() !== true) { // has data but not unlocked app
			return true // because the app needs to be unlocked before they can use it
		}
		if (passwordController.IsUserChangingPassword() === true) {
			return true // changing pw - prevent jumping around
		}
		const wallets = self.context.walletsListController.records // figure it's ready by this point
		const numberOf_wallets = wallets.length
		const walletsExist = numberOf_wallets !== 0
		const shallDisable = walletsExist == false // no wallets? disable
		//
		return shallDisable
	}
	//
	//
	// Runtime - Delegation - Request URI string picking - Entrypoints - Proxied drag & drop
	//
	_proxied_ondragenter(e)
	{
		const self = this
		if (self.modalViews.length > 0) {
			// prevent this?
		}
		self.DismissModalViewsToView( // whether we should force-dismiss these is debatable… see check for nonzero modals just above
			null, // null -> to top stack view
			false // not animated
		)
		self.PopToRootView(false) // in case they're not on root
		//
		self.sendFundsView._proxied_ondragenter(e)
	}
	_proxied_ondragleave(e)
	{
		const self = this
		self.sendFundsView._proxied_ondragleave(e)
	}
	_proxied_ondrop(e)
	{
		const self = this
		self.sendFundsView._proxied_ondrop(e)
	}
}
module.exports = SendTabContentView_Base