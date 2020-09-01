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
const emoji_web = require('../../Emoji/emoji_web')

class ForgotPasswordView extends View {
    constructor(options, context) {
        super(options, context)
        const self = this
        {
            const userSelectedTypeOfPassword = self.context.passwordController.userSelectedTypeOfPassword
            if (userSelectedTypeOfPassword === null || userSelectedTypeOfPassword == "" || typeof userSelectedTypeOfPassword === 'undefined') {
                throw "ConfigureToBeShown called but userSelectedTypeOfPassword undefined"
            }
            self.userSelectedTypeOfPassword = userSelectedTypeOfPassword
        }
        self.setup()
    }

    setup() {
        const self = this
        self._setup_views()
    }

    _setup_views() {
        const self = this
        self.layer.classList.add('forgot-password-layer');
        self._setup_emptyStateMessageContainerView()
        self._setup_actionButtonsContainerView()
    }

    _setup_emptyStateMessageContainerView() {
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
            layer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(self.context, "😢")
            contentContainerLayer.appendChild(layer)
        }
        {
            const layer = document.createElement("div")
            layer.classList.add("message-label")
            layer.innerHTML = "Password reset is<br/>unfortunately not possible.<br/><br/>If you can't remember your password,<br/>you'll need to clear all data and<br/>re-import your wallet(s)."

            contentContainerLayer.appendChild(layer)
        }

        self.emptyStateMessageContainerView = view
        self.addSubview(view)
    }

    _setup_actionButtonsContainerView() {
        const self = this

        const view = new View({}, self.context)
        const layer = view.layer
        layer.classList.add("action-box-two-button")
        self.actionButtonsContainerView = view
        {
            self._setup_actionButton_nevermind()
            self._setup_actionButton_clearAllData()
        }
        self.addSubview(view)
    }

    _setup_actionButton_nevermind() {
        const self = this

        const buttonView = new View({tag: "a"}, self.context)
        const layer = buttonView.layer
        layer.classList.add('utility')
        layer.innerHTML = "Nevermind"
        layer.href = "#"
        layer.classList.add('action-button')
        layer.classList.add('hoverable-cell')
        layer.style.marginRight = "9px"

        layer.addEventListener(
            "click",
            function (e) {
                e.preventDefault()

                self.navigationController.PopView(true)
            }.bind(self)
        )

        self.actionButtonsContainerView.addSubview(buttonView)
    }

    _setup_actionButton_clearAllData() {
        const self = this

        const buttonView = new View({tag: "a"}, self.context)
        const layer = buttonView.layer
        layer.classList.add('destructive')
        layer.innerHTML = "Clear all data"
        layer.href = "#"
        layer.classList.add('action-button')
        layer.classList.add('hoverable-cell')

        layer.addEventListener(
            "click",
            function (e) {
                e.preventDefault()

                var msg = 'Are you sure you want to clear your locally stored data?\n\nAny wallets will remain permanently on the Monero blockchain. At present, local-only data like contacts would not be recoverable.'
                self.context.windowDialogs.PresentQuestionAlertDialogWith(
                    'Delete everything?',
                    msg,
                    'Delete Everything',
                    'Cancel',
                    function (err, didChooseYes) {
                        if (err) {
                            throw err
                        }
                        if (didChooseYes) {
                            self.context.passwordController.InitiateDeleteEverything(function (err) {
                            })
                        }
                    }
                )
            }.bind(self)
        )
        self.actionButtonsContainerView.addSubview(buttonView)
    }

    //
    // Lifecycle - Teardown
    //
    TearDown() {
        super.TearDown()
    }

    //
    // Runtime - Accessors - Navigation
    //
    Navigation_Title() {
        const self = this
        const passwordType_humanReadableString = self.context.passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[self.userSelectedTypeOfPassword]
        return "Forgot " + passwordType_humanReadableString + "?"
    }

    Navigation_New_LeftBarButtonView() {
        return null // no back btn
    }

    Navigation_HidesBackButton() {
        return true
    }

    viewWillAppear() {
        const self = this
        super.viewWillAppear()
        self.layer.style.paddingTop = `41px`
    }
}

module.exports = ForgotPasswordView
