'use strict'

//-------
// Notes
//-------
/*
    Functions in this file get added to local.test object in the background page.
    Run all tests by calling "await test()" in the background page.
    Tests cover the "local" object in "background.js" and the "shared" object in "shared.js".
*/

//-----------
// Functions
//-----------
local.test.functions = function testFunctions() {
    /*
    Each property of local.function should be a function.
    */

    for (const property in local.function) {
        expect(typeof local.function[property] === 'function',
            'Expected local.function.' + property + ' to be a function.'
        )
    } // for
} // testFunctions

local.test.functionAddListeners = function testFunctionAddListeners() {
    /*
    Do not test addListeners() since it should only run once on startup.
    */
} // testFunctionAddListeners

local.test.functionCheckConnection = async function testFunctionCheckConnection() {
    /*
    Make sure checkConnection() does not return an error.
    */

    try {
        await checkConnection()
    } catch (error) {
        throw error
    }
} // testFunctionCheckConnection

local.test.functionConnect = async function testFunctionConnect() {
    /*
    Make sure connect() does not return an error.
    */

    try {
        // reset local.troubleshoot to default
        local.troubleshoot = null

        await connect()

        await delay(1000) // wait one second for things to settle and to let any initial messages finish transmitting
    } catch (error) {
        throw error
    }
} // testFunctionConnect

local.test.functionConnectionError = async function testFunctionConnectionError() {
    /*
    Make sure connectionError() does not return an error.
    */

    try {
        await connectionError()
    } catch (error) {
        throw error
    }
} // testFunctionConnectionError

local.test.functionDisconnect = async function testFunctionDisconnect() {
    /*
    Make sure disconnect() does not return an error.
    */

    try {
        await disconnect()
    } catch (error) {
        throw error
    }
} // testFunctionDisconnect

local.test.functionExtensionOff = async function testFunctionExtensionOff() {
    /*
    Make sure extensionOff() does not return an error.
    */

    try {
        await extensionOff()
    } catch (error) {
        throw error
    }
} // testFunctionExtensionOff

local.test.functionExtensionOn = async function testFunctionExtensionOn() {
    /*
    Make sure extensionOn() does not return an error.
    */

    try {
        await extensionOn()

        await delay(1000) // wait one second for things to settle and to let any initial messages finish transmitting
    } catch (error) {
        throw error
    }
} // testFunctionExtensionOn

local.test.functionFixIcons = async function testFunctionFixIcons() {
    /*
    Make sure fixIcons() does not return an error.
    */

    try {
        await fixIcons()
    } catch (error) {
        throw error
    }
} // testFunctionFixIcons

local.test.functionListenerPortConnect = function testFunctionListenerPortConnect() {
    /*
    Do not test listenerPortConnect() since it is meant for real ports.
    */
} // testFunctionListenerPortConnect

local.test.functionListenerPortDisconnect = function testFunctionListenerPortDisconnect() {
    /*
    Do not test listenerPortDisconnect() since it is meant for real ports.
    */
} // testFunctionListenerPortDisconnect

local.test.functionListenerPortMessage = function testFunctionListenerPortMessage() {
    /*
    Do not test listenerPortMessage() since most message handlers are calling existing functions that will be tested in other functions or expect a real port to talk back to.
    */
} // testFunctionListenerPortMessage

local.test.functionListenerTabsUpdated = function testFunctionListenerTabsUpdated() {
    /*
    Do not test listenerTabsUpdated() since it should only be run once by the "addListeners" function.
    */
} // testFunctionListenerTabsUpdated

local.test.functionListenerWindowBeforeUnload = function testFunctionListenerWindowBeforeUnload() {
    /*
    Do not test listenerWindowBeforeUnload() since it should only be run once by the "addListeners" function.
    */
} // testFunctionListenerWindowBeforeUnload

local.test.functionLostConnection = async function testFunctionLostConnection() {
    /*
    Make sure lostConnection() does not return an error.
    */

    try {
        await disconnect()
        await lostConnection()

        // disconnect again to clear the lost connection status and also reset the badge icon and badge text
        await disconnect()
    } catch (error) {
        throw error
    }
} // testFunctionLostConnection

local.test.functionOptionsFromStorage = async function testFunctionOptionsFromStorage() {
    /*
    Make sure optionsFromStorage() updates local.option correctly.
    */

    try {
        const localOptionString = JSON.stringify(local.option)

        await optionsFromStorage()

        expect(JSON.stringify(local.option) === localOptionString,
            'Expected local.option to be the same after calling the "optionsFromStorage" function.'
        )
    } catch (error) {
        throw error
    }
} // testFunctionOptionsFromStorage

local.test.functionOptionToStorage = async function testFunctionOptionToStorage() {
    /*
    Make sure optionToStorage() saves to storage correctly by reading back from storage to compare.
    */

    try {
        const optionBefore = local.option.port

        await optionToStorage('port')
        await optionsFromStorage()

        expect(optionBefore === local.option.port)
    } catch (error) {
        throw error
    }
} // testFunctionOptionToStorage

