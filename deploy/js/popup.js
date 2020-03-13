'use strict'

//-----------
// Variables
//-----------
const local = {
    'element': {
        'buttonConfig'    : document.getElementById('button_config'),
        'buttonConnect'   : document.getElementById('button_connect'),
        'buttonDisconnect': document.getElementById('button_disconnect'),
        'buttonReconnect' : document.getElementById('button_reconnect'),
        'buttonSave'      : document.getElementById('button_save'),
        'configArea'      : document.getElementById('config_area'),
        'displayAssociate': document.getElementById('display_associate'),
        'displayError'    : document.getElementById('display_error'),
        'displayStatus'   : document.getElementById('display_status'),
        'inputPort'       : document.getElementById('input_port'),
        'inputServer'     : document.getElementById('input_server')
    },
    'function': { // will hold various functions
        // addListeners
        // clearAssociate
        // clearError
        // checkDebug
        // checkStatus
        // listenerBrowserRuntimeMessage
        // listenerBrowserWindowsFocusChanged
        // listenerButtonConfigClick
        // listenerButtonConnectClick
        // listenerButtonDisconnectClick
        // listenerButtonReconnectClick
        // listenerButtonSaveClick
        // listenerInputPortInput
        // listenerInputPortKeydown
        // listenerInputServerInput
        // listenerInputServerKeydown
        // setStatus
        // start
        // storageGet
        // storageSet
    },
    'option': { // defaults for user customizable values which may get replaced with values from storage
        'port'  : '4000',      // default
        'server': 'local.test' // default
    },
    'setting': { // settings used internally, not customizable by the user
        'debug'   : false, // default which may be set to true by checkDebug()
        'tabID'   : 0, // will be set to the current tab ID
        'windowID': 0  // will be set to the current window ID
    },
    'troubleshoot': null // generic troubleshooting placeholder
} // local

//-----------
// Functions
//-----------
const addListeners = local.function.addListeners = function addListeners() {
    browser.runtime.onMessage.addListener(listenerBrowserRuntimeMessage)

    browser.windows.onFocusChanged.addListener(listenerBrowserWindowsFocusChanged)

    local.element.buttonConfig.addEventListener('click', listenerButtonConfigClick)
    local.element.buttonConnect.addEventListener('click', listenerButtonConnectClick)
    local.element.buttonDisconnect.addEventListener('click', listenerButtonDisconnectClick)
    local.element.buttonReconnect.addEventListener('click', listenerButtonReconnectClick)
    local.element.buttonSave.addEventListener('click', listenerButtonSaveClick)

    local.element.inputPort.addEventListener('input', listenerInputPortInput)
    local.element.inputPort.addEventListener('keydown', listenerInputPortKeydown)
    local.element.inputServer.addEventListener('input', listenerInputServerInput)
    local.element.inputServer.addEventListener('keydown', listenerInputServerKeydown)
} // addListeners

const clearAssociate = local.function.clearAssociate = function clearAssociate() {
    local.element.displayAssociate.style.display = 'none'

    // loop through and remove any sub elements
    while (local.element.displayAssociate.lastChild) {
        local.element.displayAssociate.removeChild(local.element.displayAssociate.lastChild)
    }
} // clearAssociate

const clearError = local.function.clearError = function clearError() {
    local.element.displayError.style.display = 'none'

    // loop through and remove any sub elements
    while (local.element.displayError.lastChild) {
        local.element.displayError.removeChild(local.element.displayError.lastChild)
    }
} // clearError

const checkDebug = local.function.checkDebug = async function checkDebug() {
    local.setting.debug = await browser.runtime.sendMessage({ action: 'debug' })
} // checkDebug

const checkStatus = local.function.checkStatus = async function checkStatus() {
    const response = await browser.runtime.sendMessage({ action: 'set_status' })

    setStatus(response)
} // checkStatus

const listenerBrowserRuntimeMessage = local.function.listenerBrowserRuntimeMessage = function listenerBrowserRuntimeMessage(request, sender) {
    log('listenerBrowserRuntimeMessage -> request', request)

    setStatus(request)

    return Promise.resolve('ok')
} // listenerBrowserRuntimeMessage

const listenerBrowserWindowsFocusChanged = local.function.listenerBrowserWindowsFocusChanged = function listenerBrowserWindowsFocusChanged(changedWindowID) {
    if (local.setting.debug === false) {
        if (changedWindowID !== local.setting.windowID) {
            // close this popup whenever window focus changes away from this popups parent window
            // solves the edge case where having an open popup in one window can cause a second open popup in another window to not receive messages
            window.close()
        }
    }
} // listenerBrowserWindowsFocusChanged

