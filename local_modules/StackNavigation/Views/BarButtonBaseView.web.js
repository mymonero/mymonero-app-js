'use strict'

const View = require('../../Views/View.web')

class BarButtonBaseView extends View {
  constructor (options, context) {
    if (typeof options.tag !== 'undefined') {
      options.tag = 'a' // it's a button
    }
    super(options, context)
    //
    const self = this
    self.didConfigureInteractivity_fn = self.options.didConfigureInteractivity_fn || function (thisView) {}
    self.setup()
  }

  setup () {
    const self = this
    const layer = self.layer
    layer.style.cursor = 'default' // to prevent ibar
    layer.ondragstart = function (e) { e.preventDefault(); return false } // disable link dragging
  }

  //
  //
  // Runtime - Imperatives
  //
  SetEnabled (isEnabled) {
    const self = this
    self.isEnabled = isEnabled
    const layer = self.layer
    if (self.isEnabled) {
      layer.style.href = '#'
      layer.classList.remove('disabled')
      layer.classList.remove('navigation-blue-button-disabled')
    } else {
      layer.style.href = ''
      layer.classList.add('disabled')
      layer.classList.add('navigation-blue-button-disabled')
    }
    self.didConfigureInteractivity_fn(self)
  }
}
module.exports = BarButtonBaseView
