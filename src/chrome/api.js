/*global chrome*/

export async function query(options) {
  return await chrome.tabs.query(options);
}

export function executeScript(tabId, files) {
  chrome.scripting.executeScript({
    target: { tabId },
    files,
  });
}

export function insertCSS(tabId, files) {
  chrome.scripting.insertCSS({
    target: { tabId },
    files,
  });
}

export function addMessageListener(response) {
  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
  ) {
    switch (message.type) {
      case 'getSelectedElements':
        if (typeof response === 'function') {
          const selectedElements = response();
          sendResponse(selectedElements);
        }
        break;
      default:
        console.error('Unrecognised message: ', message);
    }
  });
}
