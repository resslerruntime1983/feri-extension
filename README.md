# Feri Extension

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/feri.png" width="420" height="447" align="right" alt="">

A web browser extension that connects to [Feri](https://github.com/nightmode/feri) and automatically reloads a browser tab when files change.

## Navigation

* [Overview](#overview)
* [Install](#install)
* [Usage](docs/usage.md)
* [Development](#develop)
* [Deploy](#deploy)
* [Thanks](#thanks)
* [Support](#support)

## Overview

The purpose of this extension is to allow hands-free reloading of a web browser tab when files monitored by [Feri](https://github.com/nightmode/feri) change. This can greatly speed up the development cycle of local files or even better, files served by a web server you control.

Advanced features like CSS hot reloading and smart reloading are being considered for future versions. If you absolutely need those features today, a more complex browser extension may suit you better.

## Install

For Chrome, install via the `Feri` page on the [Chrome Web Store](https://chrome.google.com/webstore/search/feri).

For Firefox, install via the `Feri` page on the [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/feri/) site.

## Usage

Visit the [usage guide](docs/usage.md) for more info.

## Development

Instructions for anyone who will be working with or forking this repo.

### Development in Chrome

Navigate to `chrome://extensions` and enable `developer mode`.

Use `load unpacked` and select `deploy` as the extension folder.

### Development in Firefox

Navigate to `about:debugging` and enable `add-on debugging`.

Use `load temporary add-on` and select the `manifest.json` file within the `deploy` folder.

## Deploy

Instructions mostly for myself but please feel free to use them if you are forking this repo and plan on publishing your own extension.

### Deploy for Chrome

Everything in the `deploy` directory should be zipped and then uploaded via the Chrome Web Store's [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

### Deploy for Firefox

...

## Thanks

Thanks to [Font Awesome](https://fontawesome.com/license) for providing the icons used for this project. Icons were modified slightly during development so you may wish to refer to the [original icons](https://fontawesome.com/icons?d=gallery) for your own use.

## Support

Help [support this project](https://www.patreon.com/nightmode) on Patreon. Help me caretake and craft new software, videos, and interactive art. All for as little as $1 a month.

In addition to Patreon, here are some other ways you can help this project.

* [Report any issues](https://github.com/nightmode/feri-extension/issues) on GitHub.
* Language Translations.

## License

MIT © [Kai Nightmode](https://twitter.com/kai_nightmode)