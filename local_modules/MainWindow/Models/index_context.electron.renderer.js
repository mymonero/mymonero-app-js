'use strict'

const HostedMoneroAPIClient = require(__dirname + '/../../HostedMoneroAPIClient/HostedMoneroAPIClient')
const TXTRecordResolver = require(__dirname + '/../../OpenAlias/TXTResolver.electron.renderer')
const Pasteboard = require(__dirname + '/../../Pasteboard/Pasteboard.electron')
const FilesystemUI = require(__dirname + '/../../FilesystemUI/FilesystemUI.electron')
const WindowDialogs = require(__dirname + '/../../WindowDialogs/WindowDialogs.electron')
const URLBrowser = require(__dirname + '/../../URLBrowser/URLBrowser.electron')
const CcyConversionRates = require(__dirname + '/../../CcyConversionRates/Controller')
const Locale = require(__dirname + '/../../Locale/Locale.electron')
const DocumentPersister = require(__dirname + '/../../DocumentPersister/DocumentPersister.Files')
const BackgroundResponseParser = require(__dirname + '/../../HostedMoneroAPIClient/BackgroundResponseParser.electron.renderer')
const OpenAliasResolver = require(__dirname + '/../../OpenAlias/OpenAliasResolver')
const ThemeController = require(__dirname + '/../../Theme/ThemeController')
const PasswordController = require(__dirname + '/../../Passwords/Controllers/PasswordController')
const SettingsController = require(__dirname + '/../../Settings/Controllers/SettingsController')
const UserIdleInWindowController = require(__dirname + '/../../UserIdle/UserIdleInWindowController')
const WalletsListController = require(__dirname + '/../../WalletsList/Controllers/WalletsListController')
const FundsRequestsListController = require(__dirname + '/../../RequestFunds/Controllers/FundsRequestsListController')
const ContactsListController = require(__dirname + '/../../Contacts/Controllers/ContactsListController')
const WalletAppCoordinator = require(__dirname + '/../../WalletAppCoordinator/WalletAppCoordinator')
const URLOpeningCoordinator = require(__dirname + '/../../URLOpening/URLOpeningCoordinator.web')
const MenuControllerController = require(__dirname + '/../../Menus/MenuControllerController.renderer')
const AppUpdatesBridgeToMain = require(__dirname + '/../../AppUpdates/AppUpdatesBridgeToMain.electron.renderer')
const Electron = require("electron")

function NewHydratedContext (app, menuController, urlOpeningController, appUpdatesController, monero_utils) {
  const initialContext =
  {
    nettype: require('@mymonero/mymonero-nettype').network_type.MAINNET, // critical setting
    app: app,
    menuController: menuController,
    appUpdatesController: appUpdatesController,
    urlOpeningController: urlOpeningController,
    userDataAbsoluteFilepath: app.getPath('userData'),
    isDebug: process.env.NODE_ENV === 'development',
    platformSpecific_RootTabBarAndContentView: require('../Views/RootTabBarAndContentView.electron.web'), // slightly messy place to put this (thanks to Cordova port) but it works
    HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess: false && process.env.NODE_ENV === 'development',
    monero_utils: monero_utils
  }

  const context = initialContext != null ? initialContext : {}

  context.hostedMoneroAPIClient = new HostedMoneroAPIClient({
    request_conformant_module: require('xhr'),
    appUserAgent_product: app.name,
    appUserAgent_version: app.getVersion()
  }, context)
  context.pasteboard = new Pasteboard({}, context)
  context.filesystemUI = new FilesystemUI({}, context)
  context.windowDialogs = new WindowDialogs({}, context)
  context.urlBrowser = new URLBrowser({}, context)
  context.CcyConversionRates_Controller_shared = new CcyConversionRates({}, context)
  context.locale = new Locale({}, context)
  context.persister = new DocumentPersister({
    userDataAbsoluteFilepath: app.getPath('userData'),
    fs: require('fs')
  }, context)
  context.backgroundAPIResponseParser = new BackgroundResponseParser({}, context)
  context.openAliasResolver = new OpenAliasResolver({ txtRecordResolver: new TXTRecordResolver({}) }, context)
  context.themeController = new ThemeController({}, context)
  context.passwordController = new PasswordController({}, context)
  context.settingsController = new SettingsController({}, context)
  context.userIdleInWindowController = new UserIdleInWindowController({}, context)
  context.walletsListController = new WalletsListController({}, context)
  context.fundsRequestsListController = new FundsRequestsListController({}, context)
  context.contactsListController = new ContactsListController({}, context)
  context.walletAppCoordinator = new WalletAppCoordinator({}, context)
  context.urlOpeningCoordinator = new URLOpeningCoordinator({}, context)
  context.menuControllerController = new MenuControllerController({}, context)
  context.appUpdatesBridgeToMain = new AppUpdatesBridgeToMain({}, context)

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

  context.shell = Electron.shell
  return context
}
module.exports.NewHydratedContext = NewHydratedContext
