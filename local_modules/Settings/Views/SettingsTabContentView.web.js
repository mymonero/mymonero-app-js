'use strict'

const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')

class SettingsTabContentView extends StackAndModalNavigationView {
  constructor (options, context) {
    super(options, context)
  }

  setup () {
    super.setup() // we must call on super
    const self = this
    {
      const SettingsView = require('./SettingsView.web')
      const view = new SettingsView({}, self.context)
      self.settingsView = view
    }
    {
      self.SetStackViews(
        [
          self.settingsView
        ]
      )
    }
  }

  //
  //
  // Runtime - Accessors - Implementation of TabBarItem protocol
  // custom tab bar item styling
  TabBarItem_layer_customStyle (isHorizontalBar) {
    const self = this
    if (isHorizontalBar) {
      return undefined
    } else {
      return {
        position: 'absolute', // we can get away with doing this because the tab bar won't move
        left: '0',
        bottom: '5px' // for desktop, anyway
      }
    }
  }

  TabBarItem_icon_customStyle () {
    const self = this
    return {
      backgroundImage: 'url(../../../assets/img/icon_tabBar_settings@3x.png)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '16px 16px'
    }
  }

  TabBarItem_icon_selected_customStyle () {
    const self = this
    return {
      backgroundImage: 'url(../../../assets/img/icon_tabBar_settings__active@3x.png)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '16px 16px'
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
module.exports = SettingsTabContentView
