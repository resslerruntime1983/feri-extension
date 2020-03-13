'use strict'

//---------------------------
// Variables for Development
//---------------------------
let debug = false // Allow console logging and inspecting popups with dev tools in Chrome. Will be set by sending a message to background.js so leave this line with the default value of false for deployment safety.

let troubleshoot = {} // generic troubleshooting object

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

//-----------
// Functions
//-----------
function clearAssociate() {
    displayAssociate.style.display = 'none'

    // loop through and remove any sub elements
    while (displayAssociate.lastChild) {
        displayAssociate.removeChild(displayAssociate.lastChild)
    }
} // clearAssociate

function clearError() {
    displayError.style.display = 'none'

    // loop through and remove any sub elements
    while (displayError.lastChild) {
        displayError.removeChild(displayError.lastChild)
    }
} // clearError

async function checkDebug() {
    debug = await browser.runtime.sendMessage({ action: 'debug' })
} // checkDebug

async function checkStatus() {
    let response = await browser.runtime.sendMessage({ action: 'status' })
    setStatus(response)
} // checkStatus

function setStatus(obj) {
    switch(obj.action) {
        case 'set_status_connected':
            displayStatus.textContent = browser.i18n.getMessage('connected')

            buttonConnect.style.display = 'none'
            buttonDisconnect.style.display = 'inline-block'
            buttonReconnect.style.display = 'none'

            clearError()
            clearAssociate()

            if (tabID !== obj.browserTabID) {
                let elementParagraph1 = document.createElement('p')
                elementParagraph1.textContent = browser.i18n.getMessage('notAssociated')

                let elementLink1 = document.createElement('a')
                elementLink1.id = 'associate_here'
                elementLink1.textContent = browser.i18n.getMessage('notAssociatedLinkOne')

                let elementText1 = document.createTextNode(' ' + browser.i18n.getMessage('notAssociatedOr') + ' ')

                let elementLink2 = document.createElement('a')
                elementLink2.id = 'associate_return'
                elementLink2.textContent = browser.i18n.getMessage('notAssociatedLinkTwo')

                let elementText2 = document.createTextNode('.')

                let elementParagraph2 = document.createElement('p')
                elementParagraph2.appendChild(elementLink1)
                elementParagraph2.appendChild(elementText1)
                elementParagraph2.appendChild(elementLink2)
                elementParagraph2.appendChild(elementText2)

                displayAssociate.appendChild(elementParagraph1)
                displayAssociate.appendChild(elementParagraph2)

                document.getElementById('associate_here').addEventListener('click', async function(e) {
                    e.preventDefault()

                    let win = await browser.windows.getCurrent()
                    let currentWindowID = win.id

                    // send message to background.js to set the active tab id to currentTabID and update the icons, yadda yadda
                    let response = await browser.runtime.sendMessage({ action: 'associate_tab', currentTabID: tabID, currentWindowID: currentWindowID })

                    log(response)
                    window.close()
                })

                document.getElementById('associate_return').addEventListener('click', function(e) {
                    e.preventDefault()
                    browser.windows.update(obj.windowID, { focused: true })
                    browser.tabs.update(obj.browserTabID, { active: true })
                    window.close()
                })

                displayAssociate.style.display = 'block'
            }

            break
        case 'set_status_disconnected':
            displayStatus.textContent = browser.i18n.getMessage('disconnected')

            buttonConnect.style.display = 'inline-block'
            buttonDisconnect.style.display = 'none'
            buttonReconnect.style.display = 'none'

            clearError()
            clearAssociate()

            break
        case 'set_status_lost_connection':
            displayStatus.textContent = browser.i18n.getMessage('lostConnection')

            buttonConnect.style.display = 'none'
            buttonDisconnect.style.display = 'none'
            buttonReconnect.style.display = 'inline-block'

            clearError()
            clearAssociate()

            break
        case 'set_status_connection_error':
            displayStatus.textContent = browser.i18n.getMessage('connectionError')

            buttonConnect.style.display = 'inline-block'
            buttonDisconnect.style.display = 'none'
            buttonReconnect.style.display = 'none'
            buttonConfig.style.display = 'inline-block'
            buttonSave.style.display = 'none'

            config_area.style.display = 'none'

            clearError()
            clearAssociate()

            let elementOne = document.createElement('p')
            elementOne.textContent = browser.i18n.getMessage('connectionHelp').replace('{server}', server).replace('{port}', port)

            let elementTwo = document.createElement('p')
            elementTwo.textContent = browser.i18n.getMessage('connectionHelpContinued')

            displayError.appendChild(elementOne)
            displayError.appendChild(elementTwo)

            displayError.style.display = 'block'

            break
        default:
            log('status -> unrecognized status "' + status + '"')
    }
} // status

async function storageGet(key) {
    let obj = await browser.storage.local.get(key)
    // obj can be an empty object {}
    // obj will never be undefined
    return obj[key] // an object key however, can be undefined
} // storageGet

async function storageSet(obj) {
    await browser.storage.local.set(obj)
} // storageSet

//---------
// Buttons
//---------

// connect button
buttonConnect.addEventListener('click', async function(e) {
    clearError()

    buttonConnect.blur()

    displayStatus.textContent = browser.i18n.getMessage('connecting')

    buttonConnect.style.display = 'none'
    buttonDisconnect.style.display = 'inline-block'

    let response = await browser.runtime.sendMessage({ action: 'extension_on', currentTabID: tabID, currentWindowID: windowID })

    log(response)
})

// disconnect button
buttonDisconnect.addEventListener('click', async function(e) {
    clearError()

    buttonDisconnect.blur()

    let response = await browser.runtime.sendMessage({ action: 'extension_off' })

    log(response)
})

// reconnect button
buttonReconnect.addEventListener('click', async function(e) {
    clearError()

    buttonReconnect.blur()

    displayStatus.textContent = browser.i18n.getMessage('connecting')

    buttonReconnect.style.display = 'none'
    buttonDisconnect.style.display = 'inline-block'

    let response = await browser.runtime.sendMessage({ action: 'extension_on', currentTabID: tabID, currentWindowID: windowID })

    log(response)
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

    let response = await browser.runtime.sendMessage({ action: 'extension_off' })

    log(response)

    displayStatus.textContent = browser.i18n.getMessage('config')
})

// save button
buttonSave.addEventListener('click', function(e) {
    clearError()

    displayStatus.textContent = browser.i18n.getMessage('configSaved')

    configArea.style.display = 'none'

    buttonConfig.style.display = 'inline-block'
    buttonSave.style.display = 'none'
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
browser.runtime.onMessage.addListener(function(request, sender) {
    log('browser.runtime.onMessage -> ', request)

    setStatus(request)

    return Promise.resolve('ok')
})

//------------
// Party Time
//------------
async function partyTime() {
    await checkDebug()

    if (debug === false) {
        browser.windows.onFocusChanged.addListener(function(changedWindowID) {
            if (changedWindowID !== windowID) {
                // close this popup whenever window focus changes away from this popups parent window
                // solves the edge case where having an open popup in one window can cause a second open popup in another window to not receive messages
                window.close()
            }
        })
    }

    // read from storage or use defaults
    server = await storageGet('server') || server
    port = await storageGet('port') || port

    let win = await browser.windows.getCurrent()
    windowID = win.id

    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    tabID = tabs[0].id

    await checkStatus()
}

partyTime()