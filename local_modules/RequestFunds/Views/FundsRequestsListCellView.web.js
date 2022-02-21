'use strict'

const ListCellView = require('../../Lists/Views/ListCellView.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const FundsRequestCellContentsView = require('./FundsRequestCellContentsView.web')

class FundsRequestsListCellView extends ListCellView {
  constructor (options, context) {
    super(options, context)
  }

  setup_views () {
    const self = this
    { // self.cellContentsView: set this up /before/ calling _cmd on super
      // so that it's avail in overridable_layerToObserveForTaps
      const view = new FundsRequestCellContentsView({}, self.context)
      self.cellContentsView = view
      // though this `add…` could be deferred til after…
      self.addSubview(view)
    }
    super.setup_views()
    {
      const layer = self.layer
      layer.style.position = 'relative'
      // hover effects/classes
      self.layer.classList.add('hoverable-cell')
      self.layer.classList.add('utility')
    }
    {
      const layer = document.createElement('img')
      layer.src = '../../../assets/img/list_rightside_chevron@3x.png'
      layer.classList.add('table-chevron')
      self.layer.appendChild(layer)
    }
    self.__setup_cellSeparatorLayer()
  }

  overridable_layerToObserveForTaps () {
    const self = this
    if (!self.cellContentsView || typeof self.cellContentsView === 'undefined') {
      throw 'self.cellContentsView was nil in ' + self.constructor.name + ' overridable_layerToObserveForTaps'
      // return self.layer
    }
    return self.cellContentsView.layer
  }

  __setup_cellSeparatorLayer () {
    const self = this
    const layer = document.createElement('div')
    layer.style.background = '#413e40'
    layer.style.position = 'absolute'
    layer.style.bottom = '-0.5px' // instead of 0… to make sure hover effects look nicer (but it might not do much in the end)
    layer.style.height = '1px'
    layer.style.width = 'calc(100% - 50px)'
    layer.style.left = '50px'
    layer.style.visibility = 'visible' // to be configured
    self.cellSeparatorLayer = layer
    self.layer.appendChild(layer)
  }

  //
  //
  // Lifecycle - Teardown/Recycling
  //
  TearDown () {
    super.TearDown()
    const self = this
    self.cellContentsView.TearDown()
  }

  prepareForReuse () {
    super.prepareForReuse()
    const self = this
    self.cellContentsView.PrepareForReuse()
  }

  //
  //
  // Runtime - Imperatives - Cell view - Config with record
  //
  overridable_configureUIWithRecord () {
    super.overridable_configureUIWithRecord()
    //
    const self = this
    {
      if (self.isAtEnd == true) {
        self.cellSeparatorLayer.style.visibility = 'hidden'
      } else {
        self.cellSeparatorLayer.style.visibility = 'visible'
      }
    }
    self.cellContentsView.ConfigureWithRecord(self.record)
  }
}
module.exports = FundsRequestsListCellView
