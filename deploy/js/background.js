'use strict'

//-----------
// Variables
//-----------
let sock // will be an instance of WebSocket

let host = 'local.test' // can be set by popup.html
let port = '4000'       // can be set by popup.html

let defaultDocument = 'index.html' // can be changed by sock.onmessage

let browserTabID = 0 // will be set to a positive integer once the extension is on and listening for changed files from the build tool

let pingAttempt = 0 // will increment every time a ping request is sent from the extension, will be reset to 0 when a pong response is received from the server
let pingTimer = null // will be a setInterval object

let troubleshoot = {} // generic troubleshooting object

//-----------
// Functions
//-----------
function checkConnection() {
    if (pingAttempt >= 3) {
        console.log('checkConnection -> three or more ping attempts failed')
        disconnect()
    } else {
        if (sock.readyState === 1) { // open
            pingAttempt += 1
            sock.send("ping")
        } else {
            // socket is no longer open
            console.log('checkConnection -> socket is no longer open')
            disconnect()
        }
    }
}

function connect() {
    // try to disconnect first
    disconnect()

    sock = new WebSocket('ws://' + host + ':' + port)

    // one time event
    sock.onopen = function (event) {
        // sock.send("hi from client")

        // check connection every 10 seconds
        pingTimer = setInterval(checkConnection, 10000)
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

        // check and optionally set the host
        if (data.hasOwnProperty('host')) {
            if (typeof data.host === 'string') {
                if (data.host.trim().length > 0) {
                    host = data.host.trim()
                }
            }
        }

        // check and optionally set the port
        if (data.hasOwnProperty('port')) {
            if (typeof data.port === 'string') {
                if (data.port.trim().length > 0) {
                    port = data.port.trim()
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
    }
} // connect

function disconnect() {
    clearInterval(pingTimer)

    pingAttempt = 0 // reset to 0

    if (typeof sock === 'object') {
        if (sock.readyState === 1 || sock.readyState === 0) { // open or connecting
            sock.close(1000) // normal closure
        }
    }
} // disconnect

function extension_off() {
    browserTabID = 0
    disconnect()
} // extension_off

function extension_on() {
    chrome.tabs.query({}, function(tabs) {
        troubleshoot.tabs = tabs
        browserTabID = tabs.filter(t => t.active === true)[0].id
        connect()
    })
} // extension_on

function reload() {
    if (browserTabID > 0) {
        chrome.tabs.reload(browserTabID, { bypassCache: true }, function(callback) {
            console.log('reload -> browserTabID ' + browserTabID + ' reloaded')
        }) // first param is tab id
    } else {
        console.log('reload -> browserTabID is not greater than 0')
    }
} // reload

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

//-----------------
// Message Passing
//-----------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('chrome.runtime.onMessage -> ', request)

    switch(request.action) {
        case 'extension_on':
            extension_on()
            break
        case 'extension_off':
            extension_off()
            break
        // case 'reload':
        //     reload()
        //     break
        default:
            console.log('chrome.runtime.onMessage -> unrecognized action "' + request.action + '"')
    }

    sendResponse('thanks from background.js')
})

//------------
// Party Time
//------------
async function partyTime() {
    await storageSet({'feri_host': 'local.test'})
    await storageSet({'feri_port': '5000'})
}

partyTime()