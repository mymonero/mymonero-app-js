"use strict"

const Emojis = require('./emoji_set').Emojis
const numberOf_Emojis = Emojis.length

function EmojiWhichIsNotAlreadyInUse(inUseEmojis)
{
	inUseEmojis = inUseEmojis || []
	for (let i = 0 ; i < numberOf_Emojis ; i++) { // start looking for a usable emoji
		const this_Emoji = Emojis[i]
		if (inUseEmojis.indexOf(this_Emoji) === -1) { // if not in use
			return this_Emoji
		}
	}
	console.warn("⚠️  Ran out of emojis to select in EmojiWhichIsNotAlreadyInUse")
	const indexOf_random_emoji = Math.floor(Math.random() * numberOf_Emojis)
	var random_emoji = Emojis[indexOf_random_emoji]
	//
	return random_emoji
}
exports.EmojiWhichIsNotAlreadyInUse = EmojiWhichIsNotAlreadyInUse