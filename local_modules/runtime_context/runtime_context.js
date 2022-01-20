"use strict"
//
// Context generation
// Format is like this:
// var context_object_instantiation_descriptions =
// [
//	 {
//		 module_path: "../raw_objects/raw_source_documents",
//		 instance_key: "raw_source_documents_controller",
//		 options: {}
//	 },
//	 {
//		 module: require("../raw_objects/raw_row_objects"),
//		 instance_key: "raw_row_objects_controller",
//		 options: {}
//	 }
// ]
//
// Hydrate context
//
function NewHydratedContext(context_object_instantiation_descriptions, initialContext_orNilForNew)
{
	var context = initialContext_orNilForNew != null ? initialContext_orNilForNew : {}
	for (let i in context_object_instantiation_descriptions) {
		var description = context_object_instantiation_descriptions[i]
		let module_path = description.module_path
		let description_module = description.module
		if (module_path && typeof module_path !== 'string') {
			console.error("Invalid description.module_path: ", JSON.stringify(description, null, '  '))
			throw "runtime_context found invalid description 'module_path' key value type"
		}
		if (description_module && typeof description_module === 'string') {
			console.error("Invalid description.module: ", JSON.stringify(description, null, '  '))
			throw "runtime_context found invalid description 'module' key value type"
		}
		var module = description_module || require("" + module_path)
		if (typeof module === 'undefined' || module === null) {
			console.error("Unable to require " + description.module_path + ". Skipping.")
			continue
		}
		var instance;
		try {
			instance = new module(description.options, context)
		} catch (e) {
			console.error("Code fault while loading ", JSON.stringify(description, null, '  '))
			throw e
		}
		if (typeof instance === 'undefined' || instance === null) {
			console.error("Unable to create an instance of " + description.module_path + ". Skipping.")
			throw "runtime_context: Unable to create an instance"
		}
		context[description.instance_key] = instance
		//
		const aliases = description.aliases || []
		for (var idx in aliases) {
			const alias = aliases[idx]
			context[alias] = instance
		}
	}
	var context_keys = Object.keys(context)
	for (let i in context_keys) {
		var context_key = context_keys[i]
		let instance = context[context_key]
		// This calls an optional function that classes can implement to get control after the whole context is set up
		var postWholeContextInit_setup__fn = instance.RuntimeContext_postWholeContextInit_setup
		if (typeof postWholeContextInit_setup__fn !== 'undefined') {
			postWholeContextInit_setup__fn.call(instance) // using 'call' so the function's "this" is instance
		}
	}
	
	return context
}
module.exports.NewHydratedContext = NewHydratedContext