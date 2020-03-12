'use strict'

//---------------------------
// Variables for Development
//---------------------------
let debug = false // Allow console logging and inspecting popups with dev tools in Chrome. Popup pages will request this variable so you only need to set it here once.

let troubleshoot = {} // generic troubleshooting object

//-----------
// Variables
//-----------
let connectAbort = false // can be set to true if disconnect request is received before a connection is fully established

let defaultDocument = 'index.html' // can be changed by sock.onmessage

let browserTabID = 0 // will be set to a positive integer once the extension is on and listening for changed files from the build tool

let lastIconCustomColor = '' // will be a string like blue or pink

let matchMediaDark = window.matchMedia('(prefers-color-scheme: dark)') // reference this object since we will be checking it frequently

let pingAttempt = 0 // will increment every time a ping request is sent from the extension, will be reset to 0 when a pong response is received from the server
let pingTimer = null // will be a setInterval object

let port = '4000' // can be set by popup.html

let server = 'local.test' // can be set by popup.html

let sock // will be an instance of WebSocket

let status = 'set_status_disconnected' // current status or last known action string sent to popup.html

let theme = (matchMediaDark.matches) ? 'dark' : 'light' // dark or light depending on the browser

let windowID = 0 // will be set to a positive integer once the extension is on and listening for changed files from the build tool

//---------------------------
// Functions for Development
//---------------------------
function log(...items) {
    if (debug) {
        switch(items.length) {
            case 1:
                console.log(items[0])
                break
            case 2:
                console.log(items[0], items[1])
                break
            case 3:
                console.log(items[0], items[1], items[2])
                break
            default:
                console.log('log ->', items)
        }
    }
} // log

function wait(ms) {
    // useful for injecting delays and testing scenarios
    return new Promise(resolve => setTimeout(resolve, ms));
} // wait

//-----------
// Functions
//-----------
async function checkConnection() {
    if (pingAttempt >= 3) {
        log('checkConnection -> three or more ping attempts failed')
        disconnect()
        await lostConnection()
    } else {
        if (sock.readyState === 1) { // open
            pingAttempt += 1
            sock.send("ping")
        } else {
            // socket is no longer open
            log('checkConnection -> socket is no longer open')
            disconnect()
            await lostConnection()
        }
    }
} // checkConnection

async function connect() {
    // try to disconnect first
    disconnect()

    if (connectAbort === true) {
        // we received a disconnect request before a connect could fully establish
        log('connect -> connect abort')
        return 'early'
    }

    // read from storage or use defaults
    server = await storageGet('server') || server
    port = await storageGet('port') || port

    try {
        sock = new WebSocket('ws://' + server + ':' + port)

        // on error
        sock.onerror = async function (event) {
            troubleshoot.sockError = event

            await fixIcons() // fixes the edge case where one tab has a pink error icon and then a failed connection is made in a second tab that would turn a second icon pink

            connectionError()
        }

        // one time event
        sock.onopen = async function (event) {
            // check connection every 10 seconds
            pingTimer = setInterval(checkConnection, 10000)

            browser.tabs.onRemoved.addListener(tabRemoved)

            status = 'set_status_connected'

            try {
                await browser.runtime.sendMessage({ action: status, browserTabID: browserTabID })
            } catch (error) {
                // the popup is most likely not active
                // do nothing
            }

            setBadge(browser.i18n.getMessage('on'))
            setIcon('blue')

            await fixIcons() // fixes the edge case where one tab has a pink error icon and then a succesful connection is made in a second tab that would turn a second icon blue
        }

        // every message
        sock.onmessage = function (event) {
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
                        defaultDocument = data.defaultDocument.trim()
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

            troubleshoot.data = data

            if (data === 'ping' || data === 'pong') {
                if (data === 'ping') {
                    // the server wants to know if we are still connected
                    sock.send("pong")
                } else {
                    // the server responded with 'pong'
                    pingAttempt = 0 // reset to 0
                }
            } else {
                log('sock.onmessage ->', data)
            }
        } // sock.onmessage
    } catch (error) {
        connectionError()
    }
} // connect

async function connectionError() {
    status = 'set_status_connection_error'

    try {
        await browser.runtime.sendMessage({ action: status, browserTabID: browserTabID })
    } catch (error) {
        // the popup is most likely not active
        // do nothing
    }

    setBadge(browser.i18n.getMessage('error'))
    setIcon('pink')
} // connectionError

function disconnect() {
    clearInterval(pingTimer)

    pingAttempt = 0 // reset to 0

    browser.tabs.onRemoved.removeListener(tabRemoved)

    status = 'set_status_disconnected'

    if (typeof sock === 'object') {
        if (sock.readyState === 1 || sock.readyState === 0) { // open or connecting
            sock.close(1000) // normal closure
        }
    }

    setBadge()
    setIcon()
} // disconnect

