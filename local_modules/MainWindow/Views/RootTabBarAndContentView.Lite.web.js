
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
const RootTabBarAndContentView_Base = require('./RootTabBarAndContentView_Base.web')
//
class RootTabBarAndContentView_Lite extends RootTabBarAndContentView_Base
{
	constructor(options, context)
	{
		super(options, context)
	}
	_setup_addTabBarContentViews()
	{
		const self = this
		const context = self.context
		{ // walletsListView
			const options = {}
			const WalletsTabContentView = require('../../WalletsList/Views/WalletsTabContentView.web')
			const view = new WalletsTabContentView(options, context)
			self.walletsTabContentView = view
		}
		{ // sendTabContentView
			const options = {}
			const SendTabContentView = require('../../SendFundsTab/Views/SendTabContentView.Lite.web')
			const view = new SendTabContentView(options, context)
			self.sendTabContentView = view
		}
		{
			const options = {}
			const RequestTabContentView = require('../../RequestFunds/Views/RequestTabContentView.Lite.web')
			const view = new RequestTabContentView(options, context)
			self.requestTabContentView = view
		}
		{
			const options = {}
			const ContactsTabContentView = require('../../Contacts/Views/ContactsTabContentView.Lite.web')
			const view = new ContactsTabContentView(options, context)
			self.contactsTabContentView = view
		}
		{ // SettingsView
			const SettingsTabContentView = require('../../Settings/Views/SettingsTabContentView.web')
			const view = new SettingsTabContentView({}, context)
			self.settingsTabContentView = view
		}
		self.SetTabBarContentViews(
			[
				self.walletsTabContentView,
				self.sendTabContentView,
				self.requestTabContentView,
				self.contactsTabContentView,
				self.settingsTabContentView
			]
		)
	}
}
module.exports = RootTabBarAndContentView_Lite