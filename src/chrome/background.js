/*global chrome*/

let currentWindow;
chrome.action.onClicked.addListener(async function (tab) {
  // Create a new window instead of a popup
  if (currentWindow) {
    console.log(currentWindow.id);
    chrome.windows.remove(currentWindow.id);
  }
  currentWindow = await chrome.windows.create({
    url: chrome.runtime.getURL('index.html'),
    type: 'popup',
    height: 600,
    width: 450,
    tabId: tab.id,
  });
  console.log(`id: ${tab.id}`);
});

// background.js
chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    console.log('onDisconnect');
    // Do stuff that should happen when popup window closes here
  });
});
