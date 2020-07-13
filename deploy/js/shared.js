'use strict'

//-------
// Notes
//-------
/*
    This file is meant to be shared between different pages.
*/

//-----------
// Variables
//-----------
const shared = {
    'function': { // will hold various functions
        // delay
        // log
    },
    'setting': { // settings used internally, not customizable by the user
        'log': false // verbose logging for development, make sure this is false when publishing for end users
    }
} // shared

//-----------
// Functions
//-----------
const delay = shared.function.delay = function delay(ms) {
    /*
    Promise that will delay the desired number of milliseconds before resolving.

    @param   {Number}   ms  Number of milliseconds to delay.
    @return  {Promise}
    */

    return new Promise(resolve => setTimeout(resolve, ms))
} // delay

const log = shared.function.log = function log(...any) {
    /*
    Log to the console, if allowed.

    @param  {*}  any  Any one or more things that can be logged to the console.
    */

    if (shared.setting.log) {
        console.log(...any)
    }
} // log