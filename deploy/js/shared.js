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
        // log
    },
    'setting': { // settings used internally, not customizable by the user
        'log': false // verbose logging for development, make sure this is false when publishing for end users
    }
} // shared

//-----------
// Functions
//-----------
const log = shared.function.log = function log(...any) {
    /*
    Log to the console, if allowed.

    @param  {*}  any  Any one or more things that can be logged to the console.
    */

    if (shared.setting.log) {
        console.log(...any)
    }
} // log