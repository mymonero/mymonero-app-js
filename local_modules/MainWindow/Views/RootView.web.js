'use strict'

const View = require('../../Views/View.web')
const commonComponents_assetPreloader = require('../../MMAppUICommonComponents/assetPreloader')
const ConnectivityMessageBarView = require('./ConnectivityMessageBarView.web')
const PasswordEntryViewController = require('../../Passwords/Controllers/PasswordEntryViewController.web')

class RootView extends View {
  constructor (options, context) {
    super(options, context)
    //
    const self = this
    self.setup()
  }

  setup () {
    const self = this
    // figure this is a better place to do this than index.js and themeController
    commonComponents_assetPreloader.PreLoadImages(self.context)
    self.setup_views()
  }

  setup_views () {
    const self = this
    //
    const layer = self.layer
    layer.style.background = '#272527'
    layer.style.position = 'absolute'
    layer.style.width = '100%'
    layer.style.height = '100%'
    layer.style.left = '0px'
    layer.style.top = '0px'
    layer.style.overflow = 'hidden' // prevent scroll bar
    //
    self.setup_tabBarAndContentView()
    self.setup_passwordEntryViewController() // this is technically a controller, not a view
    self.setup_connectivityMessageBarView()
    // disable space bar to scroll in document
    window.onkeydown = function (e) {
      if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault()
      }
    }
  }

  setup_tabBarAndContentView () {
    const self = this
    const platformSpecific_RootTabBarAndContentView = self.context.platformSpecific_RootTabBarAndContentView // slightly messy way of doing this, but it works
    if (!platformSpecific_RootTabBarAndContentView) {
      throw Error(`${self.constructor.name} requires a self.context.platformSpecific_RootTabBarAndContentView`)
    }
    const tabBarViewAndContentView = new platformSpecific_RootTabBarAndContentView({}, self.context)
    self.tabBarViewAndContentView = tabBarViewAndContentView
    self.addSubview(tabBarViewAndContentView)
  }

  setup_passwordEntryViewController () {
    const self = this
    const passwordController = self.context.passwordController

    const passwordEntryViewController = new PasswordEntryViewController(self.tabBarViewAndContentView, passwordController)
    self.passwordEntryViewController = passwordEntryViewController
    {
      passwordEntryViewController.on(
        passwordEntryViewController.EventName_willDismissView(),
        function () {
          self.tabBarViewAndContentView.SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders()
        }
      )
      passwordEntryViewController.on(
        passwordEntryViewController.EventName_willPresentInView(),
        function () {
          self.tabBarViewAndContentView.DisableTabBarItemButtons()
        }
      )
    }
  }

  setup_connectivityMessageBarView () {
    const self = this
    const view = new ConnectivityMessageBarView({}, self.context)
    self.connectivityMessageBarView = view
    self.addSubview(view)
  }
}

module.exports = RootView
