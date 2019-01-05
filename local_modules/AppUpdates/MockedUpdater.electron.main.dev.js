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
//
class MockedUpdater extends EventEmitter
{
	constructor()
	{
		super()
		const self = this
		self.autoDownload = true // we set this to false of course
		self.autoInstallOnAppQuit = true; // we set this to false but it's true in the real impl
	}
	//
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