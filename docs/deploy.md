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

Everything in the `deploy` directory should be zipped and then uploaded via the Chrome Web Store's [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

### Deploy for Firefox

...

## License

MIT © [Kai Nightmode](https://twitter.com/kai_nightmode)