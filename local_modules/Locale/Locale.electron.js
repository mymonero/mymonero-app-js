'use strict'

class Locale {
  constructor (options, context) {
    const self = this
    self.options = options
    self.context = context
  }

  Locale (fn) {
    const self = this
    const currentLocale = self.context.app.getLocale()
    fn(null, currentLocale)
  }
}
module.exports = Locale
