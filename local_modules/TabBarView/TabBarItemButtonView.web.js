"use strict"

const View = require('../Views/View.web')

class TabBarItemButtonView extends View
{
	constructor(options, context)
	{
		console.log(options);
		options.tag = "a"
		//
		super(options, context)
		const self = this
		self.isHorizontalBar = typeof options.isHorizontalBar !== 'undefined' ? options.isHorizontalBar : true
		self.tabBarView_thickness = options.tabBarView_thickness
		//
		self.layer_baseStyleTemplate = options.layer_baseStyleTemplate || {}
		self.icon_baseStyleTemplate = options.icon_baseStyleTemplate || {}
		self.icon_selected_baseStyleTemplate = options.icon_selected_baseStyleTemplate || self.icon_baseStyleTemplate // fall back to non-selected
		self.numberOf_tabs = options.numberOf_tabs
		if (!self.numberOf_tabs) {
			throw `${self.constructor.name} requires options.numberOf_tabs`
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{ // state defaults
			self.isEnabled = true
		}
		self.setup__preloadStateImages()
		self.setup_views()
		self.Deselect() // also sets selected state
	}
	setup_views()
	{
		const self = this
		console.log(self);
		console.log(self.layer_baseStyleTemplate);
		console.log(self.icon_baseStyleTemplate);
		{
			const layer = self.layer
			layer.style.display = "inline-block"
			layer.style.position = "relative"
			layer.style.webkitAppRegion = "no-drag" // make clickable
			layer.style.webkitTapHighlightColor = "rgba(0,0,0,0)" // disable highlight under Cordova/MobileSafari
			const stackedThickness = 56
			if (self.isHorizontalBar) {
				layer.style.width = `${100/self.numberOf_tabs}%`
				layer.style.height = `${self.tabBarView_thickness}px`
			} else {
				layer.style.width = `${self.tabBarView_thickness}px`
				layer.style.height = `${stackedThickness}px`
			}
			self.__applyStylesToLayer(self.layer_baseStyleTemplate, self.layer)
		}
		{ // icon
			console.log(self.TabBarItem_icon_customStyle)
			const layer = document.createElement('div')
			layer.style.webkitAppRegion = 'no-drag' // make clickable
			layer.style.width = '100%'
			layer.style.height = '100%'
			layer.style.border = 'none'
			self.iconImageLayer = layer
			self.layer.appendChild(self.iconImageLayer)

			//self.iconImageLayer.classList.add(self.icon_baseStyleTemplate)
			self.iconImageLayer.id = self.icon_baseStyleTemplate;
			if (self.icon_baseStyleTemplate.backgroundImage == "url(../../../assets/img/XMRtoBTCInactive.svg)") {
				console.log("welp");
				self.iconImageLayer.id = "tabButton-exchange"
				self.iconImageLayer.classList.add("tabButton-exchange");
			}
		}
		{ // observation
			self.layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					if (self.isEnabled !== false) {
						self.emit(self.EventName_clicked(), self)
					}
					return false
				}
			)
		}
	}
	setup__preloadStateImages()
	{
		const self = this
		function _new_lookup_imageURLsForAllStates()
		{
			const urls = []
			function _backgroundImageURLFrom_baseStyleTemplate(baseStyleTemplate)
			{
				const value__backgroundImage = baseStyleTemplate.backgroundImage
				if (!value__backgroundImage) {
					throw "!value__backgroundImage"
				}
				var str = value__backgroundImage
				str = str.replace(/^url\(/, '')
				str = str.replace(/\)$/, '')
				return str
			}
			const base__url__orNil = _backgroundImageURLFrom_baseStyleTemplate(self.icon_selected_baseStyleTemplate)
			const selected__url__orNil = _backgroundImageURLFrom_baseStyleTemplate(self.icon_baseStyleTemplate)
			if (base__url__orNil) {
				urls.push(base__url__orNil)
			}
			if (selected__url__orNil) {
				urls.push(selected__url__orNil)
			}
			return urls
		}
		self.preloadedImages = []
		const imageURLs = _new_lookup_imageURLsForAllStates()
		for (let i = 0; i < imageURLs.length; i++) {
			const imageURL = imageURLs[i]
			const image = new Image()
			image.src = imageURL
			self.preloadedImages.push(image)
		}
	}
	// Runtime - Accessors - Events
	EventName_clicked()
	{
		return "EventName_clicked"
	}
	// Runtime - Accessors - State
	IsSelected()
	{
		const self = this
		return self.isSelected === true
	}
	IsEnabled()
	{
		const self = this
		return self.isEnabled === true
	}
	// Runtime - Accessors - 

	// Runtime - Imperatives - UI config - Shared
	__applyStylesToLayer(styles, layer)
	{
		const styles_keys = Object.keys(styles)
		const numberOf_styles_keys = styles_keys.length
		for (let i = 0 ; i < numberOf_styles_keys ; i++) {
			const key = styles_keys[i]
			const value = styles[key]
			layer.style[key] = value
		}
	}
	// Runtime - Imperatives - Selection
	Select()
	{
		const self = this
		if (self.isEnabled == false) {
			return
		}
		self.isSelected = true
		self.__applyStylesToLayer(self.icon_selected_baseStyleTemplate, self.iconImageLayer)
	}
	Deselect()
	{
		const self = this
		self.isSelected = false
		self.__applyStylesToLayer(self.icon_baseStyleTemplate, self.iconImageLayer)
	}	
	// Runtime - Imperatives - Selection
	Enable()
	{
		const self = this
		self.isEnabled = true
		self.iconImageLayer.style.opacity = "1.0"
	}
	Disable()
	{
		const self = this
		self.isEnabled = false
		self.iconImageLayer.style.opacity = "0.3"
	}
}
module.exports = TabBarItemButtonView
