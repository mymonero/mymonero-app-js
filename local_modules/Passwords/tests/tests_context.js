'use strict'

// Hydrate context
const context_object_instantiation_descriptions =
[
  {
    module_path: __dirname + '/../../DocumentPersister/DocumentPersister.Files',
    instance_key: 'persister',
    options: {
      userDataAbsoluteFilepath: './test_products'
    }
  }
]
function NewHydratedContext () {
  const initialContext =
	{
	}

  return require('../../runtime_context/runtime_context').NewHydratedContext(context_object_instantiation_descriptions, initialContext)
}
module.exports.NewHydratedContext = NewHydratedContext
