"use strict"

const EventEmitter = require('events')

class MockedUpdater extends EventEmitter
{
	constructor()
	{
		super()
		const self = this
		self.autoDownload = true // we set this to false of course
		self.autoInstallOnAppQuit = true; // we set this to false but it's true in the real impl
	}
	
	checkForUpdates()
	{
		const self = this
		if (self.isChecking) {
			console.warn("Already checking")
			return
		}
		self.isChecking = true
		setTimeout(function()
		{
			const i = Math.random()
			if (i < 0.33) {
				self.__failToCheck()
			} else if (i < 0.66) {
				self.__succeedToCheck_avail()
			} else {
				self.__succeedToCheck_notAvail()
			}
		}, 1000)
	}
	__failToCheck()
	{
		const self = this
		self.isChecking = false;
		self.emit('error', new Error('Mocked error while checking'))
	}
	__succeedToCheck_avail()
	{
		const self = this
		self.isChecking = false;
		self.emit('update-available')
		if (self.autoDownload) {
			setTimeout(function()
			{
				self.downloadUpdate()
			})
		}
	}
	__succeedToCheck_notAvail()
	{
		const self = this
		self.isChecking = false;
		self.emit('update-not-available')
	}
	downloadUpdate()
	{
		const self = this
		setTimeout(function()
		{
			const i = Math.random()
			if (i < 0.5) {
				self.__failToDownload()
			} else {
				self.__succeedToDownload()
			}
		}, 1000)
	}
	__failToDownload()
	{
		const self = this
		self.emit('error', new Error('Mocked error while downloading'))
	}
	__succeedToDownload()
	{
		const self = this
		self.emit('update-downloaded')
		//
		if (self.autoInstallOnAppQuit) {
			// nothing to actually do here - the real impl sets a hook to doInstall on 'quit'
			console.log("Update downloaded .. will install on quit")
		}
	}
	//
	quitAndInstall()
	{
		console.log("quit and install")
	}
}
module.exports = MockedUpdater;