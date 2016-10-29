"use strict"

const Persister = require('../persister/Persister')
const Datastore = require('nedb')
const path = require('path')


////////////////////////////////////////////////////////////////////////////////
// Principal class

class NeDBPersister extends Persister
{

    setup()
    {
        var self = this
		//
        super.setup()
		//
		var db = self._new_db()
		self.db = db
		//
		db.loadDatabase(function (err)
		{ // Callback is optional
			// Now commands will be executed
			if (err) {
				console.log("loaded db w err", err)
				// crash log here ?
				process.exit(1)
				//
				return // just in case?
			}
		})
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Private
	
	_new_db()
	{
		var self = this
		var context = self.context
		var app = context.app
		var pathTo_dataFile = path.join(app.getPath('userData'), 'application.datafile')
		var db = new Datastore({ 
			filename: pathTo_dataFile,
		    autoload: true
		})
		//
		return db
	}


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Private - Overrides

	__documentsWithQuery(query, fn)
	{
		var self = this
	}


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Private - Overrides
	
	

    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Delegation - 

}
module.exports = NeDBPersister