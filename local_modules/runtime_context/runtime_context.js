// Copyright (c) 2014-2019, MyMonero.com
// 
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
// 
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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