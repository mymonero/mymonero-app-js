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
const uuidV1 = require('uuid/v1')
const View = require('../Views/View.web')
const numberOfMnemonicWordsRequiredForVerification = 7
exports.numberOfMnemonicWordsRequiredForVerification = numberOfMnemonicWordsRequiredForVerification

//
function New_MnemonicTextDisplayView(mnemonicString, context) {
    const view = new View({}, context)
    const layer = view.layer
    layer.className = "mnemonic-container"
    layer.classList.add('mnemonic-container-text')
    layer.innerHTML = mnemonicString
    //
    return view
}

exports.New_MnemonicTextDisplayView = New_MnemonicTextDisplayView

//
function New_MnemonicConfirmation_SelectedWordsView(mnemonicString, context, didSelectWord_fn, didDeselectWord_fn) {
    didSelectWord_fn = didSelectWord_fn || function (wordUUID) {
    }
    didDeselectWord_fn = didDeselectWord_fn || function (wordUUID) {
    }
    //
    const view = new View({}, context)
    {
        const layer = view.layer
        layer.className = "mnemonic-container"
        layer.style.minHeight = `89px`
        layer.style.padding = `20px 24px`
        layer.style.width = `calc(100% - 32px - 2px - 48px)`
        layer.style.textAlign = "center"
    }
    // const all_mnemonicWords = mnemonicString.split(" ")
    // const necessary_mnemonicWords = all_mnemonicWords.slice(0, 6)
    const ordered_selectedWordUUIDs = []
    view.Component_SelectedWords = function () { // this is a little circuitous but seems the price for soloing the uuid-word mapping in the selectableWordsView
        return view.mnemonicConfirmation_selectableWordsView.Component_WordsFromUUIDs(ordered_selectedWordUUIDs)
    }
    const selectedWord_viewsByWordUUID = {}
    // Component - Methods - Setup - Imperatives
    view.Component_ConfigureWith_selectableWordsView = function (mnemonicConfirmation_selectableWordsView) {
        view.mnemonicConfirmation_selectableWordsView = mnemonicConfirmation_selectableWordsView
    }
    // Component - Methods - Teardown - Imperatives
    view.TearDown = function () {
        view.mnemonicConfirmation_selectableWordsView = null
    }
    // Component - Methods - Runtime - Imperatives
    view.Component_SelectWordWithUUID = function (word, wordUUID) {
        if (view.isEnabled == false) {
            console.warn("Selected but not enabled")
            return
        }
        ordered_selectedWordUUIDs.push(wordUUID)
        //
        const wordView = _new_MnemonicConfirmation_WordView(word, wordUUID, context)
        const wordView_layer = wordView.layer
        wordView_layer.addEventListener(
            "click",
            function (e) {
                e.preventDefault()
                if (view.isEnabled == false) {
                    console.warn("Word deselected but control not enabled")
                    return
                }
                const this_wordView_layer = this
                this_wordView_layer.href = "" // no longer clickable
                const wordUUID = this_wordView_layer.__component_mnemonicWordUUID
                if (!wordUUID || typeof wordUUID === 'undefined') {
                    throw "No word id associated with clicked layer"
                }
                view.Component_DeselectWordWithUUID(wordUUID)
                return false
            }
        )
        selectedWord_viewsByWordUUID[wordUUID] = wordView
        view.layer.appendChild(wordView_layer)
        //
        didSelectWord_fn(wordUUID)
    }
    view.Component_DeselectWordWithUUID = function (wordUUID) {
        {
            const indexOf_wordUUID = ordered_selectedWordUUIDs.indexOf(wordUUID)
            if (indexOf_wordUUID === -1) {
                throw "WordUUID not found in list of selected words."
            }
            ordered_selectedWordUUIDs.splice(indexOf_wordUUID, 1) // remove
        }
        {
            const wordView = selectedWord_viewsByWordUUID[wordUUID]
            const wordView_layer = wordView.layer
            delete selectedWord_viewsByWordUUID[wordUUID]
            view.layer.removeChild(wordView_layer)
            //
            view.mnemonicConfirmation_selectableWordsView.Component_WordWithUUIDWasDeselected(wordUUID)
            //
            didDeselectWord_fn(wordUUID)
        }
    }
    view.Component_DeselectAllWords = function () {
        const copyOf_ordered_selectedWordUUIDs = ordered_selectedWordUUIDs.slice()
        copyOf_ordered_selectedWordUUIDs.forEach(
            function (wordUUID, i) {
                view.Component_DeselectWordWithUUID(wordUUID)
            }
        )
    }
    view.Component_SetEnabled = function (isEnabled) {
        if (view.isEnabled == isEnabled) {
            console.warn("Already isEnabled", isEnabled)
            return
        }
        view.isEnabled = isEnabled
        const wordUUIDs = Object.keys(selectedWord_viewsByWordUUID)
        wordUUIDs.forEach(
            function (wordUUID, i) {
                const wordView = selectedWord_viewsByWordUUID[wordUUID]
                if (isEnabled == false) {
                    wordView.layer.classList.add("disabled")
                } else {
                    wordView.layer.classList.remove("disabled")
                }
            }
        )
    }
    //
    return view
}

