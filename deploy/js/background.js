'use strict'

//-------
// Notes
//-------
/*
    Feri Extension uses camel case for variables.
*/

//-----------
// Variables
//-----------
const local = {
    'function': { // will hold various functions
        // addListeners
        // checkConnection
        // connect
        // connectionError
        // disconnect
        // extensionOff
        // extensionOn
        // fixIcons
        // lostConnection
        // reload
        // setBadge
        // setIcon
        // start
        // storageGet
        // storageSet
        // tabRemoved
        // themeCheck
        // themeMonitor
    },
    'option': { // defaults for user customizable values which may get replaced with values from storage
        'port'  : '4000',
        'server': 'local.test'
    },
    'setting': { // settings used internally, not customizable by the user
        'browserTabID': 0, // will be set to a positive integer once the extension is on and listening for changed files from the build tool
        'debug': true, // Allow console logging and inspecting popups with dev tools in Chrome. Popup pages will request this variable so you only need to set it here once.
        'defaultDocument': 'index.html', // can be changed by sock.onmessage
        'windowID': 0 // will be set to a positive integer once the extension is on and listening for changed files from the build tool
    },
    'sock': undefined, // will be an instance of WebSocket once a connection is attempted or connected
    'status': {
        'connectAbort': false, // can be set to true if disconnect request is received before a connection is fully established
        'lastIconCustomColor': '', // will be a string like blue or pink
        'pingAttempt': 0, // will increment every time a ping request is sent from the extension, will be reset to 0 when a pong response is received from the server
        'setStatus': 'set_status_disconnected' // current status or last known action string sent to popup.html
    },
    'timer': { // setInterval and setTimeout references
        'ping': null, // will become a setInterval call to run checkConnection() every 10 seconds once a web socket is open
        'themeMonitor': '' // will become a setTimeout call to run themeMonitor() every 10 seconds
    },
    'theme': {
        'matchMediaDark': window.matchMedia('(prefers-color-scheme: dark)'), // reference this object since we will be checking it frequently
        'isDark': false // can be set to true by themeCheck()
    },
    'troubleshoot': null // generic troubleshooting placeholder
} // local

//-----------
// Functions
//-----------
const addListeners = local.function.addListeners = function addListeners() {
    browser.runtime.onMessage.addListener(async function(request, sender) {
        log('browser.runtime.onMessage -> ', request)

        switch(request.action) {
            case 'extension_on':
                local.setting.browserTabID = request.currentTabID
                local.setting.windowID = request.currentWindowID
                await extensionOn()
                return 'ok'
                break
            case 'extension_off':
                local.status.connectAbort = true
                extensionOff()
                return Promise.resolve('ok')
                break
            case 'associate_tab':
                await setIcon('', local.setting.browserTabID)
                local.setting.browserTabID = request.currentTabID
                local.setting.windowID = request.currentWindowID
                await setIcon('blue', local.setting.browserTabID)
                return Promise.resolve('ok')
                break
            case 'debug':
                return Promise.resolve(local.setting.debug)
                break
            case 'set_status':
                return Promise.resolve({
                    'action': local.status.setStatus,
                    'browserTabID': local.setting.browserTabID,
                    'windowID': local.setting.windowID
                })
                break
            default:
                log('browser.runtime.onMessage -> unrecognized action "' + request.action + '"')
                return Promise.resolve('ok')
        }
    })

    browser.tabs.onUpdated.addListener(async function(tabID, changeInfo, tab) {
        if (tabID === local.setting.browserTabID) {
            // re-set the colorful icon for the feri associated tab
            log('tabs.onUpdated -> colorful icon re-set')
            await setIcon(local.status.lastIconCustomColor, local.setting.browserTabID)
        }
    })
} // addListeners

const checkConnection = local.function.checkConnection = async function checkConnection() {
    if (local.status.pingAttempt >= 3) {
        log('checkConnection -> three or more ping attempts failed')
        await disconnect()
        await lostConnection()
    } else {
        if (local.sock.readyState === 1) { // open
            local.status.pingAttempt += 1
            local.sock.send("ping")
        } else {
            // socket is no longer open
            log('checkConnection -> socket is no longer open')
            await disconnect()
            await lostConnection()
        }
    }
} // checkConnection

