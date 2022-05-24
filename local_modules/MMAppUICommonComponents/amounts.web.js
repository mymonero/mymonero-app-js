'use strict'

const commonComponents_tables = require('./tables.web')
const commonComponents_forms = require('./forms.web')
const commonComponents_ccySelect = require('./ccySelect.web')

const monero_config = require('@mymonero/mymonero-monero-config')

function New_AmountInputFieldPKG (
  context,
  isOptional,
  wantsMAXbutton,
  optl__enterPressed_fn
) { // -> {} // Experimental 'pkg' style return… maybe refactor into View later
  const enterPressed_fn = optl__enterPressed_fn || function () {}
  wantsMAXbutton = wantsMAXbutton == true // nil -> false
  //
  const amountInput_baseW = 80
  const ccySelect_disclosureArrow_w = 8
  const ccySelect_disclosureArrow_margin_right = 4 + 2
  const ccySelect_label_margin_left = 6
  const selectLayer_w = ccySelect_label_margin_left + 32/* text */ + 4 + ccySelect_disclosureArrow_w + ccySelect_disclosureArrow_margin_right
  //
  const div = commonComponents_forms.New_fieldContainerLayer()
  div.style.position = 'relative' // to have layout reset origin of any position=absolute items
  div.style.left = '0'
  div.style.top = '0'
  const container_padding_h = 22
  div.style.padding = `7px ${container_padding_h}px 0 ${container_padding_h}px`
  //
  const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('AMOUNT', context)
  labelLayer.classList.add('isNumericInputElement')
  div.appendChild(labelLayer)
  // ^ block
  if (isOptional == true) {
    labelLayer.style.float = 'left'
    //
    const accessoryLabel = commonComponents_forms.New_fieldTitle_rightSide_accessoryLayer('optional', context)
    div.appendChild(accessoryLabel)
    //
    div.appendChild(commonComponents_tables.New_clearingBreakLayer())
  }
  //
  const valueLayer_amountPlaceholderText = '00.00'
  const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(context, {
    placeholderText: valueLayer_amountPlaceholderText
  })
  // not going to set `pattern` attribute because it can't support periods
  // not going to set type="number" because it inserts commas, etc
  valueLayer.style.textAlign = 'right'
  valueLayer.float = 'left' // because we want it to be on the same line as the "XMR" label
  valueLayer.style.display = 'inline-block' // so we can have the XMR label on the right
  valueLayer.style.width = amountInput_baseW + 'px'
  const paddingRight = valueLayer.Component_default_padding_h() + selectLayer_w
  valueLayer.style.paddingRight = paddingRight + 'px' // make room for the currency select
  valueLayer.addEventListener('keyup', function (e) {
    const keyCode = e.which || e.keyCode
    const code = e.code
    if (code == 'Enter' || code == 'Return' || keyCode === 13) {
      enterPressed_fn()
      return
    }
    let mutable_candidate_valueLayer_value = valueLayer.value
    { // positive digits only
      mutable_candidate_valueLayer_value = mutable_candidate_valueLayer_value.replace(/[^0-9\.]/g, '')
    }
    { // only one period max
      const components = mutable_candidate_valueLayer_value.split('.')
      if (components.length > 2) {
        // truncate
        mutable_candidate_valueLayer_value = components[0] + '.' + components[1]
      }
    }
    { // disallow input which is toooo long. some values are out of spec
      const longestKnown_coinUnitPlaces = monero_config.coinUnitPlaces
      const maxText_length = longestKnown_coinUnitPlaces + 2 + 1
      // ^-- I figure 14 numerals is a pretty good upper bound guess for inputs no matter what the currency… I might be wrong…
      if (mutable_candidate_valueLayer_value.length > maxText_length) {
        mutable_candidate_valueLayer_value = mutable_candidate_valueLayer_value.substr(0, maxText_length)
      }
    }
    //
    const final_value = mutable_candidate_valueLayer_value
    if (valueLayer.value != final_value) {
      valueLayer.value = final_value // this seems janky but it seems like the only sane way to support copy-paste, other keys, etc
    }
  })
  div.appendChild(valueLayer)
  valueLayer.Component_ScrollIntoViewInFormContainerParent = function () { // this could also be called on window resize
    const this_layer = this
    commonComponents_forms._shared_scrollConformingElementIntoView(this_layer)
  }
  if (context.CommonComponents_Forms_scrollToInputOnFocus == true) {
    valueLayer.addEventListener(
      'focus',
      function () {
        valueLayer.Component_ScrollIntoViewInFormContainerParent()
      }
    )
  }
  //
  // Currency picker
  // TODO: move these into class + css rules
  const selectLayer_left = container_padding_h + amountInput_baseW + 2 * valueLayer.Component_default_padding_h() + 1.5
  const selectLayer_h = valueLayer.Component_default_h() + 0.5
  const ccySelect_disclosureArrow_h = 13
  const ccySelectLayer = commonComponents_ccySelect.new_selectLayer()
  let ccySelect_disclosureArrow_layer // will be set
  {
    ccySelectLayer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    ccySelectLayer.style.webkitFontSmoothing = 'subpixel-antialiased'
    ccySelectLayer.style.fontSize = '11px'
    ccySelectLayer.style.fontWeight = '400' // semibold desired
    ccySelectLayer.style.letterSpacing = '0.5px'
    //
    // TODO: move these into class + css rules
    //
    const selectLayer = ccySelectLayer
    let textIndent_px = (4 + ccySelect_label_margin_left)
    if (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      textIndent_px -= 8
    }
    selectLayer.style.textIndent = textIndent_px + 'px' // left align text not desired bc of disclosure arrow
    // selectLayer.style.outline = "none" // actually going to leave outline enabled for now for accessibility purposes
    selectLayer.style.color = '#DFDEDF'
    selectLayer.style.backgroundColor = 'rgba(80, 74, 80, 0.55)'
    selectLayer.style.position = 'absolute'
    selectLayer.style.left = selectLayer_left + 'px' // b/c it does not include the currency select padding and is therefore the origin.x of the select element
    selectLayer.Component_setTop = function (optl__to_topNumber) { // IMPORTANT: this must be called on setup
      //
      const to_topNumber =
				typeof optl__to_topNumber !== 'undefined' && optl__to_topNumber != null
				  ? optl__to_topNumber
				  : 24
      selectLayer.Component_topNumber = to_topNumber
      //
      ccySelectLayer.style.top = to_topNumber + 'px'
      ccySelect_disclosureArrow_layer.style.top = Math.floor(
        to_topNumber + (selectLayer_h - ccySelect_disclosureArrow_h) / 2 + 1
      ) + 'px'
    }
    selectLayer.style.width = selectLayer_w + 'px'
    selectLayer.style.height = selectLayer_h + 'px'
    selectLayer.style.border = '0'
    selectLayer.style.padding = '0'
    selectLayer.style.borderRadius = '0'
    selectLayer.style.webkitAppearance = 'none' // apparently necessary in order to activate the following style.border…Radius
    selectLayer.style.MozAppearance = 'none'
    selectLayer.style.msAppearance = 'none'
    const cornerRadius = 4
    selectLayer.style.borderTopRightRadius = cornerRadius + 'px'
    selectLayer.style.borderBottomRightRadius = cornerRadius + 'px'
    selectLayer.style.borderBottomLeftRadius = '0px'
    selectLayer.style.borderTopLeftRadius = '0px'
  }
  div.appendChild(ccySelectLayer)
  {
    const layer = document.createElement('div')
    ccySelect_disclosureArrow_layer = layer
    layer.style.pointerEvents = 'none' // definitely do not want to prevent or intercept pointer events
    layer.style.border = 'none'
    layer.style.position = 'absolute'
    const w = ccySelect_disclosureArrow_w
    const h = ccySelect_disclosureArrow_h
    layer.style.width = w + 'px'
    layer.style.height = h + 'px'
    layer.style.left = (selectLayer_left + selectLayer_w - ccySelect_disclosureArrow_margin_right - w) + 'px'
    layer.style.top =
		layer.style.zIndex = '9' // below .options_containerView
    layer.style.backgroundImage = 'url(../../../assets/img/smallSelect_disclosureArrow@3x.png)'
    layer.style.backgroundRepeat = 'no-repeat'
    layer.style.backgroundPosition = 'center'
    layer.style.backgroundSize = w + 'px ' + h + 'px'
    div.appendChild(layer)
  }
  ccySelectLayer.Component_setTop() // IMPORTANT: this must be called on setup
  //
  //
  const effectiveAmountLabelLayer = commonComponents_forms.New_fieldTitle_labelLayer(
    '',
    context
  )
  effectiveAmountLabelLayer.style.display = 'inline-block'
  effectiveAmountLabelLayer.style.margin = '0 0 0 8px'
  effectiveAmountLabelLayer.style.verticalAlign = 'middle'
  effectiveAmountLabelLayer.style.color = '#8D8B8D'
  effectiveAmountLabelLayer.style.fontFamily = 'Native-Regular, input, menlo, monospace'
  effectiveAmountLabelLayer.style.fontSize = '12px'
  effectiveAmountLabelLayer.style.fontWeight = 'normal'
  div.appendChild(effectiveAmountLabelLayer)
  //
  let max_buttonView
  if (wantsMAXbutton == true) {
    max_buttonView = commonComponents_tables.New_clickableLinkButtonView(
      'MAX',
      context,
      function () {
        max_buttonView.setToggledOn(true)
      }
    )
    max_buttonView.isMAXToggledOn = false // state
    max_buttonView.layer.style.margin = '0 0 0 12px'
    max_buttonView.layer.style.verticalAlign = 'middle'
    max_buttonView.setToggledOn = function (isToggledOn) {
      max_buttonView.isMAXToggledOn = isToggledOn
      //
      // previously, hide here if toggled on, but that was changed
      //
      const fn = max_buttonView.didUpdateMAXButtonToggleState_fn
      if (fn && typeof fn !== 'undefined') {
        fn()
      }
    }
    max_buttonView.setHidden = function (isHidden) {
      max_buttonView.layer.style.display = isHidden ? 'none' : 'inline-block'
      // This function must never call setToggledOn
    }
    max_buttonView.visibilityAndSelectedState_setNeedsUpdate = function () {
      const raw_amount_String = valueLayer.value
      // NOTE: in this function we must make sure to always call self.max_buttonView.setHidden so initial config happens
      if (typeof raw_amount_String === 'undefined' || !raw_amount_String) {
        max_buttonView.setHidden(false) // NOTE: this will only actually show the btn if we're not in MAX mode
        if (valueLayer === document.activeElement) { // must disable this mode in case it was enabled
          max_buttonView.setToggledOn(false)
        } else {
          max_buttonView.setToggledOn(max_buttonView.isMAXToggledOn) // to update the UI again , not to change the state
        }
      } else {
        max_buttonView.setHidden(true) // has an amount, shouldn't show MAX btn
        max_buttonView.setToggledOn(false) // must disable this mode in case it was enabled
      }
    }
    max_buttonView.setHidden(true) // not actually meant to be hidden at first but consumers must call setHidden on setup and runtime events config anyway - decided not to manage internally .. yet
    div.appendChild(max_buttonView.layer)
    valueLayer.addEventListener(
      'focus',
      function () {
        max_buttonView.visibilityAndSelectedState_setNeedsUpdate()
      }
    )
    valueLayer.Component_configureWithMAXToggled = function (
      isMAXToggledOn,
      toToggledOnText_orNullIfNotToggled
    ) {
      if (isMAXToggledOn) {
        if (toToggledOnText_orNullIfNotToggled == null) {
          throw 'Illegal isMAXToggledOn && !toToggledOnText_orNullIfNotToggled'
        }
        const toToggledOnText = toToggledOnText_orNullIfNotToggled
        valueLayer.classList.add('placeholderAsValue')
        valueLayer.placeholder = toToggledOnText
      } else {
        if (toToggledOnText_orNullIfNotToggled != null) {
          throw 'Illegal !isMAXToggledOn && toToggledOnText_orNullIfNotToggled'
        }
        valueLayer.classList.remove('placeholderAsValue')
        valueLayer.placeholder = valueLayer_amountPlaceholderText
      }
    }
  }
  //
  div.appendChild(commonComponents_tables.New_clearingBreakLayer())

  return {
    containerLayer: div,
    labelLayer: labelLayer,
    valueLayer: valueLayer,
    ccySelectLayer: ccySelectLayer,
    ccySelect_disclosureArrow_layer: ccySelect_disclosureArrow_layer,
    effectiveAmountLabelLayer: effectiveAmountLabelLayer,
    max_buttonView: max_buttonView
  }
}
exports.New_AmountInputFieldPKG = New_AmountInputFieldPKG