local.test.functionPortMessageAll = function testFunctionPortMessageAll() {
    /*
    Do not test portMessageAll() since it is meant for real ports.
    */
} // testFunctionPortMessageAll

local.test.functionPortMessageAllExcept = function testFunctionPortMessageAllExcept() {
    /*
    Do not test portMessageAllExcept() since it is meant for real ports.
    */
} // testFunctionPortMessageAllExcept

local.test.functionReload = async function testFunctionReload() {
    /*
    Make sure reload() does not return an error.
    */

    try {
        await reload()
    } catch (error) {
        throw error
    }
} // testFunctionReload

local.test.functionReloadResume = function testFunctionReloadResume() {
    /*
    Do not test reloadResume() since it is only meant to be run in sequence after a call to the "reload" function.
    */
} // testFunctionReloadResume

local.test.functionReloadResumeFinal = function testFunctionReloadResumeFinal() {
    /*
    Do not test reloadResumeFinal() since it is only meant to be run in sequence after a call to the "reloadResume" function.
    */
} // testFunctionReloadResumeFinal

local.test.functionResetMostSettings = function testFunctionResetMostSettings() {
    /*
    Make sure resetMostSettings() resets most settings to default values.
    */

    resetMostSettings()

    expect(local.setting.reloadRequest === 0)
    expect(local.setting.scrollAfterReload === false)

    expect(local.setting.scrollError.scrollLeft === 0)
    expect(local.setting.scrollError.scrollTop === 0)
    expect(local.setting.scrollError.tabURL === '')

    expect(local.setting.scrollLeft === 0)
    expect(local.setting.scrollRestoration === 'auto')
    expect(local.setting.scrollTop === 0)
    expect(local.setting.tabURL === '')
} // testFunctionResetMostSettings

local.test.functionSetBadge = async function testFunctionSetBadge() {
    /*
    Make sure setBadge() sets the desired badge text and background color.
    */

    try {
        await setBadge('hello')

        const badgeText = await browser.browserAction.getBadgeText({})

        const badgeBackgroundColor = await browser.browserAction.getBadgeBackgroundColor({})

        expect(badgeText === 'hello',
            'Expected badge text to be "hello".'
        )

        expect(badgeBackgroundColor.join(',') === '49,54,57,255',
            'Expected badge background color to be "49,54,57,255" instead of "' + badgeBackgroundColor + '".'
        )

        // set badge back to defaults
        await setBadge()
    } catch (error) {
        throw error
    }
} // testFunctionSetBadge

local.test.functionSetIcon = async function testFunctionSetIcon() {
    /*
    Make sure setIcon() does not return an error.
    */

    try {
        await setIcon()
    } catch (error) {
        throw error
    }
} // testFunctionSetIcon

local.test.functionStart = function testFunctionStart() {
    /*
    Do not test start() since it should only be run once on startup.
    */
} // testFunctionStart

local.test.functionStorageGet = async function testFunctionStorageGet() {
    /*
    Make sure storageGet() returns the correct value for a valid key and undefined for a missing key.
    */

    try {
        const server = await storageGet('server')

        expect(typeof server === 'string' && server === local.option.server)

        const missingOption = await storageGet('optionThatDoesNotExist')

        expect(missingOption === undefined)
    } catch (error) {
        throw error
    }
} // testFunctionStorageGet

local.test.functionStorageSet = async function testFunctionStorageSet() {
    /*
    Make sure storageSet() does not return an error.
    */

    try {
        await storageSet({
            'server': local.option.server
        })
    } catch (error) {
        throw error
    }
} // testFunctionStorageSet

local.test.functionTabRemoved = function testFunctionTabRemoved() {
    /*
    Do not test tabRemoved() as it should only be called for real websocket events.
    */
} // testFunctionTabRemoved

local.test.functionTest = function testFunctionTest() {
    /*
    No need to test test() since we will be running it with "await test()".
    */
} // testFunctionTest

local.test.functionThemeCheck = async function testFunctionThemeCheck() {
    /*
    Make sure themeCheck() does not return an error.
    */

    try {
        await themeCheck()
    } catch (error) {
        throw error
    }
} // testFunctionThemeCheck

local.test.functionThemeMonitor = async function testFunctionThemeMonitor() {
    /*
    Make sure themeMonitor() does not return an error.
    */

    try {
        await themeMonitor()
    } catch (error) {
        throw error
    }
} // testFunctionThemeMonitor

local.test.option = function testOption() {
    /*
    Each local.option property should be of a certain type.
    */

    const propertyType = {
        'port'  : 'string',
        'server': 'string'
    }

    for (const property in local.option) {
        const type = propertyType[property]

        expect(typeof local.option[property] === type,
            'Expected local.option.' + property + ' type to be a ' + type + '.'
        )
    } // for
} // testOption

local.test.port = function testPort() {
    /*
    The local.port object should be an array.
    */

    expect(Array.isArray(local.port) === true,
        'Expected local.port to be an array.'
    )
} // testPort

