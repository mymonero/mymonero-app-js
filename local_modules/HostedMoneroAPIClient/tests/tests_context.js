"use strict"
//
// Hydrate context
var context_object_instantiation_descriptions = 
[ 
	{
		module_path: __dirname + "/../HostedMoneroAPIClient",
		instance_key: "hostedMoneroAPIClient",
		options: {
			host: "mymonero.com"
		}
	}
]
function NewHydratedContext() 
{
    var initialContext = 
    {
    }

    return require("../../runtime_utils/runtime-context").NewHydratedContext(context_object_instantiation_descriptions, initialContext)
}
module.exports.NewHydratedContext = NewHydratedContext