"use strict"

const emojione = require('./Vendor/emojione.min')
// Load emojis
var emojiDescriptionsByKey = require("./Vendor/emoji.json")
const emojiCategories =
[ // TODO/FIXME: source this from emojione
	{"key":"people","label":"Smileys & People"},
	{"key":"nature","label":"Animals & Nature"},
	{"key":"food","label":"Food & Drink"},
	{"key":"activity","label":"Activity"},
	{"key":"travel","label":"Travel & Places"},
	{"key":"objects","label":"Objects"},
	{"key":"symbols","label":"Symbols"},
	{"key":"flags","label":"Flags"}
]
const numberOf_emojiCategories = emojiCategories.length
//
const emojiCharsByCategory = {}
const orderByEmojiChar = {}
const keys = Object.keys(emojiDescriptionsByKey)
const numberOf_keys = keys.length
for (let i = 0 ; i < numberOf_keys ; i++) {
	const key = keys[i]
	const emoji_description = emojiDescriptionsByKey[key]
	const shortname = emoji_description.shortname
	const unicode = emoji_description.code_points.output // "the recommended code point to use for conversion to native unicode"
	const category_key = emoji_description.category
	var nativeUnicodeEmoji = unicodeCodePointOrPairToChar(unicode) // TODO/FIXME: move call to emojione.unicodeCodePointOrPairToChar()
	orderByEmojiChar[nativeUnicodeEmoji] = emoji_description.order
	//
	if (typeof emojiCharsByCategory[category_key] == 'undefined') {
		emojiCharsByCategory[category_key] = []
	}
	emojiCharsByCategory[category_key].push(nativeUnicodeEmoji)
}
// sort
for (let i = 0 ; i < numberOf_emojiCategories ; i++) {
	const category_key = emojiCategories[i].key
	const category_emojiChars = emojiCharsByCategory[category_key]
	emojiCharsByCategory[category_key] = category_emojiChars.sort(
		function(a, b)
		{
			return orderByEmojiChar[a] - orderByEmojiChar[b]
		}
	)
}
//
const all_emojiChars = []
for (let i = 0 ; i < numberOf_emojiCategories ; i++) {
	const category_key = emojiCategories[i].key
	const category_emojiChars = emojiCharsByCategory[category_key]
	const numberOf_category_emojiChars = category_emojiChars.length
	for (let j = 0 ; j < numberOf_category_emojiChars ; j++) {
		const emojiChar = category_emojiChars[j]
		all_emojiChars.push(emojiChar)
	}
}
//
exports.Emojis = all_emojiChars
exports.EmojiCategories = emojiCategories;
//
function unicodeCodePointOrPairToChar(unicode)
{
	if (unicode.indexOf("-") > -1) {
		var parts = [];
		var s = unicode.split('-');
		for (var i = 0; i < s.length; i++) {
			var part = parseInt(s[i], 16);
			if (part >= 0x10000 && part <= 0x10FFFF) {
				var hi = Math.floor((part - 0x10000) / 0x400) + 0xD800;
				var lo = ((part - 0x10000) % 0x400) + 0xDC00;
				part = (String.fromCharCode(hi) + String.fromCharCode(lo));
			} else {
				part = String.fromCharCode(part);
			}
			parts.push(part);
		}
		//
		return parts.join('');
	}
	var s = parseInt(unicode, 16);
	if (s >= 0x10000 && s <= 0x10FFFF) {
		var hi = Math.floor((s - 0x10000) / 0x400) + 0xD800;
		var lo = ((s - 0x10000) % 0x400) + 0xDC00;
		//
		return (String.fromCharCode(hi) + String.fromCharCode(lo));
	}
	return String.fromCharCode(s);
};

