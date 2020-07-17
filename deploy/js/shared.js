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
        // expect
        // log
    },
    'setting': { // settings used internally, not customizable by the user
        'log': true // verbose logging for development, make sure this is false when publishing for end users
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

const expect = shared.function.expect = function expect(result, errorMessage) {
    /*
    Expect function for testing. Only throw an error if the result is not exactly true.

    @param  {Boolean}  result          True or false.
    @param  {String}   [errorMessage]  Optional. Error message to throw if result is not exactly true.
    */

    if (result !== true) {
        throw new Error(errorMessage)
    }
} // expect

const log = shared.function.log = function log(...any) {
    /*
    Log to the console, if allowed.

    @param  {*}  any  Any one or more things that can be logged to the console.
    */

    if (shared.setting.log) {
        console.log(...any)
    }
} // log