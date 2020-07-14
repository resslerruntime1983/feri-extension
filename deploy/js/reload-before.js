'use strict'

//-------
// Notes
//-------
/*
    The window object is safe to use because our script will be injected and isolated from any existing scripts.
*/

//--------------------------------
// This script will only run once
//--------------------------------
if (window.reloadBefore === undefined) {
    window.reloadBefore = true

    const threeSecondsFromNow = Date.now() + 3000

    //-----------
    // Functions
    //-----------
    const start = function start() {
        /*
        Start.
        */

        if (window.reloadAfterDone === false && Date.now() < threeSecondsFromNow) {
            // "reload-after.js" is still trying to restore the previous scrollLeft, scrollRestoration, and scrollTop values
            // check again after a short delay
            setTimeout(start, 100) // milliseconds
        } else {
            // "reload-after.js" has completed their tasks or we have waited at least three seconds for those tasks to finish
            startContinue()
        }
    } // start

    const startContinue = function startContinue() {
        /*
        Start continue.
        */

        //-----------
        // Variables
        //-----------
        const browserAlias = (typeof browser === 'object') ? browser : chrome // firefox or a chromium based browser

        const port = browserAlias.runtime.connect({ name: 'reload-before' })

        const scrollLeft = document.documentElement.scrollLeft

        const scrollTop = document.documentElement.scrollTop

        const scrollRestoration = window.history.scrollRestoration // "auto" or "manual"

        //--------------------
        // Scroll Restoration
        //--------------------
        if (scrollRestoration === 'auto' && (scrollLeft > 0 || scrollTop > 0)) {
            // set scrollRestoration to manual so the browser does not try to restore scroll position after the next reload
            window.history.scrollRestoration = 'manual'
        }

        //--------------
        // Post Message
        //--------------
        port.postMessage({
            subject: 'reload_before',
            scrollLeft: scrollLeft,
            scrollRestoration: scrollRestoration,
            scrollTop: scrollTop
        })

        //--------------
        // Disconnect
        //--------------
        // normally we would disconnect the port here but doing so causes firefox to not always send the port.postMessage above
        // leave the port connected since the port will be closed automatically once this page reloads
    } // startContinue

    //-------
    // Start
    //-------
    start()
} // if