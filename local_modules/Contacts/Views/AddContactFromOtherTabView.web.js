"use strict"

const AddContactView = require('../../Contacts/Views/AddContactView.web')

class AddContactFromOtherTabView extends AddContactView
{
	setup()
	{
		super.setup()
		//
		const self = this
		self.emitNewlySavedContact_fn = self.options.emitNewlySavedContact_fn || function(contact) {}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "New Contact"
	}
	//
	//
	// Runtime - Delegation - Overrides
	//
	_didSaveNewContact(contact)
	{
		const self = this
		self.emitNewlySavedContact_fn(contact)
		super._didSaveNewContact(contact) // this will cause self to be dismissed!! so, last-ish
	}
}
module.exports = AddContactFromOtherTabView