'use strict'

const emojione = require('./Vendor/emojione.min')
emojione.imageType = 'png' // png instead of svg as svg appear too slow to display en-masse
emojione.sprites = true

const emoji_set = require('./emoji_set')

const cached_spritesheetImages = []
function PreLoadAndSetUpEmojiOne (context) { // ^ be sure to call this in order to inject the stylesheets
  // preload sprites to prevent delay
  if (context.Emoji_renderWithNativeEmoji !== true) {
    const categories = emoji_set.EmojiCategories
    categories.forEach(
      function (
        categoryDescription,
        i
      ) {
        const key = categoryDescription.key
        const pathBase = '../../' +
					'Emoji/Vendor/emojione-sprite-32-' +
					key
        //
        const image = new Image()
        image.src = pathBase + '.png'
        cached_spritesheetImages.push(image)
        //
        const image_2x = new Image()
        image_2x.src = pathBase + '@2x.png'
        cached_spritesheetImages.push(image_2x)
      }
    )
  }
}
exports.PreLoadAndSetUpEmojiOne = PreLoadAndSetUpEmojiOne
//
//
// Interface - Accessors - Transforms
//
function NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText (context, nativeEmojiText) {
  if (context.Emoji_renderWithNativeEmoji !== true) {
    return nativeEmojiTextToImageBackedEmojiText(nativeEmojiText)
  }
  return nativeEmojiText
}
exports.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText =
	NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText
function nativeEmojiTextToImageBackedEmojiText (nativeEmojiText) {
  if (typeof nativeEmojiText !== 'string') { // to protect against numbers and such
    nativeEmojiText = '' + nativeEmojiText
  }
  const text = emojione.unicodeToImage(nativeEmojiText)
  //
  return text
}