const connect = local.function.connect = async function connect() {
    // try to disconnect first
    await disconnect()

    if (local.status.connectAbort === true) {
        // we received a disconnect request before a connect could fully establish
        log('connect -> connect abort')
        return 'early'
    }

    // read from storage or use defaults
    local.option.server = await storageGet('server') || local.option.server
    local.option.port = await storageGet('port') || local.option.port

    try {
        local.sock = new WebSocket('ws://' + local.option.server + ':' + local.option.port)

        // on error
        local.sock.onerror = async function (event) {
            log('sock.onerrer -> event', event)

            local.troubleshoot = event

            await fixIcons() // fixes the edge case where one tab has a pink error icon and then a failed connection is made in a second tab that would turn a second icon pink

            connectionError()
        } // sock.onerror

        // one time event
        local.sock.onopen = async function (event) {
            // log('sock.onopen -> event', event)

            // check connection every 10 seconds
            local.timer.ping = setInterval(checkConnection, 10000)

            browser.tabs.onRemoved.addListener(tabRemoved)

            local.status.setStatus = 'set_status_connected'

            try {
                await browser.runtime.sendMessage({ action: local.status.setStatus, browserTabID: local.setting.browserTabID })
            } catch (error) {
                // the popup is most likely not active
                // do nothing
            }

            await setBadge(browser.i18n.getMessage('on'))
            await setIcon('blue', local.setting.browserTabID)

            await fixIcons() // fixes the edge case where one tab has a pink error icon and then a succesful connection is made in a second tab that would turn a second icon blue
        } // sock.onopen

        // every message
        local.sock.onmessage = function (event) {
            let data = event.data

            try {
                data = JSON.parse(data)
            } catch (error) {
                // do nothing
            }

            // check and optionally set the defaultDocument
            if (data.hasOwnProperty('defaultDocument')) {
                if (typeof data.defaultDocument === 'string') {
                    if (data.defaultDocument.trim().length >= 3) {
                        local.setting.defaultDocument = data.defaultDocument.trim()
                    }
                }
            }

            // any files built?
            if (data.hasOwnProperty('files')) {
                if (Array.isArray(data.files)) {
                    log('sock.onmessage -> reload')
                    reload()
                }
            }

            if (data === 'ping' || data === 'pong') {
                if (data === 'ping') {
                    // the server wants to know if we are still connected
                    local.sock.send("pong")
                } else {
                    // the server responded with 'pong'
                    local.status.pingAttempt = 0 // reset to 0
                }
            } else {
                log('sock.onmessage ->', data)
            }
        } // sock.onmessage
    } catch (error) {
        log('try catch')
        connectionError()
    }
} // connect

const connectionError = local.function.connectionError = async function connectionError() {
    local.status.setStatus = 'set_status_connection_error'

    try {
        await browser.runtime.sendMessage({ action: local.status.setStatus, browserTabID: local.setting.browserTabID })
    } catch (error) {
        // the popup is most likely not active
        // do nothing
    }

    await setBadge(browser.i18n.getMessage('error'))
    await setIcon('pink', local.setting.browserTabID)
} // connectionError

const disconnect = local.function.disconnect = async function disconnect() {
    clearInterval(local.timer.ping)

    local.status.pingAttempt = 0 // reset to 0

    browser.tabs.onRemoved.removeListener(tabRemoved)

    local.status.setStatus = 'set_status_disconnected'

    if (typeof local.sock === 'object') {
        if (local.sock.readyState === 1 || local.sock.readyState === 0) { // open or connecting
            local.sock.close(1000) // normal closure
        }
    }

    await setBadge()
    await setIcon('', local.setting.browserTabID)
} // disconnect

const extensionOff = local.function.extensionOff = async function extensionOff() {
    await disconnect()

    local.setting.browserTabID = 0
    local.setting.windowID = 0

    try {
        await browser.runtime.sendMessage({ action: local.status.setStatus, browserTabID: local.setting.browserTabID })
    } catch (error) {
        // the popup is most likely not active
        // do nothing
    }
} // extensionOff

const extensionOn = local.function.extensionOn = async function extensionOn() {
    local.status.connectAbort = false
    await connect()
} // extensionOn

