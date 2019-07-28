'use strict'

//-----------
// Variables
//-----------
let sock // will be an instance of WebSocket

let server = 'local.test' // can be set by popup.html
let port   = '4000'       // can be set by popup.html

let defaultDocument = 'index.html' // can be changed by sock.onmessage

let browserTabID = 0 // will be set to a positive integer once the extension is on and listening for changed files from the build tool

let lastIconCustomColor = '' // will be a string like blue or pink

let matchMediaDark = window.matchMedia('(prefers-color-scheme: dark)') // reference this object since we will be checking it a lot

let pingAttempt = 0 // will increment every time a ping request is sent from the extension, will be reset to 0 when a pong response is received from the server
let pingTimer = null // will be a setInterval object

let status = 'set_status_disconnected' // current status or last known action string sent to popup.html

let theme = (matchMediaDark.matches) ? 'dark' : 'light' // dark or light depending on the browser

let troubleshoot = {} // generic troubleshooting object

let windowID = 0 // will be set to a positive integer once the extension is on and listening for changed files from the build tool

//-----------
// Functions
//-----------
function checkConnection() {
    if (pingAttempt >= 3) {
        console.log('checkConnection -> three or more ping attempts failed')
        disconnect()
        lostConnection()
    } else {
        if (sock.readyState === 1) { // open
            pingAttempt += 1
            sock.send("ping")
        } else {
            // socket is no longer open
            console.log('checkConnection -> socket is no longer open')
            disconnect()
            lostConnection()
        }
    }
} // checkConnection

function connectionError() {
    status = 'set_status_connection_error'

    chrome.runtime.sendMessage({ action: status, browserTabID: browserTabID }, function(response) {
        // do nothing
    })

    setBadge('error')
    setIcon('pink')
} // connectionError

async function connect() {
    // try to disconnect first
    disconnect()

    // read from storage or use defaults
    server = await storageGet('server') || server
    port = await storageGet('port') || port

    try {
        sock = new WebSocket('ws://' + server + ':' + port)

        // on error
        sock.onerror = function (event) {
            troubleshoot.sockError = event

            connectionError()
        }

        // one time event
        sock.onopen = function (event) {
            // check connection every 10 seconds
            pingTimer = setInterval(checkConnection, 10000)

            chrome.tabs.onRemoved.addListener(tabRemoved)

            status = 'set_status_connected'

            chrome.runtime.sendMessage({ action: status, browserTabID: browserTabID }, function(response) {
                // do nothing
            })

            setBadge('on')
            setIcon('blue')
        }

        // every message
        sock.onmessage = function (event) {
            let data = event.data

            try {
                data = JSON.parse(data)
            } catch(e) {
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
                console.log('sock.onmessage ->', data)
            }

            return Promise.resolve()
        } // sock.onmessage
    } catch(err) {
        connectionError()
    }


} // connect

function disconnect() {
    clearInterval(pingTimer)

    pingAttempt = 0 // reset to 0

    chrome.tabs.onRemoved.removeListener(tabRemoved)

    status = 'set_status_disconnected'

    if (typeof sock === 'object') {
        if (sock.readyState === 1 || sock.readyState === 0) { // open or connecting
            sock.close(1000) // normal closure
        }
    }

    console.log('about to setBadge')
    setBadge()

    console.log('about to setIcon')
    setIcon()
} // disconnect

function extension_off() {
    disconnect()

    browserTabID = 0
    windowID = 0

    chrome.runtime.sendMessage({ action: status, browserTabID: browserTabID }, function(response) {
        // do nothing
    })
} // extension_off

async function extension_on() {
    await connect()
} // extension_on

function lostConnection() {
    status = 'set_status_lost_connection'

    chrome.runtime.sendMessage({ action: status, browserTabID: browserTabID }, function(response) {
        // do nothing
    })

    setBadge('lost')
    setIcon()
} // lostConnection

function reload() {
    if (browserTabID > 0) {
        chrome.tabs.reload(browserTabID, { bypassCache: true }, function(callback) {
            console.log('reload -> browserTabID ' + browserTabID + ' reloaded')
        }) // first param is tab id
    } else {
        console.log('reload -> browserTabID is not greater than 0')
    }
} // reload

function setBadge(text) {
    text = text || ''

    chrome.browserAction.setBadgeText({
        'text': text
    })

    chrome.browserAction.setBadgeBackgroundColor({
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

    chrome.browserAction.setIcon({
        'path': {
            '16':  'image/icon/icon-' + color + '-16.png',
            '24':  'image/icon/icon-' + color + '-24.png',
            '32':  'image/icon/icon-' + color + '-32.png',
            '48':  'image/icon/icon-' + color + '-48.png',
            '128': 'image/icon/icon-' + color + '-128.png'
        },
        'tabId': (tabID > 0) ? tabID : null
    })
} // setIcon

async function storageGet(key) {
    return await new Promise(function(resolve, reject) {
        chrome.storage.local.get(key, function(obj) {
            // obj can be an empty object
            // obj will never be undefined according to https://developer.chrome.com/apps/storage#method-StorageArea-get
            resolve(obj[key]) // this however, can be undefined
        })
    })
} // storageGet

async function storageSet(obj) {
    await new Promise(function(resolve, reject) {
        chrome.storage.local.set(obj, function() {
            resolve()
        })
    })
} // storageSet

function tabRemoved(tabID) {
    if (browserTabID === tabID) {
        // we were associated with the tab that was just removed to kill any connections
        browserTabID = 0
        windowID = 0

        disconnect()

        console.log('tabRemoved -> disconnected')
    } else {
        console.log('tabRemoved -> nothing to do')
    }
} // tabRemoved

//-------------------
// Incoming Messages
//-------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('chrome.runtime.onMessage -> ', request)

    switch(request.action) {
        case 'extension_on':
            browserTabID = request.currentTabID
            windowID = request.currentWindowID
            extension_on()
            sendResponse('ok')
            break
        case 'extension_off':
            extension_off()
            sendResponse('ok')
            break
        case 'associate_tab':
            setIcon('', browserTabID)
            browserTabID = request.currentTabID
            windowID = request.currentWindowID
            setIcon('blue')
            sendResponse('ok')
            break
        case 'status':
            // console.log('returned status -> ' + status)
            sendResponse({
                'action': status,
                'browserTabID': browserTabID,
                'windowID': windowID
            })
            break
        // case 'reload':
        //     reload()
        //     break
        default:
            console.log('chrome.runtime.onMessage -> unrecognized action "' + request.action + '"')
            sendResponse('ok')
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
    setInterval(function() {
        let previousTheme = theme
        theme = (matchMediaDark.matches) ? 'dark' : 'light'

        // Chrome on mac will report light/dark preferences in real time
        // Firefox on mac will not notice a preference change until Firefox is restarted

        if (previousTheme !== theme) {
            // loop through all tabs and fix icons
            chrome.tabs.query({}, function(tabs) {
                tabs.map(function(tab) {
                    if (browserTabID === tab.id) {
                        // set colorful icon
                        setIcon(lastIconCustomColor, tab.id)
                    } else {
                        // set default icon
                        setIcon('', tab.id)
                    }
                })
            })
        }
    }, 1000)
}

partyTime()