"use strict"

const View = require('../Views/View.web')

function New_fieldValue_switchToggleView(params, context) {
    const note = params.note || "note"
    const checked = params.checked == true ? true : false
    const border = params.border
    const changed_fn = params.changed_fn || function (isChecked) {
    }
    const shouldToggle_fn = params.shouldToggle_fn || function (to_isSelected, async_shouldToggle_fn) {
        async_shouldToggle_fn(true)
    }

    const view = new View({tag: "div"}, context)
    const containerLayer = view.layer
    containerLayer.className = "switch"
    containerLayer.className += border ? " border" : ""

    const noteDiv = document.createElement("span")
    noteDiv.className = "note"
    noteDiv.style.fontSize = "11px" // we need this to visually stand out slightly more given how it's used
    noteDiv.style.fontFamily = 'Native-Light, input, menlo, monospace'
    noteDiv.style.fontWeight = "100" // instead of 500, cause this color, white, is rendered strong
    noteDiv.innerHTML = note
    containerLayer.appendChild(noteDiv)

    const input = document.createElement("input")
    input.className = "toggle"
    input.type = "checkbox"
    input.checked = checked
    containerLayer.appendChild(input)

    const label = document.createElement("label")
    label.for = input.id
    containerLayer.appendChild(label)
    //
    view.isChecked = function () {
        return input.checked == true
    }
    view.setChecked = function (checked, squelch_changed_fn_emit, setWithoutShouldToggle) {
        function __really_toggle() {
            const normalized__currentValue = input.checked == true ? true : false // for comparison
            const normalized__toValue = checked == true ? true : false
            if (normalized__currentValue != normalized__toValue) {
                input.checked = normalized__toValue
                //
                if (squelch_changed_fn_emit != true) {
                    changed_fn(checked)
                }
            }
        }

        if (setWithoutShouldToggle) {
            __really_toggle()
        } else {
            setTimeout(function () { // on 'next tick' so any consumers' animations remain smooth
                shouldToggle_fn( // enable consumer to disallow toggle
                    checked,
                    function (shouldToggle) {
                        if (shouldToggle) {
                            __really_toggle()
                        }
                    }
                )
            })
        }
    }
    view.toggleChecked = function (squelch_changed_fn_emit) {
        view.setChecked(!input.checked, squelch_changed_fn_emit)
    }
    view.SetEnabled = function (isEnabled) {
        input.disabled = isEnabled ? undefined : true
        if (isEnabled) {
            containerLayer.classList.remove("disabled")
        } else {
            containerLayer.classList.add("disabled")
        }
    }
    //
    containerLayer.onclick = function () {
        if (input.disabled == true) {
            return // must manually guard on this as toggleChecked / setChecked bypass interactivity
        }
        view.toggleChecked(false/*do not squelch emit*/)
    }
    input.addEventListener(
        'click',
        function (e) {
            // prevent any automatic checking/unchecking
            e.preventDefault()
            e.stopPropagation()
            //
            // this is done so as to gain the ability to programmatically mediate checking
            view.toggleChecked(false/*do not squelch emit*/)
        }
    )

    return view
}

exports.New_fieldValue_switchToggleView = New_fieldValue_switchToggleView