const fixIcons = local.function.fixIcons = async function fixIcons() {
    // set default icon
    await setIcon()

    // loop through all tabs and fix icons
    const tabs = await browser.tabs.query({})

    tabs.map(async function(tab) {
        if (local.setting.browserTabID === tab.id) {
            // set colorful icon
            await setIcon(local.status.lastIconCustomColor, tab.id)
        } else {
            // set default icon
            await setIcon('', tab.id)
        }
    })
} // fixIcons

const lostConnection = local.function.lostConnection = async function lostConnection() {
    local.status.setStatus = 'set_status_lost_connection'

    try {
        await browser.runtime.sendMessage({ action: local.status.setStatus, browserTabID: local.setting.browserTabID })
    } catch (error) {
        // the popup is most likely not active
        // do nothing
    }

    await setBadge(browser.i18n.getMessage('lost'))
    await setIcon()
} // lostConnection

const reload = local.function.reload = async function reload() {
    if (local.setting.browserTabID > 0) {
        await browser.tabs.reload(local.setting.browserTabID, { bypassCache: true })
        log('reload -> browserTabID ' + local.setting.browserTabID + ' reloaded')
    } else {
        log('reload -> browserTabID is not greater than 0')
    }
} // reload

const setBadge = local.function.setBadge = async function setBadge(text) {
    text = text || ''

    await browser.browserAction.setBadgeText({
        'text': text
    })

    await browser.browserAction.setBadgeBackgroundColor({
        'color': '#313639'
    })
} // setBadge

const setIcon = local.function.setIcon = async function setIcon(color, tabID) {
    color = color || ''
    tabID = tabID || 0

    if (color === '') {
        if (local.theme.isDark === true) {
            color = 'white'
        } else {
            color = 'gray'
        }
    } else {
        local.status.lastIconCustomColor = color
    }

    await browser.browserAction.setIcon({
        'path': {
            '16':  'images/icon/icon-' + color + '-16.png',
            '24':  'images/icon/icon-' + color + '-24.png',
            '32':  'images/icon/icon-' + color + '-32.png',
            '48':  'images/icon/icon-' + color + '-48.png',
            '128': 'images/icon/icon-' + color + '-128.png'
        },
        'tabId': (tabID > 0) ? tabID : null
    })
} // setIcon

const start = local.function.start = async function start() {
    // read from storage or use defaults
    local.option.server = await storageGet('server') || local.option.server
    local.option.port = await storageGet('port') || local.option.port

    // write to storage
    await storageSet({'server': local.option.server})
    await storageSet({'port': local.option.port})

    addListeners()

    await themeMonitor() // will run once and then keep running once every 10 seconds
} // start

const storageGet = local.function.storageGet = async function storageGet(key) {
    let obj = await browser.storage.local.get(key)
    // obj can be an empty object {}
    // obj will never be undefined
    return obj[key] // an object key can be undefined
} // storageGet

const storageSet = local.function.storageSet = async function storageSet(obj) {
    await browser.storage.local.set(obj)
} // storageSet

const tabRemoved = local.function.tabRemoved = async function tabRemoved(tabID) {
    if (local.setting.browserTabID === tabID) {
        // we were associated with the tab that was just removed to kill any connections
        local.setting.browserTabID = 0
        local.setting.windowID = 0

        await disconnect()

        log('tabRemoved -> disconnected')
    } else {
        log('tabRemoved -> nothing to do')
    }
} // tabRemoved

const themeCheck = local.function.themeCheck = async function themeCheck() {
    /*
    Check if the current browser theme is dark or light and call setIcon() if needed.
    */

    const isDark = (local.theme.matchMediaDark.matches) ? true : false

    // Chrome/Edge on macOS notices operating system set light/dark preferences in real time.
    // Firefox on macOS does not notice changes until Firefox is restarted.

    if (local.theme.isDark !== isDark) {
        local.theme.isDark = isDark
        await fixIcons()
    }
} // themeCheck

const themeMonitor = local.function.themeMonitor = async function themeMonitor() {
    /*
    Monitor for theme changes by running themeCheck() once every 10 seconds.
    */

    clearTimeout(local.timer.themeMonitor)

    // background.js does not support matchMedia events in Chrome 76 so we must check the theme manually
    await themeCheck()

    local.timer.themeMonitor = setTimeout(themeMonitor, 10000) // 10 seconds
} // themeMonitor

//-------
// Start
//-------
start()