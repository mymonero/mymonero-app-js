"use strict"

const EventEmitter = require('events')

class WalletAppCoordinator extends EventEmitter
{
	//
	//
	// Lifecycle - Constructor
	//
	constructor(options, context)
	{
		super() // must call super before we can access `this`
		const self = this
		{
			self.options = options
			self.context = context
		}
		self.setup()
	}
	setup()
	{
		const self = this
	}
	//
	// Runtime - Accessors - Event names
	EventName_willTrigger_sendFundsFromWallet()
	{
		return "EventName_willTrigger_sendFundsFromWallet"
	}
	EventName_didTrigger_sendFundsFromWallet()
	{
		return "EventName_didTrigger_sendFundsFromWallet"
	}
	//
	EventName_willTrigger_requestFundsFromContact()
	{
		return "EventName_willTrigger_requestFundsFromContact"
	}
	EventName_didTrigger_requestFundsFromContact()
	{
		return "EventName_didTrigger_requestFundsFromContact"
	}
	//
	EventName_willTrigger_sendFundsToContact()
	{
		return "EventName_willTrigger_sendFundsToContact"
	}
	EventName_didTrigger_sendFundsToContact()
	{
		return "EventName_didTrigger_sendFundsToContact"
	}
	//
	// Runtime - Imperatives - Triggering events with Wallet
	Trigger_sendFundsFromWallet(object)
	{
		const self = this
		self.emit(
			self.EventName_willTrigger_sendFundsFromWallet(),
			object
		)
		self.emit(
			self.EventName_didTrigger_sendFundsFromWallet(),
			object
		)
	}
	//
	//
	// Runtime - Imperatives - Triggering events with Contact
	//
	Trigger_requestFundsFromContact(contact)
	{
		const self = this
		self.emit(
			self.EventName_willTrigger_requestFundsFromContact(),
			contact
		)
		self.emit(
			self.EventName_didTrigger_requestFundsFromContact(),
			contact
		)
	}
	Trigger_sendFundsToContact(contact)
	{
		const self = this
		self.emit(
			self.EventName_willTrigger_sendFundsToContact(),
			contact
		)
		self.emit(
			self.EventName_didTrigger_sendFundsToContact(),
			contact
		)
	}
}
module.exports = WalletAppCoordinator
