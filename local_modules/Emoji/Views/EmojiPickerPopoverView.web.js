"use strict"

const View = require('../../Views/View.web')
const EmojiPickerPopoverContentView = require('./EmojiPickerPopoverContentView.web')

class EmojiPickerPopoverView extends View
{
	// Lifecycle - Init
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.didPickEmoji_fn = options.didPickEmoji_fn || function(emoji) {}
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		const bg_w = self.Width()
		const bg_h = self.Height()
		{
			const layer = self.layer
			layer.style.position = "absolute"
			layer.style.width = bg_w+"px"
			layer.style.height = bg_h+"px"
			layer.style.boxSizing = "border-box"
			// using a whole image instead of css for this due to more complex styling
			layer.style.backgroundImage = "url(../../Emoji/Resources/popoverBG@3x.png)"
			layer.style.backgroundPosition = "0px 0px"
			layer.style.backgroundRepeat = "no-repeat"
			layer.style.backgroundSize = `${bg_w}px ${bg_h}px`
			layer.style.pointerEvents = "none" // otherwise the transparent part of the bg img interferes with clicking on the control, itself
			layer.style.zIndex = "10000" 
		}
		{
			const view = new EmojiPickerPopoverContentView({
				didPickEmoji_fn: function(emoji)
				{
					self.value = emoji
					self.didPickEmoji_fn(emoji)
				}
			}, self.context)
			view.layer.style.pointerEvents = "all" // must offset self.layer.style.pointerEvents
			self.emojiPickerPopoverContentView = view
			self.addSubview(view)
		}
	}
	// Lifecycle - Teardown
	TearDown()
	{
		super.TearDown()
		//
		const self = this
	}
	// Accessors
	Width()
	{
		return 341
	}
	Height()
	{
		return 264
	}
	// Runtime - Imperatives
	SetPreVisibleSelectedEmoji(emoji)
	{
		const self = this
		self.emojiPickerPopoverContentView.SetPreVisibleSelectedEmoji(emoji)
	}
}
module.exports = EmojiPickerPopoverView