'use strict'

const View = require('../../Views/View.web')
const emoji_set = require('../emoji_set')
const emoji_web = require('../emoji_web')
const EmojiButtonView_height = 40

class EmojiPickerPopoverContentView extends View {
  // Lifecycle - Init
  constructor (options, context) {
    super(options, context)
    //
    const self = this
    self.didPickEmoji_fn = options.didPickEmoji_fn || function (emoji) {}
    self.setup()
  }

  setup () {
    const self = this
    self.emojiButtonViews = []
    self.emojiButtonsViews_byEmoji = {}
    self.selected_emojiButtonView = null // initialize for later checks

    self.setup_views()
  }

  setup_views () {
    const self = this
    const layer = self.layer
    self.padding_top = 8
    self.padding_bottom = 7
    layer.style.position = 'absolute'
    layer.style.left = '40px' // left shadow
    layer.style.top = '31px' // top arrow/shadow; instead of 30 to leave a 1px space on top
    layer.style.boxSizing = 'border-box'
    layer.style.width = '265px'
    self.height = 175
    layer.style.height = self.height + 'px' // instead of 176 because we want to leave a 1px space on btm; and could use max-height but since we have so many emoji - that will never be needed
    layer.style.padding = `${self.padding_top}px 6px ${self.padding_bottom}px 6px` // btm is 1 lower because we already have 1px space
    layer.style.borderRadius = '4px'
    layer.style.overflowX = 'hidden'
    layer.style.overflowY = 'auto'
    layer.style.webkitOverflowScrolling = 'auto' // I would like to set this to "touch", but a strange rendering error occurs
    layer.classList.add('EmojiPickerPopoverContentView')
    //
    const emojis = emoji_set.Emojis
    const emojis_length = emojis.length
    for (let i = 0; i < emojis_length; i++) {
      const emoji = emojis[i]
      const emojiButtonView = self._new_emojiButtonView(emoji)
      self.emojiButtonsViews_byEmoji[emoji] = emojiButtonView
      // we handle selection later via _configureAsHavingSelectedEmoji(emoji)
      self.addSubview(emojiButtonView)
      self.emojiButtonViews.push(emojiButtonView)
    }
  }

  _new_emojiButtonView (emoji) {
    const self = this
    const view = new View({}, self.context)
    const layer = view.layer
    layer.style.position = 'relative' // so we can read offsetTop
    layer.style.display = 'inline-block'
    layer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
      self.context,
      emoji
    )
    layer.classList.add('EmojiButtonView')
    if (self.context.Emoji_renderWithNativeEmoji !== true) {
      layer.classList.add('withNonNativeEmoji')
    }
    layer.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        self.SelectEmoji(emoji)
        return false
      }
    )
    return view
  }

  // Lifecycle - Teardown
  TearDown () {
    self.emojiButtonViews = null // freeing
    self.emojiButtonsViews_byEmoji = null // free
    super.TearDown()
    //
    const self = this
  }

  // Interface - Runtime - Imperatives
  SetPreVisibleSelectedEmoji (emoji) {
    const self = this
    const andScroll = true
    self._configureAsHavingSelectedEmoji(emoji, andScroll)
    // note: no emit/yield
  }

  SelectEmoji (emoji) {
    const self = this
    const andScroll = false
    self._configureAsHavingSelectedEmoji(emoji, andScroll)
    // and emit/yield
    self.didPickEmoji_fn(emoji)
  }

  // Internal - Runtime - Imperatives
  _configureAsHavingSelectedEmoji (emoji, andScroll) {
    const self = this
    if (self.selected_emojiButtonView) {
      self.selected_emojiButtonView.layer.classList.remove('active')
    }
    const emojiButtonView = self.emojiButtonsViews_byEmoji[emoji]
    if (!emojiButtonView) {
      throw '!emojiButtonView'
    }
    self.value = emoji
    self.selected_emojiButtonView = emojiButtonView
    self.selected_emojiButtonView.layer.classList.add('active')
    if (andScroll) {
      self._scrollTo__selected_emojiButtonView()
    }
  }

  _scrollTo__selected_emojiButtonView () {
    const self = this
    if (!self.selected_emojiButtonView) {
      self.layer.scrollTop = 0
    }
    const offsetTop = self.selected_emojiButtonView.layer.offsetTop
    const naive__scrollTop = offsetTop -
								self.height / 2 + // to 'middle'
								EmojiButtonView_height / 2
    // ^ this -h/2 etc ordinarily would be irresponsible w/o bounds checking/conditions but
    // the DOM will handle chopping out of bounds values for us when we set the scroll
    self.layer.scrollTop = naive__scrollTop
  }
}
module.exports = EmojiPickerPopoverContentView