const listenerButtonConfigClick = local.function.listenerButtonConfigClick = async function listenerButtonConfigClick(e) {
    clearError()

    if (local.element.inputServer.placeholder !== local.option.server) {
        local.element.inputServer.value = local.option.server
    } else {
        local.element.inputServer.value = '' // prefer placeholder for default values
    }

    if (local.element.inputPort.placeholder !== local.option.port) {
        local.element.inputPort.value = local.option.port
    } else {
        local.element.inputPort.value = '' // prefer placeholder for default values
    }

    local.element.configArea.style.display = 'block'

    local.element.buttonConfig.style.display = 'none'
    local.element.buttonSave.style.display = 'inline-block'

    const response = await browser.runtime.sendMessage({ action: 'extension_off' })

    log('listenerButtonConfigClick -> response', response)

    local.element.displayStatus.textContent = browser.i18n.getMessage('config')
} // listenerButtonConfigClick

const listenerButtonConnectClick = local.function.listenerButtonConnectClick = async function listenerButtonConnectClick(e) {
    clearError()

    local.element.buttonConnect.blur()

    local.element.displayStatus.textContent = browser.i18n.getMessage('connecting')

    local.element.buttonConnect.style.display = 'none'
    local.element.buttonDisconnect.style.display = 'inline-block'

    const response = await browser.runtime.sendMessage({ action: 'extension_on', currentTabID: local.setting.tabID, currentWindowID: local.setting.windowID })

    log('listenerButtonConnectClick -> response', response)
} // listenerButtonConnectClick

const listenerButtonDisconnectClick = local.function.listenerButtonDisconnectClick = async function listenerButtonDisconnectClick(e) {
    clearError()

    local.element.buttonDisconnect.blur()

    const response = await browser.runtime.sendMessage({ action: 'extension_off' })

    log('listenerButtonDisconnectClick -> response', response)
} // listenerButtonDisconnectClick

const listenerButtonReconnectClick = local.function.listenerButtonReconnectClick = async function listenerButtonReconnectClick(e) {
    clearError()

    local.element.buttonReconnect.blur()

    local.element.displayStatus.textContent = browser.i18n.getMessage('connecting')

    local.element.buttonReconnect.style.display = 'none'
    local.element.buttonDisconnect.style.display = 'inline-block'

    const response = await browser.runtime.sendMessage({ action: 'extension_on', currentTabID: local.setting.tabID, currentWindowID: local.setting.windowID })

    log('listenerButtonReconnectClick -> response', response)
} // listenerButtonReconnectClick

const listenerButtonSaveClick = local.function.listenerButtonSaveClick = function listenerButtonSaveClick(e) {
    clearError()

    local.element.displayStatus.textContent = browser.i18n.getMessage('configSaved')

    local.element.configArea.style.display = 'none'

    local.element.buttonConfig.style.display = 'inline-block'
    local.element.buttonSave.style.display = 'none'
} // listenerButtonSaveClick

const listenerInputPortInput = local.function.listenerInputPortInput = async function listenerInputPortInput(e) {
    local.option.port = local.element.inputPort.value || local.element.inputPort.placeholder

    await storageSet({'port': local.option.port})
} // listenerInputPortInput

const listenerInputPortKeydown = local.function.listenerInputPortKeydown = function listenerInputPortKeydown(e) {
    if (e.key === 'Tab') {
        e.preventDefault()
        local.element.inputServer.focus()
    }

    if (e.key === 'Enter') {
        local.element.buttonSave.click()
    }
} // listenerInputPortKeydown

const listenerInputServerInput = local.function.listenerInputServerInput = async function listenerInputServerInput(e) {
    local.option.server = local.element.inputServer.value.replace(/:/g, '') || local.element.inputServer.placeholder

    await storageSet({'server': local.option.server})
} // listenerInputServerInput

const listenerInputServerKeydown = local.function.listenerInputServerKeydown = function listenerInputServerKeydown(e) {
    if (e.key === 'Enter') {
        local.element.buttonSave.click()
    }
} // listenerInputServerKeydown

