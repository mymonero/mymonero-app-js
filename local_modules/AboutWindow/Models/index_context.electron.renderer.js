"use strict"

var context_object_instantiation_descriptions =
[
	{
		module_path: __dirname + "/../../Theme/ThemeController",
		instance_key: "themeController",
		options: {}
	},
	{
		module_path: __dirname + "/../../URLBrowser/URLBrowser.electron",
		instance_key: "urlBrowser",
		options: {}
	}
]
function NewHydratedContext(app, menuController) {
	var initialContext =
	{
		app: app,
		menuController: menuController,
		isDebug: process.env.NODE_ENV === 'development',
	}

	return require("../../runtime_context/runtime_context").NewHydratedContext(context_object_instantiation_descriptions, initialContext)
}
module.exports.NewHydratedContext = NewHydratedContext