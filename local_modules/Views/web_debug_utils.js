"use strict"

function _borderLayer(layer)
{
	layer.style.border = `1px solid ${RandomColorHexString()}`
}
exports.DEBUG_BorderLayer = _borderLayer
//
function DEBUG_BorderSubviews(ofView)
{
	const self = ofView
	self.subviews.forEach(
		function(subview, i)
		{
			_borderLayer(subview.layer)
			DEBUG_BorderSubviews(subview) // recursive traversal
		}
	)
}
exports.DEBUG_BorderSubviews = DEBUG_BorderSubviews
//
function DEBUG_BorderChildLayers(ofLayer)
{
	const children = ofLayer.children
	const keysOf_children = Object.keys(children)
	keysOf_children.forEach(
		function(key, i)
		{
			const childLayer = children[key]
			//
			_borderLayer(childLayer)
			DEBUG_BorderChildLayers(childLayer)
		}
	)
}
exports.DEBUG_BorderChildLayers = DEBUG_BorderChildLayers
//
function RandomColorHexString()
{
	return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}
exports.RandomColorHexString = RandomColorHexString	