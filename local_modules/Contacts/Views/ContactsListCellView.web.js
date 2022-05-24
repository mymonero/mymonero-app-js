'use strict'

const ListCellView = require('../../Lists/Views/ListCellView.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')

const emoji_web = require('../../Emoji/emoji_web')

class ContactsListCellView extends ListCellView {
  setup_views () {
    const self = this
    super.setup_views()
    self.layer.classList.add('ContactsListCellView')
    self.layer.style.position = 'relative'
    self.layer.style.padding = '19px 0 15px 0'
    { // hover effects/classes
      self.layer.classList.add('hoverable-cell')
      self.layer.classList.add('utility')
    }
    // the emoji layer is deprecated in favour of Yats
    // self.__setup_emojiLayer()
    self.__setup_nameLayer()
    self.__setup_addressLayer()
    self.layer.appendChild(commonComponents_tables.New_tableCell_accessoryChevronLayer(self.context))
    self.__setup_cellSeparatorLayer()
  }

  __setup_nameLayer () {
    const self = this
    const layer = document.createElement('div')
    layer.style.position = 'relative'
    layer.style.margin = '0 66px 4px 8px'
    layer.style.height = 'auto'
    layer.style.fontSize = '13px'
    layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    layer.style.fontWeight = '400'
    layer.style.wordBreak = 'break-word'
    layer.style.whiteSpace = 'nowrap'
    layer.style.overflow = 'hidden'
    layer.style.textOverflow = 'ellipsis'
    layer.style.color = '#fcfbfc'
    layer.style.cursor = 'default'
    self.nameLayer = layer
    self.layer.appendChild(layer)
  }

  __setup_addressLayer () {
    const self = this
    const layer = document.createElement('div')
    layer.classList.add('withNativeEmoji')
    layer.style.position = 'relative'
    layer.style.margin = '0 66px 4px 8px'
    layer.style.fontSize = '13px'
    layer.style.fontFamily = 'Native-Light, input, menlo, monospace'
    layer.style.fontWeight = '100'
    layer.style.height = '20px'
    layer.style.color = '#9e9c9e'
    layer.style.whiteSpace = 'nowrap'
    layer.style.overflow = 'hidden'
    layer.style.textOverflow = 'ellipsis'
    layer.style.cursor = 'default'
    self.addressLayer = layer
    self.layer.appendChild(layer)
  }

  __setup_cellSeparatorLayer () {
    const self = this
    const layer = document.createElement('div')
    layer.style.background = '#413e40'
    layer.style.position = 'absolute'
    layer.style.bottom = '-0.5px' // instead of 0… to make sure hover effects look nicer (but it might not do much in the end)
    layer.style.height = '1px'
    layer.style.width = 'calc(100% - 50px)'
    layer.style.left = '50px'
    layer.style.visibility = 'visible' // to be configured
    self.cellSeparatorLayer = layer
    self.layer.appendChild(layer)
  }

  overridable_startObserving_record () {
    const self = this
    super.overridable_startObserving_record()
    //
    if (typeof self.record === 'undefined' || self.contact === null) {
      throw 'self.record undefined in start observing'
    }
    // here, we're going to store a bunch of functions as instance properties
    // because if we need to stopObserving we need to have access to the listener fns
    const emitter = self.record
    self.contact_EventName_contactInfoUpdated_listenerFunction = function () {
      self.overridable_configureUIWithRecord()
    }
    emitter.on(
      emitter.EventName_contactInfoUpdated(),
      self.contact_EventName_contactInfoUpdated_listenerFunction
    )
  }

  overridable_stopObserving_record () {
    const self = this
    super.overridable_stopObserving_record()
    //
    if (typeof self.record === 'undefined' || !self.record) {
      return
    }
    const emitter = self.record
    function doesListenerFunctionExist (fn) {
      if (typeof fn !== 'undefined' && fn !== null) {
        return true
      }
      return false
    }
    if (doesListenerFunctionExist(self.contact_EventName_contactInfoUpdated_listenerFunction) === true) {
      emitter.removeListener(
        emitter.EventName_contactInfoUpdated(),
        self.contact_EventName_contactInfoUpdated_listenerFunction
      )
    }
  }

  overridable_configureUIWithRecord () {
    super.overridable_configureUIWithRecord()
    //
    const self = this
    if (self.isAtEnd == true) {
      self.cellSeparatorLayer.style.visibility = 'hidden'
    } else {
      self.cellSeparatorLayer.style.visibility = 'visible'
    }
    if (typeof self.record === 'undefined' || !self.record) {
      self.nameLayer.innerHTML = ''
      self.addressLayer.innerHTML = ''
      return
    }
    if (self.record.didFailToInitialize_flag === true || self.record.didFailToBoot_flag === true) { // unlikely, but possible
      self.emojiLayer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
        self.context,
        '❌'
      )
      self.nameLayer.innerHTML = 'Error: Please contact support.'
      self.addressLayer.innerHTML = self.record.didFailToBoot_errOrNil ? ' ' + self.record.didFailToBoot_errOrNil : ''
      return
    }
    self.nameLayer.innerHTML = self.record.fullname
    self.addressLayer.innerHTML = self.record.address
    // self.DEBUG_BorderAllLayers()
  }
}
module.exports = ContactsListCellView
