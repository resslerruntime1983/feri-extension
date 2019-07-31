# Feri Extension - Usage

Usage guide for the Feri web browser extension that connects to [Feri](https://github.com/nightmode/feri) and automatically reloads a browser tab when files change.

## Navigation

* [Overview](../README.md#overview)
* [Install](../README.md#install)
* Usage
  * [Config, Connect, and Disconnect](#usage)
  * [Connection Error](#connection-error)
  * [Lost Connection](#lost-connection)
  * [Tab Association](#tab-association)
* [Development](development.md#development)
* [Deploy](deploy.md#deploy)
* [Thanks](../README.md#thanks)
* [Support](../README.md#support)

## Usage

Find the Feri icon in your browser toolbar. It should look similar to a browser reload icon.

By default, the Feri icon will be colorless which indicates a disconnected or lost connection state.

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-gray-48.png" width="24" height="24" align="" alt="">


Once a connection is made, the icon for the associated browser tab will turn blue.

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-blue-48.png" width="24" height="24" align="" alt="">

If your Feri build tool is not running or not reachable, you may also see a pink icon which indicates a connection error.

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-pink-48.png" width="24" height="24" align="" alt="">

Any non-associated tabs will always have colorless icons to help you know at a glance which browser tab Feri is or is not associated with.

## Config, Connect, and Disconnect

Click the Feri icon and you'll see the following screen.

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/disconnected.png" width="318" height="354" align="" alt="">

If this is your first time running Feri, you'll want to check the config screen before attempting a connection.

Click the config button (blue wrench below).

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/config-hover.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/config.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/config-save-hover.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/config-saved.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/connect-hover.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/connected.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-blue-48.png" width="24" height="24" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/disconnect-hover.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/disconnected.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-gray-48.png" width="24" height="24" align="" alt="">

...

### Connection Error

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/connection-error.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-pink-48.png" width="24" height="24" align="" alt="">

...

### Lost Connection

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/lost-connection.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-gray-48.png" width="24" height="24" align="" alt="">

...

### Tab Association

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/associate.png" width="318" height="354" align="" alt="">

...

<img src="https://raw.githubusercontent.com/nightmode/feri-extension/master/images/docs/icon-blue-48.png" width="24" height="24" align="" alt="">

...

## License

MIT © [Kai Nightmode](https://twitter.com/kai_nightmode)