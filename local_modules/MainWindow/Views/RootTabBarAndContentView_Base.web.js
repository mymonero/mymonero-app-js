'use strict'

const TabBarAndContentView = require('../../TabBarView/TabBarAndContentView.web')
const WalletsTabContentView = require('../../WalletsList/Views/WalletsTabContentView.web')
const SendTabContentView = require('../../SendFundsTab/Views/SendTabContentView.Full.web')
const RequestTabContentView = require('../../RequestFunds/Views/RequestTabContentView.web')
const ContactsTabContentView = require('../../Contacts/Views/ContactsTabContentView.web')
const ExchangeTabContentView = require('../../Exchange/Views/ExchangeTabContentView.web')
const SettingsTabContentView = require('../../Settings/Views/SettingsTabContentView.web')

class RootTabBarAndContentView extends TabBarAndContentView {
  setup () { // ^ called automatically by super, so
    const self = this
    super.setup() // must call this
    self._setup_views()
    self._setup_startObserving()
  }

  _setup_views () {
    const self = this
    const context = self.context
    {
      const layer = self.tabBarView.layer
      layer.style.background = '#171416'
    }
    {
      const layer = self.contentAreaView.layer
      layer.style.background = '#272527'
    }
    if (self.overridable_isHorizontalBar() === false) {
      // To support left-side layout:
      {
        const layer = self.tabBarView.layer
        layer.style.position = 'absolute'
        layer.style.borderRight = '1px solid black'
        layer.style.top = '0px'
        layer.style.left = '0px'
        layer.style.width = '79px'
        layer.style.paddingTop = '56px'
        layer.style.height = 'calc(100% - 56px)'
      }
      {
        const layer = self.contentAreaView.layer
        layer.style.position = 'absolute'
        layer.style.top = '0px'
        layer.style.left = '79px'
        layer.style.width = 'calc(100% - 79px)'
        layer.style.height = '100%'
      }
    }
    { // add tab bar content Views
      self._setup_addTabBarContentViews()
    }

    function __passwordController_didBoot () {
      self.SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders()
    }

    const passwordController = self.context.passwordController
    if (passwordController.hasBooted == true) {
      __passwordController_didBoot()
    } else {
      self.DisableTabBarItemButtons(true) // true: force-disable all while booting
      passwordController._executeWhenBooted(__passwordController_didBoot)
    }
  }

  _setup_addTabBarContentViews () {
    const self = this
    const context = self.context

    const contentViewsArr = [
      self.walletsTabContentView = new WalletsTabContentView({}, context),
      self.sendTabContentView = new SendTabContentView({}, context),
      self.requestTabContentView = new RequestTabContentView({}, context),
      self.contactsTabContentView = new ContactsTabContentView({}, context),
      self.settingsTabContentView = new SettingsTabContentView({}, context)
    ]

    if (process.env.ENABLE_EXCHANGE == 'true' || typeof (process.env.ENABLE_EXCHANGE == undefined)) {
      self.exchangeTabContentView = new ExchangeTabContentView({}, context)
      contentViewsArr.push(self.exchangeTabContentView)
    }

    self.SetTabBarContentViews(contentViewsArr)
  }

