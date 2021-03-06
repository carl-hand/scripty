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

export function addMessageListener(listener) {
  chrome.runtime.onMessage.addListener(listener);
}

/**
 * Sends a single message to the content script(s) in the specified tab,
 * with an optional callback to run when a response is sent back.
 * Calling this method results in the runtime.onMessage event being fired in each
 * content script running in the specified tab for the current extension
 *
 * @param {*} id this is the id of the currently active tab
 * @param {*} message the message we are sending
 * @param {*} callback the method to execute when a response is sent back
 */
export function sendMessage(id, message, callback) {
  chrome.tabs.sendMessage(id, message, function (response) {
    if (typeof callback === 'function') {
      callback(response);
    }
  });
}
