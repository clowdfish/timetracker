var port;
var state;

var settingsObject = {};

chrome.runtime.onConnect.addListener(function(_port) {

  if(_port != null && _port.name == "optionsChannel") {
    port = _port;

    port.onMessage.addListener(function (msg) {
      for(var storageKey in msg) {
        if(msg.hasOwnProperty(storageKey))
          settingsObject[storageKey] = msg[storageKey];
      }
    });

    port.onDisconnect.addListener(function() {
      storeSettings(settingsObject);
      settingsObject = {};
      port = null;
    });
  }

  if(_port != null && _port.name == "stateChannel") {
    state = _port;

    state.onMessage.addListener(function (msg) {
      storeSettings({ 'state': msg['state'] });
    });

    state.onDisconnect.addListener(function() {
      state = null;
    });
  }
});

/**
 * Store settings object to Chrome storage.
 *
 * @param settingsObject
 */
function storeSettings(settingsObject) {
  if(settingsObject)
    chrome.storage.sync.set(settingsObject,
      function() {});
}