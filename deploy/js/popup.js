'use strict'

// connect button
document.getElementById('extension_on').addEventListener('click', function(e) {
    chrome.runtime.sendMessage({ action: 'extension_on' }, function(response) {
        console.log(response)
    })
})

// disconnect button
document.getElementById('extension_off').addEventListener('click', function(e) {
    chrome.runtime.sendMessage({ action: 'extension_off' }, function(response) {
        console.log(response)
    })
})

// reload button
// document.getElementById('reload').addEventListener('click', function(e) {
//     chrome.runtime.sendMessage({ action: 'reload' }, function(response) {
//         console.log('reload -> ...')
//         console.log(response)
//     })
// })