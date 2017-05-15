// Copyright (c) 2014-2017, MyMonero.com
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
class RootTabBarAndContentView extends RootTabBarAndContentView_Base
{
	constructor(options, context)
	{
		super(options, context)
	}
	_setup_startObserving()
	{
		const self = this
		super._setup_startObserving()
		{ // drag and drop - stuff like tab auto-selection
			function _isAllowedToPerformDropOps()
			{
				if (self.context.passwordController.HasUserEnteredValidPasswordYet() === false) {
					console.log("User hasn't entered valid pw yet")
					return false
				}
				if (self.context.passwordController.IsUserChangingPassword() === true) {
					console.log("User is changing pw.")
					return false
				}
				if (!self.context.walletsListController.records || self.context.walletsListController.records.length == 0) {
					console.log("No wallets.")
					return false
				}
				return true
			}
			self.layer.ondragover = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				return false
			}
			var numberOfDragsActive = 0 // we need to keep a counter because dragleave is called for children
			self.layer.ondragenter = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				numberOfDragsActive++
				//
				if (numberOfDragsActive == 1) { // first time since started drag that entered self.layer - becomes 0 on real dragleave
					if (_isAllowedToPerformDropOps()) {
						const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
						if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
							// NOTE: we are not currently able to call self.selectTab_sendFunds below, because it causes
							// some sort of issue where, I'm guessing, when the current tab view is removed, it doesn't
							// fire its corresponding dragleave event, which means we never end up being able to disable
							// the drag drop zone cause we never receive the final numberOfDragsActive=0 dragleave. For that
							// reason we're only allowing a drag op to start when we're already on the Send tab
							// We might be able to solve this somehow but it didn't seem important enough in early stages -PS on 1/27/17
							//
							setTimeout(
								function()
								{ // we must not manipulate the DOM in dragenter/start because that causes dragleave to fire immediately in Chrome.
									// self.selectTab_sendFunds()
									self.sendTabContentView._proxied_ondragenter(e)
								}
							)
						}
					} else { // 
					}
				}
			}
			self.layer.ondragleave = self.layer.ondragend = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				
				numberOfDragsActive--
				//
				if (numberOfDragsActive == 0) { // back to 0 - actually left self.layer
					const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
					if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
						self.sendTabContentView._proxied_ondragleave(e)
					}
				}
				return false
			}
			self.layer.ondrop = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				numberOfDragsActive = 0 // reset just in case ondragleave wasn't properly fired due to some DOM manipulation or on drop. can happen.
				const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
				if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
					self.sendTabContentView._proxied_ondrop(e)
				}
				return false
			}
		}
	}
}
module.exports = RootTabBarAndContentView