const setStatus = local.function.setStatus = function setStatus(obj) {
    switch(obj.action) {
        case 'set_status_connected':
            local.element.displayStatus.textContent = browser.i18n.getMessage('connected')

            local.element.buttonConnect.style.display = 'none'
            local.element.buttonDisconnect.style.display = 'inline-block'
            local.element.buttonReconnect.style.display = 'none'

            clearError()
            clearAssociate()

            if (local.setting.tabID !== obj.browserTabID) {
                const elementParagraph1 = document.createElement('p')
                elementParagraph1.textContent = browser.i18n.getMessage('notAssociated')

                const elementLink1 = document.createElement('a')
                elementLink1.id = 'associate_here'
                elementLink1.textContent = browser.i18n.getMessage('notAssociatedLinkOne')

                const elementText1 = document.createTextNode(' ' + browser.i18n.getMessage('notAssociatedOr') + ' ')

                const elementLink2 = document.createElement('a')
                elementLink2.id = 'associate_return'
                elementLink2.textContent = browser.i18n.getMessage('notAssociatedLinkTwo')

                const elementText2 = document.createTextNode('.')

                const elementParagraph2 = document.createElement('p')
                elementParagraph2.appendChild(elementLink1)
                elementParagraph2.appendChild(elementText1)
                elementParagraph2.appendChild(elementLink2)
                elementParagraph2.appendChild(elementText2)

                local.element.displayAssociate.appendChild(elementParagraph1)
                local.element.displayAssociate.appendChild(elementParagraph2)

                document.getElementById('associate_here').addEventListener('click', async function(e) {
                    e.preventDefault()

                    const win = await browser.windows.getCurrent()
                    const currentWindowID = win.id

                    // send message to background.js to set the active tab id to currentTabID and update the icons, yadda yadda
                    const response = await browser.runtime.sendMessage({ action: 'associate_tab', currentTabID: local.setting.tabID, currentWindowID: currentWindowID })

                    log('setStatus -> associate_here event -> response ->', response)
                    window.close()
                })

                document.getElementById('associate_return').addEventListener('click', function(e) {
                    e.preventDefault()
                    browser.windows.update(obj.windowID, { focused: true })
                    browser.tabs.update(obj.browserTabID, { active: true })
                    window.close()
                })

                local.element.displayAssociate.style.display = 'block'
            }

            break
        case 'set_status_disconnected':
            local.element.displayStatus.textContent = browser.i18n.getMessage('disconnected')

            local.element.buttonConnect.style.display = 'inline-block'
            local.element.buttonDisconnect.style.display = 'none'
            local.element.buttonReconnect.style.display = 'none'

            clearError()
            clearAssociate()

            break
        case 'set_status_lost_connection':
            local.element.displayStatus.textContent = browser.i18n.getMessage('lostConnection')

            local.element.buttonConnect.style.display = 'none'
            local.element.buttonDisconnect.style.display = 'none'
            local.element.buttonReconnect.style.display = 'inline-block'

            clearError()
            clearAssociate()

            break
        case 'set_status_connection_error':
            local.element.displayStatus.textContent = browser.i18n.getMessage('connectionError')

            local.element.buttonConnect.style.display = 'inline-block'
            local.element.buttonDisconnect.style.display = 'none'
            local.element.buttonReconnect.style.display = 'none'
            local.element.buttonConfig.style.display = 'inline-block'
            local.element.buttonSave.style.display = 'none'

            config_area.style.display = 'none'

            clearError()
            clearAssociate()

            const elementOne = document.createElement('p')
            elementOne.textContent = browser.i18n.getMessage('connectionHelp').replace('{server}', local.option.server).replace('{port}', local.option.port)

            const elementTwo = document.createElement('p')
            elementTwo.textContent = browser.i18n.getMessage('connectionHelpContinued')

            local.element.displayError.appendChild(elementOne)
            local.element.displayError.appendChild(elementTwo)

            local.element.displayError.style.display = 'block'

            break
        default:
            log('setStatus -> unrecognized status', status)
    }
} // setStatus

const start = local.function.start = async function start() {
    addListeners()

    await checkDebug()

    // read from storage or use defaults
    local.option.server = await storageGet('server') || local.option.server
    local.option.port   = await storageGet('port')   || local.option.port

    const win = await browser.windows.getCurrent()
    local.setting.windowID = win.id

    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    local.setting.tabID = tabs[0].id

    await checkStatus()
} // start

const storageGet = local.function.storageGet = async function storageGet(key) {
    const obj = await browser.storage.local.get(key)
    // obj can be an empty object {}
    // obj will never be undefined
    return obj[key] // an object key however, can be undefined
} // storageGet

const storageSet = local.function.storageSet = async function storageSet(obj) {
    await browser.storage.local.set(obj)
} // storageSet

//-------
// Start
//-------
start()