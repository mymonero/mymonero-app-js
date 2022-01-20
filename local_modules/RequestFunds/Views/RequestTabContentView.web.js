"use strict"

const RequestTabContentView_Base = require('./RequestTabContentView_Base.web')

class RequestTabContentView extends RequestTabContentView_Base
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{
		super.setup() // we must call on super
		const self = this
		{ // walletsListView
			const options = {}
			const FundsRequestsListView = require('./FundsRequestsListView.web')
			const view = new FundsRequestsListView(options, self.context)
			self.fundsRequestsListView = view
		}
		{
			self.SetStackViews(
				[
					self.fundsRequestsListView
				]
			)
		}
	}
}
module.exports = RequestTabContentView