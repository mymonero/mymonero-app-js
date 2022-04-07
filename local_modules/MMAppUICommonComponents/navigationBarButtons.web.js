'use strict'

const BarButtonBaseView = require('../StackNavigation/Views/BarButtonBaseView.web')

function _New_ButtonBase_View (context, optl_didConfigureInteractivity_fn) {
  const view = new BarButtonBaseView({
    didConfigureInteractivity_fn: function (thisView) {
      if (typeof optl_didConfigureInteractivity_fn !== 'undefined' && optl_didConfigureInteractivity_fn) {
        optl_didConfigureInteractivity_fn(thisView)
      }
    }
  }, context)
  const layer = view.layer
  layer.classList.add('base-button')
  layer.classList.add('hoverable-cell')
  view.SetEnabled(true)
  return view
}

exports.New_ButtonBase_View = _New_ButtonBase_View

//
function New_GreyButtonView (context) {
  const view = _New_ButtonBase_View(context, function (thisView) {
  })
  const layer = view.layer
  layer.classList.add('utility')
  layer.classList.add('grey-menu-button')
  layer.classList.add('disableable') // allowing this to be auto-styled as disabled
  return view
}

exports.New_GreyButtonView = New_GreyButtonView

function New_BlueButtonView (context) {
  const view = _New_ButtonBase_View(
    context,
    function (thisView) { // config from interactivity
      const layer = thisView.layer
      if (thisView.isEnabled) {
        layer.classList.add('navigation-blue-button-enabled')
      } else {
        layer.classList.add('navigation-blue-button-disabled')
      }
    }
  )
  const layer = view.layer
  layer.classList.add('action')

  layer.style.webkitFontSmoothing = 'subpixel-antialiased'
  layer.style.fontSize = '12px'
  layer.style.letterSpacing = '0.5px'

  return view
}

exports.New_BlueButtonView = New_BlueButtonView

function New_LeftSide_BackButtonView (context) {
  const view = New_GreyButtonView(context)
  const layer = view.layer
  layer.classList.add('left-back-button')
  return view
}

exports.New_LeftSide_BackButtonView = New_LeftSide_BackButtonView

function New_RightSide_AddButtonView (context) {
  const view = New_BlueButtonView(context)
  const layer = view.layer
  layer.classList.add('right-add-button')
  return view
}

exports.New_RightSide_AddButtonView = New_RightSide_AddButtonView

function New_LeftSide_CancelButtonView (context, title = 'Cancel') {
  const view = New_GreyButtonView(context)
  const layer = view.layer
  layer.innerHTML = title
  layer.classList.add('left-cancel-button')
  return view
}

exports.New_LeftSide_CancelButtonView = New_LeftSide_CancelButtonView

function New_RightSide_SaveButtonView (context) {
  const view = New_BlueButtonView(context)
  const layer = view.layer
  layer.innerHTML = 'Save'
  layer.classList.add('right-save-button')
  return view
}

exports.New_RightSide_SaveButtonView = New_RightSide_SaveButtonView

function New_RightSide_EditButtonView (context) {
  const view = New_GreyButtonView(context)
  const layer = view.layer
  layer.innerHTML = 'Edit'
  layer.classList.add('right-edit-button')
  return view
}

exports.New_RightSide_EditButtonView = New_RightSide_EditButtonView

function New_RightSide_ValueDisplayLabelButtonView (context) {
  const view = _New_ButtonBase_View(context)
  const layer = view.layer
  { // setup/style
    layer.href = '' // to make it non-clickable
    layer.classList.add('right-value-button')
    if (typeof process !== 'undefined' && process.platform === 'linux') {
      layer.style.fontWeight = '700' // surprisingly does not render well w/o this… not linux thing but font size thing. would be nice to know which font it uses and toggle accordingly. platform is best guess for now
    } else {
      layer.style.fontWeight = '300'
    }
  }
  return view
}

exports.New_RightSide_ValueDisplayLabelButtonView = New_RightSide_ValueDisplayLabelButtonView
