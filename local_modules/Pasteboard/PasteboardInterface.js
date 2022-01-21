'use strict'

const _contentTypes =
{
  Text: 'text', // the default
  HTML: 'html'
}

class Pasteboard {
  constructor (options, context) {
    const self = this
    {
      self.options = options
      self.context = context
    }
  }

  //
  // Accessors
  CopyContentTypes () {
    return _contentTypes
  }

  IsHTMLCopyingSupported () {
    const self = this
    const _cmd = 'IsHTMLCopyingSupported()'
    throw `You must override and implement ${_cmd} in ${self.constructor.name}`
  }

  //
  // Imperatives
  CopyString (string, contentType_orText) {
    const self = this
    const _cmd = 'CopyString(string, contentType_orText)'
    throw `You must override and implement ${_cmd} in ${self.constructor.name}`
  }

  CopyValuesByType (valuesByType) {
    const self = this
    const _cmd = 'CopyValuesByType(valuesByType)'
    throw `You must override and implement ${_cmd} in ${self.constructor.name}`
  }
}
module.exports = Pasteboard
