"use strict"
//
const electron = require('electron')
//
const WindowController = require('../electron_utils/WindowController')
//
class MainWindowController extends WindowController
{
	//
	//
	// Initialization
	//	
    setup()
    {
        var self = this
        super.setup()
		//
		self.setup_window()
		self.setup_observation()
    }
	setup_window()
	{
		var self = this
		var app = self.context.app
		//
		self.window = null // zeroing and declaration
		if (app.isReady() === true) {
			self._create_window_ifNecessary()
		}
	}
	setup_observation()
	{
		var self = this
		var app = self.context.app
		//
		if (app.isReady() == false) {
			app.on('ready', function()
			{
				self._create_window_ifNecessary()
			})
		}
		app.on('window-all-closed', self._allWindowsDidClose)
		app.on('activate', function()
		{
		    if (self.window === null) {
				self._create_window_ifNecessary()
		    }
		})
	}
	//
	//
	// Accessors
	//
	_new_window()
	{
		var self = this
		//
		var window = new electron.BrowserWindow({
	  	  width: 800, 
	  	  height: 600
	    })
		window.loadURL(`file://${__dirname}/html/index.html`)
		//
		return window
	}
	//
	//
	// Imperatives
	//
	_create_window_ifNecessary()
	{
		var self = this
		//
		if (self.window !== null && typeof self.window !== 'undefined') {
			return
		}
		self.window = self._new_window();
		self.window.on('closed', function() // this is not within new_window because such accessors should never directly or indirectly modify state of anything but within its own fn scope
		{
			self.window = null // release
		})
	}
	//
	//
	// Delegation
	//
	_allWindowsDidClose()
	{
		var self = this
		var app = self.context.app
		//
	    if (process.platform !== 'darwin') { // because macos apps stay active while main window closed
			app.quit() 
	    }
	}
}
module.exports = MainWindowController