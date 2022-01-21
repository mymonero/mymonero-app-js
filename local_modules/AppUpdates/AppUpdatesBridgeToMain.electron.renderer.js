'use strict'

const { ipcRenderer } = require('electron')

class Controller {
  //
  // Lifecycle - Initialization
  constructor (options, context) {
    const self = this
    self.options = options
    self.context = context
    //
    self.appUpdatesController = self.context.appUpdatesController // on the main process -- so this will be synchronous IPC
    //
    self.setup()
  }

  setup () {
    const self = this
    //
    self.setupWith_settingsController()
  }

  setupWith_settingsController () {
    const self = this
    const controller = self.context.settingsController
    controller.executeWhenBooted(
      function () {
        self.call_menuController_IPCMethod_ViewOfSettingsUpdated()
      }
    )
    controller.on(
      controller.EventName_settingsChanged_autoDownloadUpdatesEnabled(),
      function () {
        self.call_menuController_IPCMethod_ViewOfSettingsUpdated()
      }
    )
  }

  //
  // Imperatives
  call_menuController_IPCMethod_ViewOfSettingsUpdated () {
    const self = this
    let isEnabled = self.context.settingsController.autoDownloadUpdatesEnabled
    if (typeof isEnabled === 'undefined' || isEnabled === null) {
      isEnabled = false
      throw Error('Expected isEnabled != nil')
    }
    ipcRenderer.send(
      self.appUpdatesController.IPCMethod__ViewOfSettingsUpdated(),
      {
        autoDownloadUpdatesEnabled: isEnabled
      }
    )
  }
}
module.exports = Controller
