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
const View = require('../../Views/View.web')
const ListView = require('../../Lists/Views/ListView.web')
const emoji_web = require('../../Emoji/emoji_web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')

class ExchangeContentView extends ListView {
    constructor(options, context) {
        options.listController = context.contactsListController
        // ^- injecting dep so consumer of self doesn't have to
        super(options, context)
        self.currentlyPresented_AddContactView = null // zeroing
    }

    _setup_views() {
        const self = this
        super._setup_views()
        self._setup_emptyStateContainerView()
    }

    _setup_emptyStateContainerView() {
        const self = this

        const view = new View({}, self.context)
        {
            const layer = view.layer
            layer.classList.add("emptyScreens")
            layer.classList.add("empty-page-panel")
        }
        var contentContainerLayer;
        {
            const layer = document.createElement("div")
            layer.classList.add("content-container")
            layer.classList.add("empty-page-content-container")
            contentContainerLayer = layer
            view.layer.appendChild(layer)
        }
        {
            const layer = document.createElement("div")
            layer.classList.add("emoji-label")
            layer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(self.context, "😬")
            contentContainerLayer.appendChild(layer)
        }
        {
            const layer = document.createElement("div")
            layer.classList.add("message-label")
            layer.innerHTML = "This is where we will be exchanging!"

            contentContainerLayer.appendChild(layer)
        }

        self.emptyStateMessageContainerView = view
        self.addSubview(view)
    }

    Navigation_Title() {
        return "Exchange"
    }

    Navigation_New_RightBarButtonView()
    {
        const self = this
        //
        const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
        view.layer.addEventListener(
            "click",
            function(e)
            {
                e.preventDefault()
                //
                console.warn("Button pressed and then view change")
                //
                // const view = new AddContactFromContactsTabView({}, self.context)
                // self.currentlyPresented_AddContactView = view
                // const navigationView = new StackAndModalNavigationView({}, self.context)
                // navigationView.SetStackViews([ view ])
                // self.navigationController.PresentView(navigationView, true)
                //
                return false
            }
        )
        return view
    }
}

module.exports = ExchangeContentView
