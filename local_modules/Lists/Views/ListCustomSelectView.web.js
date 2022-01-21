'use strict'

const CustomSelectView = require('../../SelectView/CustomSelectView.web')

class ListCustomSelectView extends CustomSelectView {
  // Lifecycle - Setup - Overrides
  constructor (options, context) {
    options = options || {}
    { // validating options
      if (!options.listController || typeof options.listController === 'undefined') {
        throw Error(`${self.constructor.name} requires options.listController`)
      }
      if (!options.cellContentsViewClass || typeof options.cellContentsViewClass === 'undefined') {
        throw Error(`${self.constructor.name} requires options.cellContentsViewClass`)
      }
      if (!options.cellView_height_fn || typeof options.cellView_height_fn === 'undefined') {
        throw Error(`${self.constructor.name} requires options.cellView_height_fn`)
      }
    }
    const cellContentsViewClass = options.cellContentsViewClass
    // setting initial parameters
    options.cellView_createAndReturnOne_fn = function (selectView) {
      const base__options = options.cellContentsView_init_baseOptions || {}
      const finalized__options = base__options
      const cellView = new cellContentsViewClass(finalized__options, selectView.context)
      return cellView
    }
    options.cellView_prepareForReuse_fn = function (selectView, cellView) {
      cellView.PrepareForReuse()
    }
    options.lookup_uidFromRowItemForRow_fn = function (rowItem) {
      return rowItem._id // using the record _id as a uid
    }
    options.cellView_configureWithRowItem_fn = function (selectView, cellView, rowItem) {
      cellView.ConfigureWithRecord(rowItem)
    }
    // then requisite call of super()
    super(options, context) // but this calls `setup` so put setup in override
  }

  setup () {
    const self = this
    // pre-super.setup()
    const listController = self.options.listController
    self.listController = listController
    //
    super.setup()
    // post-super.setup()
    self.layer.classList.add('ListCustomSelectView') // must add class for css rules
    // then hydrate UI
    listController.ExecuteWhenBooted(function () {
      self._givenListControllerBooted_configureWithRecords()
    })
  }

  startObserving () {
    const self = this
    super.startObserving()
    self._listController_EventName_listUpdated = function () {
      self._givenListControllerBooted_configureWithRecords()
    }
    const listController = self.listController
    listController.on(
      listController.EventName_listUpdated(),
      self._listController_EventName_listUpdated
    )
  }

  // Lifecycle - Teardown - Overrides
  TearDown () {
    const self = this
    super.TearDown() // calls stopObserving for us
    //
    self.listController = null // after super as stopObserving needs it
  }

  stopObserving () {
    const self = this
    super.stopObserving()
    //
    const listController = self.listController
    listController.removeListener(
      listController.EventName_listUpdated(),
      self._listController_EventName_listUpdated
    )
    self._listController_EventName_listUpdated = null
  }

  // Runtime - Imperatives
  _givenListControllerBooted_configureWithRecords () {
    const self = this
    const rowItems = self.listController.records // as we know it's booted now
    self.ConfigureWithRowItems(rowItems) // on super
  }
}
module.exports = ListCustomSelectView
