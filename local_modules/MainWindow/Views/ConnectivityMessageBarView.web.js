"use strict"

const View = require('../../Views/View.web')

class ConnectivityMessageBarView extends View {
    constructor(options, context) {
        super(options, context)
        //
        const self = this
        self.setup()
    }

    setup() {
        const self = this
        self.setup_views()
        self.startObserving()
        //
        self.configureUI()
    }

    setup_views() {
        const self = this
        self.setup_layer()
    }

    setup_layer() {
        const self = this
        const layer = self.layer
        layer.innerHTML = "No Internet Connection Found"
        layer.classList.add('connectivity-bar')
    }

    startObserving() {
        const self = this
        window.addEventListener('load', function () {
            window.addEventListener('online', function () {
                self.configureUI()
            })
            window.addEventListener('offline', function () {
                self.configureUI()
            })
        })
    }

    //
    configureUI() {
        const self = this
        const isOnLine = navigator.onLine
        if (isOnLine) {
            self.layer.style.display = "none"
        } else {
            self.layer.style.display = "block"
        }
    }
}

module.exports = ConnectivityMessageBarView