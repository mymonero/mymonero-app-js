'use strict'

const webComponents = require('@mymonero/mymonero-web-components')
const setup_utils = require('../../MMAppRendererSetup/renderer_setup.electron')
setup_utils({
  reporting_processName: 'MainWindow'
})

const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal('context')
//
const RootView = require('./RootView.web') // electron uses .web files as it has a web DOM
require('../../MoneroUtils/monero_utils.electron.web')({}).then(function (monero_utils) {
  const renderer_context = require('../Models/index_context.electron.renderer').NewHydratedContext(
    remote__app,
    remote__context.menuController, // for UI and app runtime access
    remote__context.urlOpeningController,
    remote__context.appUpdatesController,
    monero_utils
  )
  { // since we're using emoji, now that we have the context, we can call PreLoadAndSetUpEmojiOne
    const emoji_web = require('../../Emoji/emoji_web')
    emoji_web.PreLoadAndSetUpEmojiOne(renderer_context)
  }
  const options = {}
  const rootView = new RootView(options, renderer_context)
  rootView.superview = null // just to be explicit; however we will set a .superlayer
  { // now manually attach the rootView to the DOM and specify view's usual managed reference(s)
    const superlayer = document.body
    rootView.superlayer = superlayer
    superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
  }
  //
  // setup the context menu
  require('electron-context-menu')({
    shouldShowMenu: (event, params) => params.isEditable,
    showInspectElement: false
  })
})