async function extension_off() {
    disconnect()

    browserTabID = 0
    windowID = 0

    try {
        await browser.runtime.sendMessage({ action: status, browserTabID: browserTabID })
    } catch (error) {
        // the popup is most likely not active
        // do nothing
    }
} // extension_off

async function extension_on() {
    connectAbort = false
    await connect()
} // extension_on

async function fixIcons() {
    // loop through all tabs and fix icons
    let tabs = await browser.tabs.query({})

    tabs.map(function(tab) {
        if (browserTabID === tab.id) {
            // set colorful icon
            setIcon(lastIconCustomColor, tab.id)
        } else {
            // set default icon
            setIcon('', tab.id)
        }
    })
} // fixIcons

async function lostConnection() {
    status = 'set_status_lost_connection'

    try {
        await browser.runtime.sendMessage({ action: status, browserTabID: browserTabID })
    } catch (error) {
        // the popup is most likely not active
        // do nothing
    }

    setBadge(browser.i18n.getMessage('lost'))
    setIcon()
} // lostConnection

async function reload() {
    if (browserTabID > 0) {
        await browser.tabs.reload(browserTabID, { bypassCache: true })
        log('reload -> browserTabID ' + browserTabID + ' reloaded')
    } else {
        log('reload -> browserTabID is not greater than 0')
    }
} // reload

function setBadge(text) {
    text = text || ''

    browser.browserAction.setBadgeText({
        'text': text
    })

    browser.browserAction.setBadgeBackgroundColor({
        'color': '#313639'
    })
} // setBadge

function setIcon(color, tabID) {
    color = color || ''
    tabID = tabID || browserTabID

    if (color === '') {
        if (theme === 'dark') {
            color = 'white'
        } else {
            color = 'gray'
        }
    } else {
        lastIconCustomColor = color
    }

    browser.browserAction.setIcon({
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

async function storageGet(key) {
    let obj = await browser.storage.local.get(key)
    // obj can be an empty object {}
    // obj will never be undefined
    return obj[key] // an object key however, can be undefined
} // storageGet

async function storageSet(obj) {
    await browser.storage.local.set(obj)
} // storageSet

function tabRemoved(tabID) {
    if (browserTabID === tabID) {
        // we were associated with the tab that was just removed to kill any connections
        browserTabID = 0
        windowID = 0

        disconnect()

        log('tabRemoved -> disconnected')
    } else {
        log('tabRemoved -> nothing to do')
    }
} // tabRemoved

//-------------------
// Incoming Messages
//-------------------
browser.runtime.onMessage.addListener(async function(request, sender) {
    log('browser.runtime.onMessage -> ', request)

    switch(request.action) {
        case 'extension_on':
            browserTabID = request.currentTabID
            windowID = request.currentWindowID
            await extension_on()
            return 'ok'
            break
        case 'extension_off':
            connectAbort = true
            extension_off()
            return Promise.resolve('ok')
            break
        case 'associate_tab':
            setIcon('', browserTabID)
            browserTabID = request.currentTabID
            windowID = request.currentWindowID
            setIcon('blue')
            return Promise.resolve('ok')
            break
        case 'debug':
            return Promise.resolve(debug)
            break
        case 'status':
            return Promise.resolve({
                'action': status,
                'browserTabID': browserTabID,
                'windowID': windowID
            })
            break
        default:
            log('browser.runtime.onMessage -> unrecognized action "' + request.action + '"')
            return Promise.resolve('ok')
    }
})

//------------
// Party Time
//------------
async function partyTime() {
    // read from storage or use defaults
    server = await storageGet('server') || server
    port = await storageGet('port') || port

    // write to storage
    await storageSet({'server': server})
    await storageSet({'port': port})

    setIcon()

    // monitor for theme changes
    // background.js does not support matchMedia events in Chrome 76 so setInterval to the rescue
    setInterval(async function() {
        const previousTheme = theme
        theme = (matchMediaDark.matches) ? 'dark' : 'light'

        // Chrome on macOS notices operating system set light/dark preferences in real time
        // Firefox on macOS does not notice operating system set light/dark preferences until Firefox is restarted

        if (previousTheme !== theme) {
            await fixIcons()
        }
    }, 1000)

    browser.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (tabID === browserTabID) {
            // re-set the colorful icon for the feri associated tab
            log('tabs.onUpdated -> colorful icon re-set')
            setIcon(lastIconCustomColor, browserTabID)
        }
    })
}

partyTime()