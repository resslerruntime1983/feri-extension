# Feri Extension - Development

Development guide for the Feri browser extension that connects to the [Feri](https://github.com/nightmode/feri) build tool and automatically reloads a browser tab when files change.

## Navigation

* [Overview](../README.md#overview)
* [Install](../README.md#install)
* [Usage](usage.md#usage)
* Development
* [Deploy](deploy.md#deploy)
* [Thanks](../README.md#thanks)
* [Support](../README.md#support)

## Development

Instructions for anyone who will be working with or forking this repo.

No matter which platform you are developing on, make sure `local.setting.log` is `true` in `deploy/js/shared.js`. This will enable console logging for development.

### Development in Chrome

Navigate to `chrome://extensions` and enable `developer mode`.

Use `load unpacked` and select `deploy` as the extension folder.

### Development in Firefox

Navigate to `about:debugging` and enable `add-on debugging`.

Use `load temporary add-on` and select the `manifest.json` file within the `deploy` folder.

## License

MIT © [Kai Nightmode](https://twitter.com/kai_nightmode)

The MIT license does NOT apply to the name `Feri` or any of the images in this repository. Those items are strictly copyrighted to Kai Nightmode.