local.test.setting = function testSetting() {
    /*
    Each local.setting property should be of a certain type.
    */

    let propertyType = {
        'defaultDocument'  : 'string',
        'reloadRequest'    : 'number',
        'scrollAfterReload': 'boolean',
        'scrollError'      : 'object',
        'scrollLeft'       : 'number',
        'scrollRestoration': 'string',
        'scrollTop'        : 'number',
        'tabID'            : 'number',
        'tabURL'           : 'string',
        'windowID'         : 'number'
    }

    for (const property in local.setting) {
        const setting = local.setting[property]
        const type = propertyType[property]

        expect(typeof setting === type,
            'Expected local.setting.' + property + ' type to be a ' + type + '.'
        )
    } // for

    propertyType = {
        'scrollLeft': 'number',
        'scrollTop' : 'number',
        'tabURL'    : 'string'
    }

    for (const property in local.setting.scrollError) {
        const setting = local.setting.scrollError[property]
        const type = propertyType[property]

        expect(typeof setting === type,
            'Expected local.setting.scrollError.' + property + ' type to be a ' + type + '.'
        )
    } // for
} // testSetting

local.test.sock = function testSock() {
    /*
    Make sure local.sock is an object or undefined.
    */

    const type = typeof local.sock

    expect(type === 'object' || type === 'undefined')
} // testSock

local.test.status = function testStatus() {
    /*
    Each local.status property should be of a certain type.
    */

    const propertyType = {
        'connectAbort'       : 'boolean',
        'current'            : 'string',
        'lastIconCustomColor': 'string',
        'pingAttempt'        : 'number'
    }

    for (const property in local.status) {
        const status = local.status[property]
        const type = propertyType[property]

        expect(typeof status === type,
            'Expected local.status.' + property + ' type to be a ' + type + '.'
        )
    } // for
} // testStatus

local.test.test = function testTest() {
    /*
    Each local.test property should be a function.
    */

    for (const property in local.test) {
        expect(typeof local.test[property] === 'function',
            'Expected local.test.' + property + ' to be a function.'
        )
    } // for
} // test_test

local.test.timer = function testTimer() {
    /*
    Each local.timer property should be of an expected type or value.
    */

    const ping = local.timer.ping

    expect(ping === null || typeof ping === 'number')

    const themeMonitor = local.timer.themeMonitor

    expect(themeMonitor === '' || typeof themeMonitor === 'number')
} // testTimer

local.test.theme = async function testTheme() {
    /*
    Make sure theme properties are valid.
    */

    const propertyType = {
        'matchMediaDark': 'object',
        'isDark': 'boolean'
    }

    for (const property in local.theme) {
        const type = propertyType[property]

        expect(typeof local.theme[property] === type,
            'Expected local.theme.' + property + ' type to be a ' + type + '.'
        )
    } // for
} // testTheme

local.test.troubleshoot = function testTroubleshoot() {
    /*
    Make sure local.troubleshoot is null as in no errors have replaced the default value.
    */

    expect(local.troubleshoot === null,
        'Expected local.troubleshoot to be null.'
    )
} // testTroubleshoot

//--------------------
// Functions - Shared
//--------------------
local.test.sharedFunction = function testSharedFunction() {
    /*
    Each property of shared.function should be a function.
    */

    for (const property in shared.function) {
        expect(typeof shared.function[property] === 'function',
            'Expected shared.function.' + property + ' to be a function.'
        )
    } // for
} // testSharedFunction

local.test.sharedFunctionDelay = async function testSharedFunctionDelay() {
    /*
    Make sure delay() does not return before the requested amount of milliseconds.
    */

    try {
        const begin = Date.now()
        const duration = 500 // milliseconds

        await delay(duration)

        const end = Date.now()

        expect(end >= (begin + duration),
            'Expected delay(500) to delay at least 500 milliseconds.'
        )
    } catch (error) {
        throw error
    }
} // testSharedFunctionDelay

local.test.sharedFunctionExpect = function testSharedFunctionExpect() {
    /*
    Make sure expect() only throws errors when it encounters results that are not exactly true.
    */

    try {
        expect(true, 'true should not throw an error')
        expect(false, 'false should throw an error')
    } catch (error) {
        if (error.message !== 'false should throw an error') {
            throw error
        }
    }
} // testSharedFunctionExpect

local.test.sharedFunctionLog = function testSharedFunctionLog() {
    /*
    No need to test log() since it will only console.log if shared.setting.log is true.
    */
} // testSharedFunctionLog

local.test.sharedSetting = function testSharedSetting() {
    /*
    Each setting property should be of a certain type and set to false.
    */

    const propertyType = {
        'log': 'boolean'
    }

    for (const property in shared.setting) {
        const setting = shared.setting[property]
        const type = propertyType[property]

        expect(typeof setting === type,
            'Expected shared.setting.' + property + ' type to be a ' + type + '.'
        )

        if (property === 'log' && setting === true) {
            // just warn about the log setting since it is nice to have on while developing
            console.warn('Expected shared.setting.log to be false.')
        } else {
            expect(setting === false,
                'Expected shared.setting.' + property + ' to be false.'
            )
        }
    } // for
} // testSharedSetting