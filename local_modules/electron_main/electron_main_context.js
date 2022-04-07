'use strict'

const MenuController = require(__dirname + '/../Menus/MenuController.electron')
const AppUpdatesController = require(__dirname + '/../AppUpdates/AppUpdatesController.electron.main')
const UrlOpeningController = require(__dirname + '/../URLOpening/URLOpeningController.electron')
const BackgroundResponseParser = require(__dirname + '/../HostedMoneroAPIClient/BackgroundResponseParser.electron.main')
const MainWindowController = require(__dirname + '/../MainWindow/Controllers/MainWindowController.electron.main')
const AboutWindowController = require(__dirname + '/../AboutWindow/Controllers/AboutWindowController.electron.main')
const TXTResolvingController = require(__dirname + '/../OpenAlias/TXTResolvingController.electron.main')

function NewHydratedContext (app) {
  const initialContext =
  {
    app: app
  }

  const context = initialContext != null ? initialContext : {}

  context.menuController = new MenuController({}, context)
  context.appUpdatesController = new AppUpdatesController({}, context)
  context.urlOpeningController = new UrlOpeningController({}, context)
  context.backgroundResponseParser = new BackgroundResponseParser({}, context)
  context.mainWindowController = new MainWindowController({}, context)
  context.aboutWindowController = new AboutWindowController({}, context)
  context.txtResolvingController = new TXTResolvingController({}, context)

  const context_keys = Object.keys(context)
  for (const i in context_keys) {
    const context_key = context_keys[i]
    const instance = context[context_key]
    // This calls an optional function that classes can implement to get control after the whole context is set up
    const postWholeContextInit_setup__fn = instance.RuntimeContext_postWholeContextInit_setup
    if (typeof postWholeContextInit_setup__fn !== 'undefined') {
      postWholeContextInit_setup__fn.call(instance) // using 'call' so the function's "this" is instance
    }
  }

  return context
}
module.exports.NewHydratedContext = NewHydratedContext