  _setup_startObserving () {
    const self = this
    { // passwordController
      const emitter = self.context.passwordController
      emitter.on(
        emitter.EventName_didDeconstructBootedStateAndClearPassword(),
        function () { // stuff like popping stack nav Views to root Views
          self.ResetAllTabContentViewsToRootState(false) // not animated
        }
      )
      emitter.on(
        emitter.EventName_havingDeletedEverything_didDeconstructBootedStateAndClearPassword(),
        function () {
          self._selectTab_withContentView(self.walletsTabContentView) // in case it was triggered by settings - if we didn't
          // select this tab it would look like nothing happened cause the 'enter pw' modal would not be popped as there would be nothing for the list controllers to decrypt
          self.SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders() // disable some until we have booted again
        }
      )
    }
    { // walletsListController
      const emitter = self.context.walletsListController
      emitter.on(
        emitter.EventName_listUpdated(),
        function () { // if there are 0 wallets we don't want certain buttons to be enabled
          self.SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders()
        }
      )
    }
    { // walletAppCoordinator
      const emitter = self.context.walletAppCoordinator
      emitter.on(
        emitter.EventName_willTrigger_sendFundsToContact,
        function () {
          self._selectTab_withContentView(self.sendTabContentView)
        }
      )
      emitter.on(
        emitter.EventName_willTrigger_requestFundsFromContact,
        function () {
          self._selectTab_withContentView(self.requestTabContentView)
        }
      )
      emitter.on(
        emitter.EventName_willTrigger_sendFundsFromWallet(),
        function () {
          self._selectTab_withContentView(self.sendTabContentView)
        }
      )
    }
    { // drag and drop - stuff like tab auto-selection
      function _isAllowedToPerformDropOps () {
        if (self.context.passwordController.HasUserEnteredValidPasswordYet() === false) {
          console.log("User hasn't entered valid pw yet")
          return false
        }
        if (self.context.passwordController.IsUserChangingPassword() === true) {
          console.log('User is changing pw.')
          return false
        }
        if (!self.context.walletsListController.records || self.context.walletsListController.records.length == 0) {
          console.log('No wallets.')
          return false
        }
        return true
      }

      self.layer.ondragover = function (e) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      let numberOfDragsActive = 0 // we need to keep a counter because dragleave is called for children
      self.layer.ondragenter = function (e) {
        e.preventDefault()
        e.stopPropagation()
        numberOfDragsActive++
        //
        if (numberOfDragsActive == 1) { // first time since started drag that entered self.layer - becomes 0 on real dragleave
          if (_isAllowedToPerformDropOps()) {
            const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
            if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
              // NOTE: we are not currently able to call self.selectTab_sendFunds below, because it causes
              // some sort of issue where, I'm guessing, when the current tab view is removed, it doesn't
              // fire its corresponding dragleave event, which means we never end up being able to disable
              // the drag drop zone cause we never receive the final numberOfDragsActive=0 dragleave. For that
              // reason we're only allowing a drag op to start when we're already on the Send tab
              // We might be able to solve this somehow but it didn't seem important enough in early stages -PS on 1/27/17
              //
              setTimeout(
                function () { // we must not manipulate the DOM in dragenter/start because that causes dragleave to fire immediately in Chrome.
                  self.sendTabContentView._proxied_ondragenter(e)
                }
              )
            }
          } else { //
          }
        }
      }
      self.layer.ondragleave = self.layer.ondragend = function (e) {
        e.preventDefault()
        e.stopPropagation()

        numberOfDragsActive--
        //
        if (numberOfDragsActive == 0) { // back to 0 - actually left self.layer
          const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
          if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
            self.sendTabContentView._proxied_ondragleave(e)
          }
        }
        { // urlOpeningController
            const controller = self.context.urlOpeningCoordinator
            console.log(controller);
            controller.on("EventName_TimeToHandleReceivedMoneroRequestURL", function (url) {
                console.log("URL:" + url);
                // KB: This is where we're going to hook into Yat deep links
                if (url.indexOf("eid=") !== -1) {
                    // this string has a Yat parameter in it

                    console.log("That's a yat")
                    // 1. Buy a Yat
                    // eid, refresh_token
                    let queryParameterOffset = url.indexOf("?");
                    queryParameterOffset++; // remove trailing ?
        
                    let queryParameterString = url.substring(queryParameterOffset);
                    let parameterArr = queryParameterString.split("&");
                    let parameterObj = {};
                    parameterArr.map((value) => {
                        let offset = value.indexOf("=");
                        let key = value.substring(0, offset);
                        offset++;
                        let newValue = value.substring(offset);
                        parameterObj[key] = newValue;
                    })
                    parameterObj['eid'] = decodeURIComponent(parameterObj['eid']);
                    console.log(parameterArr);
                    console.log(parameterObj);
                    // 2. Connect existing Yat(s)
                    // refresh_token, eid, addresses (in YAT_TAG_1=ADDRESS_1|YAT_TAG_2=ADDRESS_2|...|YAT_TAG_N=ADDRESS_N) -- 
                    // 0x1001 - std monero, 0x1002 subaddress monero
                    // we should receive a refresh_token and an eid 
                    // self._selectTab_withContentView(self.settingsTabContentView);
                    // Maybe we just toast "Hi, linked Yat xxx to wallet.name"
                } else { // fallback to handling request as a send funds request
                    self._selectTab_withContentView(self.sendTabContentView);
                }
            })
        }
        return false
      }
    }

    { // menuController
      const emitter = self.context.menuController
      emitter.on( // on the main process -- so this will be synchronous IPC
        emitter.EventName_menuItemSelected_Preferences(),
        function () {
          self._selectTab_withContentView(self.settingsTabContentView)
        }
      )
    }
    { // urlOpeningController
      const controller = self.context.urlOpeningCoordinator
      controller.on(
        'EventName_TimeToHandleReceivedMoneroRequestURL',
        function (url) {
          self._selectTab_withContentView(self.sendTabContentView)
        }
      )
    }
  }

  overridable_isHorizontalBar () {
    const self = this
    //
    return false
  }

  overridable_tabBarView_thickness () {
    const self = this
    //
    return 79
  }

  _selectTab_withContentView (tabBarContentView) {
    const self = this
    const index = self.IndexOfTabBarContentView(tabBarContentView)
    self.SelectTabBarItemAtIndex(index)
  }
}

module.exports = RootTabBarAndContentView
