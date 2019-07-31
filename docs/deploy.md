# Feri Extension - Deploy

Deploy guide for the Feri web browser extension that connects to [Feri](https://github.com/nightmode/feri) and automatically reloads a browser tab when files change.

## Navigation

* [Overview](../README.md#overview)
* [Install](../README.md#install)
* [Usage](usage.md#usage)
* [Development](development.md#development)
* Deploy
* [Thanks](../README.md#thanks)
* [Support](../README.md#support)

## Deploy

Instructions mostly for myself but please feel free to use them if you are forking this repo and plan on publishing your own extension.

No matter which platform you are deploying on, make sure the `debug` setting inside `deploy/js/background.js` is set to `false`. If left on, the user's extension will spend time logging information they will never see. Even worse, the user could potentially trigger two or more popup windows which leads to a bad edge case where only one popup works.

### Deploy for Chrome

Edit `deploy/manifest.json` and temporarily remove the `browser_specific_settings` object which causes errors in Chrome.

Zip up everything in the `deploy` directory and set the zip file aside for a moment.

Restore `manifest.json` so it includes the previously removed `browser_specific_settings` object.

Upload the zip file to the Chrome Web Store via the [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

### Deploy for Firefox

Check `deploy/manifest.json` and make sure the `browser_specific_settings` > `geko` > `id` string is related to the add-on developer account you will be using.

Zip up everything in the `deploy` directory.

Upload the zip file to the Firefox Add-ons site via the [Developer Hub](https://addons.mozilla.org/en-US/developers/addons).

## License

MIT © [Kai Nightmode](https://twitter.com/kai_nightmode)