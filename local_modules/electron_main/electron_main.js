const electron = require('electron')
const app = electron.app
//
const context = require('./electron_main_context').NewHydratedContext(app) // electron app can be accessed at context.app; context is injected into instances of classes described in ./electron_main_context.js
module.exports = context