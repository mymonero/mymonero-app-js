"use strict"

const SendTabContentView_Base = require('./SendTabContentView_Base.web')

class SendTabContentView extends SendTabContentView_Base
{
	constructor(options, context)
	{
		super(options, context)
	}
	_required_rootViewClassModule()
	{
		return require('./SendFundsView.Full.web')
	}
}
module.exports = SendTabContentView