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

export function addMessageListener(getSelectedElements, addEntry) {
  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
  ) {
    switch (message.type) {
      case 'getSelectedElements':
        if (typeof getSelectedElements === 'function') {
          const selectedElements = getSelectedElements();
          sendResponse(selectedElements);
        }
        break;
      case 'logData':
        if (typeof addEntry === 'function') {
          const entry = {
            type: 'logData',
          };
          addEntry(entry);
        }
        break;
      default:
        console.error('Unrecognised message: ', message);
    }
  });
}
