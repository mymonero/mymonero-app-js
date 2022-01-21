'use strict'

const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const WalletsListView = require('./WalletsListView.web')

class WalletsTabContentView extends StackAndModalNavigationView {
  constructor (options, context) {
    super(options, context)
  }

  setup () {
    super.setup() // we must call on super
    const self = this
    { // walletsListView
      const options = {}
      const view = new WalletsListView(options, self.context)
      self.walletsListView = view
    }
    {
      self.SetStackViews(
        [
          self.walletsListView
        ]
      )
    }
  }

  //
  // Runtime - Accessors - Implementation of TabBarItem protocol
  // custom tab bar item styling
  TabBarItem_layer_customStyle () {
    return {}
  }

  TabBarItem_icon_customStyle () {
    return {
      backgroundImage: 'url(../../../assets/img/icon_tabBar_wallets@3x.png)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '24px 24px'
    }
  }

  TabBarItem_icon_selected_customStyle () {
    return {
      backgroundImage: 'url(../../../assets/img/icon_tabBar_wallets__active@3x.png)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '24px 24px'
    }
  }

  // interactivity
  TabBarItem_shallDisable () {
    const self = this
    const passwordController = self.context.passwordController
    if (passwordController.hasUserSavedAPassword !== true) {
      return false // no existing data - do not disable
    }
    if (passwordController.HasUserEnteredValidPasswordYet() !== true) { // has data but not unlocked app
      return true // because the app needs to be unlocked before they can use it
    }
    if (passwordController.IsUserChangingPassword() === true) {
      return true // changing pw - prevent jumping around
    }
    return false
  }
}

module.exports = WalletsTabContentView
