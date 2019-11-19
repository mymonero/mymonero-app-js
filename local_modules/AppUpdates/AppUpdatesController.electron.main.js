// Copyright (c) 2014-2019, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const EventEmitter = require('events')
const { Notification, dialog, ipcMain } = require("electron")
//
const isLinux = typeof process.platform !== 'undefined' && process.platform && /linux/.test(process.platform)
const isAutoUpdaterSupported = isLinux == false && process.env.NODE_ENV !== 'development' // no support in either case .. in the latter we need a dev yaml file in the asar and I'm just turning it off here to avoid contributor confusion at the error which pops up in the file's absence
//
const useMockedAutoUpdater = false && process.env.NODE_ENV === 'development'
var autoUpdater = null;
if (useMockedAutoUpdater) { // `false &&` means don't do it even in dev mode
	const MockedUpdater = require('./MockedUpdater.electron.main.dev')
	autoUpdater = new MockedUpdater()
} else {
	if (isAutoUpdaterSupported) { // because there's no support under linux, we might as well not include it
		autoUpdater = require("electron-updater").autoUpdater
	}
}
if (autoUpdater) {
	autoUpdater.autoDownload = false; // No sneaking updates in if Pref has it turned off
	autoUpdater.autoInstallOnAppQuit = false; // This also gets managed
}
//
const path = require("path")
const absPathTo_localModules = path.join(__dirname, '..')
const pathTo_iconImage_png = absPathTo_localModules + "/electron_main/Resources/icons/icon.png"
//
class Controller extends EventEmitter
{
	constructor(options, context)
	{
		super()
		const self = this
		self.options = options
		self.context = context
		//
		self.setup()
	}
	setup()
	{
		const self = this
		//
		if (autoUpdater == null) {
			if (isAutoUpdaterSupported) {
				throw "Illegal autoUpdater=null && isAutoUpdaterSupported"
			}
			return; // nothing to do
		}
		//
		const log = require('electron-log');
		autoUpdater.logger = log;
		autoUpdater.logger.transports.file.level = 'info';
		//
		self.set_autoUpdateInstallEnabled(false) // just to make it clear we're starting with 'off'
		// ... when the settings controller boots, we will read the value that's there.
		// that toggle will be on by default but this implementation respects the Pref before app unlock
		//
		var nonManualErrorNote_shownNTimes = 0;
		autoUpdater.on('error', function(error)
		{
			const err_msg = error 
				? "" + error.message
				: "An unknown error occurred while checking for updates.";
			if (self.lastCheckWasManuallyInitiated) { 
				// only show dialog for error if auto-updates are off OR self.lastCheckWasManuallyInitiated == true
				dialog.showErrorBox("MyMonero Software Update Error", err_msg);
			} else {
				if (nonManualErrorNote_shownNTimes < 2) {
					// ^--- I considered a number of other solutions the problem of notification pile-up when network not reachable such as observing when notifications were closed and so not showing them if the previous specific one hadn't been closed, but the close event is not guaranteed.
					// Showing the error here is more of a convenience, since it's in cases that aren't manually initiated. So I'll just limit it to a reasonable 2 such error notifications per app session until a better solution is derived.
					const note = new Notification({
						title: "Error fetching MyMonero updates",
						body: err_msg,
					})
					note.show()
					//
					nonManualErrorNote_shownNTimes += 1;
				}
			}
			self.__didFinishUpdatesCheck() // clean up state and emit
		})
		autoUpdater.on('update-available', function()
		{
			if (autoUpdater.autoDownload) {
				if (self.lastCheckWasManuallyInitiated) { 
					const note = new Notification({
						title: "Downloading Update",
						body: "MyMonero is downloading an update that it found.",
					})
					note.show()
				} else {
					// no need to say anything yet - we will do later
				}
			} else {
				const buttonIndex = dialog.showMessageBoxSync({
					type: 'info',
					title: 'Found Update',
					icon: pathTo_iconImage_png,
					cancelId: 1,
					defaultId: 0,
					message: 'MyMonero found a software update. Do you want to download it now?',
					buttons: ['Download', 'Cancel']
				})
				if (buttonIndex === 0) {
					autoUpdater.downloadUpdate()
				} else {
					self.__didFinishUpdatesCheck() // clean up state and emit
				}

			}
		})
		autoUpdater.on('update-not-available', function()
		{
			if (self.lastCheckWasManuallyInitiated == true) {
				dialog.showMessageBox({
					title: 'No Update Available',
					icon: pathTo_iconImage_png,
					message: 'Current version is up-to-date.',
					buttons: [ 'OK' ]
				})
			}
			self.__didFinishUpdatesCheck() // clean up state and emit
		})
		autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName)
		{
			//
			self.dateAnUpdateLastDownloadedDuringRun = new Date()
			//
			if (autoUpdater.autoDownload && self.lastCheckWasManuallyInitiated != true) {
				if (autoUpdater.autoInstallOnAppQuit != true) {
					console.warn("Unexpected autoUpdater.autoDownload && !autoUpdater.autoInstallOnAppQuit")
				}
				if (self.lastCheckWasManuallyInitiated == true) {
					throw "This should be a dialog"
				}
				const note = new Notification({
					title: "A new update is ready to install",
					body: `New MyMonero version is downloaded and will be automatically installed on exit`,
				})
				note.show()
			} else {
				// This dialog was initially for non-autodownload, but the copy 
				// should remain compatible with self.lastCheckWasManuallyInitiated == true 
				// as well, i.e. 'the app must quit' rather than 'will install automatically 
				// on quit' (... which is mediated by autoUpdater.autoInstallOnAppQuit)
				const laterButtonTitle = 'Later'
				const installButtonTitle = 'Install'
				const releaseNotesButtonTitle = 'Release Notes'
				const buttonTitles = [ installButtonTitle, laterButtonTitle, releaseNotesButtonTitle ]
				const installButtonIndex = buttonTitles.indexOf(installButtonTitle)
				const laterButtonIndex = buttonTitles.indexOf(laterButtonTitle)
				const releaseNotesButtonTitleIndex = buttonTitles.indexOf(releaseNotesButtonTitle)
				const response = dialog.showMessageBoxSync({
					type: 'info',
					title: 'Updates Ready to Install',
					message: 'The new MyMonero version has been downloaded. The app must quit to install the update.',
					icon: pathTo_iconImage_png,
					defaultId: installButtonIndex,
					cancelId: laterButtonIndex,
					buttons: buttonTitles,
				})
				if (response === installButtonIndex) {
					setImmediate(function()
					{
						autoUpdater.quitAndInstall()
					})
				} else if (response === releaseNotesButtonTitleIndex) {
					setImmediate(function()
					{
						const shell = require('electron').shell
						shell.openExternal(
							"https://github.com/mymonero/mymonero-app-js/releases"
						)
					})
				}
				self.__didFinishUpdatesCheck() // clean up state and emit
			}
		})
		function _observedReady()
		{
			const autoCheck = function()
			{
				if (typeof self.lastManuallyCheckInitiationDate !== 'undefined' && self.lastManuallyCheckInitiationDate) {
					const sSinceLastManualCheck = (new Date() - self.lastManuallyCheckInitiationDate) / 1000;
					if (sSinceLastManualCheck < 60 * 5) { // 5 mins
						const msg = "Skipping checking for updates since last check was manually initiated less than 5 mins ago."
						console.warn(msg)
						autoUpdater.logger.info(msg)
						return
					} // otherwise we'll get an immediate check for update after the user goes through the dialogs from an update check, if the user hits 'check' right after launching the app
				}
				if (typeof self.dateAnUpdateLastDownloadedDuringRun !== 'undefined' && self.dateAnUpdateLastDownloadedDuringRun) {
					const sSinceLastUpdateDownloaded = (new Date() - self.dateAnUpdateLastDownloadedDuringRun) / 1000;
					if (sSinceLastUpdateDownloaded < 60 * 30) { // give them 30 mins before we show the dialog again
						// this is done here because the alternative would be trying to detect the version that was downloaded but not installed yet .. then probably just not display the alert again if we've downloaded it but they hit install later ... if they had alternatively hit 'release notes' then the user might actually want the reminder .. plus another update may have come out since then .. which would arguably be likely to be critical
						const msg = "Update was already downloaded recently.. Deferring update check until later"
						console.warn(msg)
						autoUpdater.logger.info(msg)
						return;
					}
				}
				self.checkForUpdates(false)
			}
			setTimeout(function()
			{
				autoCheck()
			}, 1000 * 10) // 10s later - after the UI has loaded and after the PW has been entered 
			setInterval(function()
			{ 
				autoCheck()
			}, 1000 * 60 * 10) // every 10 mins
		}
		if (self.context.app.isReady()) {
			_observedReady()
		} else {
			self.context.app.on('ready', _observedReady);
		}
		//
		self.startObserving_ipc()
	}
	startObserving_ipc()
	{
		const self = this
		ipcMain.on(
			self.IPCMethod__ViewOfSettingsUpdated(), 
			function(event, params)
			{
				const autoDownloadUpdatesEnabled = params.autoDownloadUpdatesEnabled
				// Called on SettingsController boot and on field toggles.
				// This will also get called on a DeleteEverything.
				// When app gets locked down we don't need to set autoupdate to off because if it's set to on, it's ok to allow autoupdate even if the app is locked
				self.set_autoUpdateInstallEnabled(autoDownloadUpdatesEnabled)
			}
		);
	}
	//
	// Runtime - Accessors - IPC Method names
	IPCMethod__ViewOfSettingsUpdated()
	{ 
		return "IPCMethod__ViewOfSettingsUpdated"
	}
	//
	// Imperatives
	set_autoUpdateInstallEnabled(to_isEnabled)
	{
		const self = this
		if (autoUpdater == null) {
			throw "The app should disallow calling set_autoUpdateInstallEnabled(…) while autoUpdater is legally null."
		}
		autoUpdater.autoDownload = to_isEnabled;
		autoUpdater.autoInstallOnAppQuit = to_isEnabled;
		// These get picked up by the autoUpdater again when its checkForUpdates() is called
	}
	//
	manually_checkForUpdates()
	{
		return this.checkForUpdates(true);
	}
	checkForUpdates(isManuallyInitiated)
	{
		const self = this
		if (autoUpdater == null) {
			throw "The app should disallow calling checkForUpdates(…) while autoUpdater is legally null."
		}
		{ 
			isManuallyInitiated = isManuallyInitiated == true ? true : false
		}
		if (isManuallyInitiated) { // always flip current state to true for redundant calls
			self.lastCheckWasManuallyInitiated = true
			self.lastManuallyCheckInitiationDate = new Date()
		}
		autoUpdater.checkForUpdates();
	}
	//
	// Runtime - Delegation
	__didFinishUpdatesCheck()
	{
		const self = this
		const wasManual = self.lastCheckWasManuallyInitiated
		self.lastCheckWasManuallyInitiated = undefined // un-set for next time
	}
}
module.exports = Controller
