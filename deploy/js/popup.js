'use strict'

//-----------
// Variables
//-----------
const configArea       = document.getElementById('config_area')
const displayAssociate = document.getElementById('display_associate')
const displayError     = document.getElementById('display_error')
const displayStatus    = document.getElementById('display_status')
const buttonConfig     = document.getElementById('button_config')
const buttonConnect    = document.getElementById('button_connect')
const buttonDisconnect = document.getElementById('button_disconnect')
const buttonReconnect  = document.getElementById('button_reconnect')
const buttonSave       = document.getElementById('button_save')
const inputServer      = document.getElementById('input_server')
const inputPort        = document.getElementById('input_port')

let server = 'local.test' // default
let port   = '4000'       // default

let tabID    = 0 // will be set to the current tab ID
let windowID = 0 // will be set to the current window ID

//-----------
// Functions
//-----------
function clearError() {
    displayError.innerHTML = ''
} // clearError

function checkStatus() {
    chrome.runtime.sendMessage({ action: 'status' }, function(response) {
        // do nothing
        setStatus(response)
    })
} // checkStatus

function setStatus(obj) {
    switch(obj.action) {
        case 'set_status_connected':
            displayStatus.innerText = chrome.i18n.getMessage('connected')

            buttonConnect.style.display = 'none'
            buttonDisconnect.style.display = 'inline-block'
            buttonReconnect.style.display = 'none'

            display_error.style.display = 'none'
            display_error.innerText = ''

            displayAssociate.style.display = 'none'
            displayAssociate.innerText = ''

            if (tabID !== obj.browserTabID) {
                display_associate.innerHTML = '<p>' + chrome.i18n.getMessage('notAssociated') + '</p><p>' + chrome.i18n.getMessage('notAssociatedLinks') + '</p>'

                document.getElementById('associate_here').addEventListener('click', function(e) {
                    e.preventDefault()

                    chrome.windows.getCurrent(function(win) {
                        let currentWindowID = win.id

                        // send message to background.js to set the active tab id to currentTabID and update the icons, yadda yadda
                        chrome.runtime.sendMessage({ action: 'associate_tab', currentTabID: tabID, currentWindowID: currentWindowID }, function(response) {
                            console.log(response)
                            window.close()
                        })
                    })
                })

                document.getElementById('associate_return').addEventListener('click', function(e) {
                    e.preventDefault()
                    chrome.windows.update(obj.windowID, { focused: true })
                    chrome.tabs.update(obj.browserTabID, { active: true })
                    window.close()
                })

                display_associate.style.display = 'block'
            }

            break
        case 'set_status_disconnected':
            displayStatus.innerText = chrome.i18n.getMessage('disconnected')

            buttonConnect.style.display = 'inline-block'
            buttonDisconnect.style.display = 'none'
            buttonReconnect.style.display = 'none'

            display_error.style.display = 'none'
            display_error.innerText = ''

            displayAssociate.style.display = 'none'
            displayAssociate.innerText = ''

            break
        case 'set_status_lost_connection':
            displayStatus.innerText = chrome.i18n.getMessage('lostConnection')

            buttonConnect.style.display = 'none'
            buttonDisconnect.style.display = 'none'
            buttonReconnect.style.display = 'inline-block'

            display_error.style.display = 'none'
            display_error.innerText = ''

            displayAssociate.style.display = 'none'
            displayAssociate.innerText = ''

            break
        case 'set_status_connection_error':
            displayStatus.innerText = chrome.i18n.getMessage('connectionError')

            buttonConnect.style.display = 'inline-block'
            buttonDisconnect.style.display = 'none'
            buttonReconnect.style.display = 'none'
            buttonConfig.style.display = 'inline-block'
            buttonSave.style.display = 'none'

            config_area.style.display = 'none'

            display_error.style.display = 'block'
            display_error.innerHTML = '<p>' + chrome.i18n.getMessage('connectionHelp').replace('[server]', server).replace('[port]', port) + '</p><p>' + chrome.i18n.getMessage('connectionHelpContinued') + '</p>'

            displayAssociate.style.display = 'none'
            displayAssociate.innerText = ''

            break
        default:
            console.log('status -> unrecognized status "' + status + '"')
    }
} // status

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

//---------
// Buttons
//---------

// connect button
buttonConnect.addEventListener('click', function(e) {
    clearError()

    buttonConnect.blur()

    displayStatus.innerText = chrome.i18n.getMessage('connecting')

    chrome.runtime.sendMessage({ action: 'extension_on', currentTabID: tabID, currentWindowID: windowID }, function(response) {
        console.log(response)
    })
})

// disconnect button
buttonDisconnect.addEventListener('click', function(e) {
    clearError()

    buttonDisconnect.blur()

    chrome.runtime.sendMessage({ action: 'extension_off' }, function(response) {
        console.log(response)
    })
})

// reconnect button
buttonReconnect.addEventListener('click', function(e) {
    clearError()

    buttonReconnect.blur()

    displayStatus.innerText = chrome.i18n.getMessage('connecting')

    chrome.runtime.sendMessage({ action: 'extension_on', currentTabID: tabID, currentWindowID: windowID }, function(response) {
        console.log(response)
    })
})

// config button
buttonConfig.addEventListener('click', async function(e) {
    clearError()

    if (inputServer.placeholder !== server) {
        inputServer.value = server
    } else {
        inputServer.value = '' // prefer placeholder for default values
    }

    if (inputPort.placeholder !== port) {
        inputPort.value = port
    } else {
        inputPort.value = '' // prefer placeholder for default values
    }

    configArea.style.display = 'block'

    buttonConfig.style.display = 'none'
    buttonSave.style.display = 'inline-block'

    chrome.runtime.sendMessage({ action: 'extension_off' }, function(response) {
        console.log(response)
        displayStatus.innerText = chrome.i18n.getMessage('config')
    })
})

// save button
buttonSave.addEventListener('click', function(e) {
    clearError()

    displayStatus.innerText = chrome.i18n.getMessage('configSaved')

    configArea.style.display = 'none'

    buttonConfig.style.display = 'inline-block'
    buttonSave.style.display = 'none'

    setTimeout(function() {
        checkStatus()
    }, 1250)
})

//---------------
// Config Inputs
//---------------
inputServer.addEventListener('input', async function(e) {
    server = inputServer.value.replace(/:/g, '') || inputServer.placeholder

    await storageSet({'server': server})
})

inputServer.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        buttonSave.click()
    }
})

inputPort.addEventListener('input', async function(e) {
    port = inputPort.value || inputPort.placeholder

    await storageSet({'port': port})
})

inputPort.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault()
        inputServer.focus()
    }

    if (e.key === 'Enter') {
        buttonSave.click()
    }
})

//-------------------
// Incoming Messages
//-------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('chrome.runtime.onMessage -> ', request)

    setStatus(request)

    sendResponse('ok')
})

//------------
// Party Time
//------------
async function partyTime() {
    // read from storage or use defaults
    server = await storageGet('server') || server
    port = await storageGet('port') || port

    chrome.windows.getCurrent(function(win) {
        windowID = win.id

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            tabID = tabs[0].id

            checkStatus()
        })
    })
}

partyTime()