exports.New_MnemonicConfirmation_SelectedWordsView = New_MnemonicConfirmation_SelectedWordsView

//
function _new_MnemonicConfirmation_WordView(word, wordUUID, context) {
    const view = new View({tag: "a"}, context)
    const layer = view.layer
    layer.className = "mnemonic-pill"
    layer.href = "#" // clickable by default
    layer.style.fontFamily = 'Native-Light, input, menlo, monospace'
    layer.style.fontSize = "10px"
    layer.style.letterSpacing = "0.8px"
    layer.style.fontWeight = "100"
    layer.ondragstart = function (e) {
        e.preventDefault();
        return false;
    } // disable link dragging
    layer.innerHTML = word.toUpperCase()
    { // for retrieval later
        layer.__component_mnemonicWord = word
        layer.__component_mnemonicWordUUID = wordUUID
    }
    return view
}

//
function New_MnemonicConfirmation_SelectableWordsView(
    mnemonicString,
    mnemonicConfirmation_selectedWordsView,
    context
) {
    //
    const view = new View({}, context)
    {
        const layer = view.layer
        layer.style.padding = `24px 24px`
        layer.style.width = `calc(100% - 48px)`
        layer.style.textAlign = "center"
        layer.style.marginTop = "10px"
    }
    const mnemonicWords = mnemonicString.split(" ")
    const alphabetized_necessary_mnemonicWords = mnemonicWords.slice(0, numberOfMnemonicWordsRequiredForVerification).sort()

    const wordsByWordUUID = {} // because words are not unique in a mnemonic
    const wordViews_byWordUUID = {}
    alphabetized_necessary_mnemonicWords.forEach(
        function (word, i) {
            const wordUUID = _new_UUID()
            wordsByWordUUID[wordUUID] = word
            //
            const wordView = _new_MnemonicConfirmation_WordView(word, wordUUID, context)
            wordViews_byWordUUID[wordUUID] = wordView
            //
            const wordView_layer = wordView.layer
            view.layer.appendChild(wordView_layer)
            //
            wordView_layer.addEventListener(
                "click",
                function (e) {
                    e.preventDefault()
                    if (mnemonicConfirmation_selectedWordsView.isEnabled == false) {
                        console.warn("Word selected but disabled.")
                        return false
                    }
                    const this_wordView_layer = this
                    const isSelectedClass = "mnemonic-pill--selectedPlaceholder"
                    if (this_wordView_layer.className === isSelectedClass) { // if it's already picked
                        return
                    }
                    this_wordView_layer.className = isSelectedClass // flip to selected type
                    this_wordView_layer.href = "" // no longer clickable
                    const word = this_wordView_layer.__component_mnemonicWord
                    if (!word || typeof word === 'undefined') {
                        throw "No word associated with clicked layer"
                    }
                    const wordUUID = this_wordView_layer.__component_mnemonicWordUUID
                    if (!wordUUID || typeof wordUUID === 'undefined') {
                        throw "No word ID associated with clicked layer"
                    }
                    mnemonicConfirmation_selectedWordsView.Component_SelectWordWithUUID(word, wordUUID)
                    //
                    return false
                }
            )
        }
    )
    // Component - Methods - Teardown - Imperatives
    view.TearDown = function () { // nothing to do (yet)
    }
    // Component - Methods - Runtime - Accessors
    view.Component_WordsFromUUIDs = function (ordered_selectedWordUUIDs) {
        const words = []
        ordered_selectedWordUUIDs.forEach(
            function (wordUUID, i) {
                const word = wordsByWordUUID[wordUUID]
                if (typeof word === 'undefined' || !word) {
                    throw "Word not found for UUID"
                    // return
                }
                words.push(word)
            }
        )
        return words
    }
    // Component - Methods - Runtime - Delegation
    view.Component_WordWithUUIDWasDeselected = function (wordUUID) {
        const wordView = wordViews_byWordUUID[wordUUID]
        const this_wordView_layer = wordView.layer
        this_wordView_layer.className = "mnemonic-pill" // flip back to selectable type
        this_wordView_layer.href = "#" // clickable again
    }
    return view
}

exports.New_MnemonicConfirmation_SelectableWordsView = New_MnemonicConfirmation_SelectableWordsView

//
function _new_UUID() {
    return uuidV1()
}
