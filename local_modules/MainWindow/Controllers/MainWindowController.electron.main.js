'use strict'

const electron = require('electron')

class MainWindowController {
  constructor (options, context) {
    const self = this
    //
    self.options = options
    self.context = context
    //
    self.setup()
  }

  setup () {
    const self = this
    self.setup_window()
    self.startObserving_app()
  }

  setup_window () {
    const self = this
    const app = self.context.app
    //
    self.window = null // zeroing and declaration
  }

  startObserving_app () {
    const self = this
    const app = self.context.app
    app.on('activate', function () {
      if (self.window === null) {
        self._create_window_ifNecessary()
      }
    })
    // custom:
    app.on('launched-duplicatively', function (argv) { // bring window to forefront however necessary
      if (self.window !== null) {
        if (self.window.isMinimized()) {
          self.window.restore()
        }
        self.window.focus()
      }
    })
  }

  /// /////////////////////////////////////////////////////////////////////////////
  // Accessors - Window

  _new_window () {
    const self = this
    const options =
		{
		  width: 595,
		  height: 640,
		  minWidth: 595, // For action buttons
		  minHeight: 640,
		  title: 'MyMonero', // Windows
		  show: false, // shown on ready
		  backgroundColor: '#272527',
		  titleBarStyle: 'hiddenInset',
		  //
		  webPreferences: {
		    backgroundThrottling: false, // disable powersaving/throttling so that app lock-down
		    // can actually occur when app is in the background or is minimized

		    nodeIntegration: true,
		    enableRemoteModule: true,

		    // the following are currently the default values but stating them here to be explicit…
		    webSecurity: true,
		    allowDisplayingInsecureContent: false, // https content only
		    allowRunningInsecureContent: false // html/js/css from https only
		  }
		}
    const isWin = /^win/.test(process.platform)
    const isLinux = /linux/.test(process.platform)
    if (isLinux) { // TODO: improve with 'path'
      const mutable_pathTo_localModules_components = __dirname.split('/')
      mutable_pathTo_localModules_components.pop() // ../
      mutable_pathTo_localModules_components.pop() // ../
      const absPathTo_localModules = mutable_pathTo_localModules_components.join('/')
      //
      const pathTo_iconImage_png = absPathTo_localModules + '/electron_main/Resources/icons/icon.png'
      options.icon = pathTo_iconImage_png
    }
    if (isWin || isLinux) {
      options.height += 55
      options.maxHeight += 55
    }
    const window = new electron.BrowserWindow(options)
    window.loadURL(`file://${__dirname}/../Views/index.electron.html`) // it is critical that this remains a local, controlled file since nodeIntegration=true
    //
    return window
  }

  create_window_whenAppReady () {
    const self = this
    const app = self.context.app
    app.whenReady().then(() => {
      self._create_window_ifNecessary()
    })
  }

  _create_window_ifNecessary () {
    const self = this
    if (self.window !== null && typeof self.window !== 'undefined') {
      return
    }
    const window = self._new_window()
    self.window = window
    window.once('ready-to-show', function () {
      window.show()
    })
    window.on('closed', function () // this is not within new_window because such accessors should never directly or indirectly modify state of anything but within its own fn scope
    {
      self.window = null // release
      // Now since window-all-closed seems to not like to fire, ever, and since we have a main window…
      // I'll just use this to quit the app:
      if (process.platform !== 'darwin') { // because macos apps stay active while main window closed
        self.context.app.quit()
      }
    })
    window.on('page-title-updated', function (e, title) {
      // prevent system from changing the name of the window - may be relevant on platforms like Linux
      if (title !== 'MyMonero') {
        e.preventDefault()
      }
    })
    { // hardening
      window.webContents.on('will-navigate', function (e) {
        e.preventDefault() // do not allow navigation when users drop links
      })
      const allowDevTools = process.env.NODE_ENV === 'development'
      const openDevTools = allowDevTools === true && true // flip this && BOOL to enable/disable in dev
      if (allowDevTools !== true) { // this prevents the dev tools from staying open
        window.webContents.on( // but it would be nicer to completely preclude it opening
          'devtools-opened',
          function () {
            if (self.window) {
              self.window.webContents.closeDevTools()
            }
          }
        )
      }
      if (openDevTools === true) {
        self.window.webContents.openDevTools()
      }
    }
  }

  /// /////////////////////////////////////////////////////////////////////////////
  // Runtime - Delegation - Post-instantiation hook

  RuntimeContext_postWholeContextInit_setup () {
    const self = this
    // We have to wait until post-whole-context-init to guarantee all controllers exist
    //
    // We'll wait til here to create the window cause it's the thing that generally kicks off booting the application/UI-level controllers in the context.
    // However, we can't wait til those controllers are booted to create the window because they might need
    // to present things like the password entry fields in the UI
    self.create_window_whenAppReady()
  }

  /// /////////////////////////////////////////////////////////////////////////////
  // Delegation - Private - Windows
}
module.exports = MainWindowController
