/*
  * background.ts
  * --------------
  * Detects a click on the extension icon and sends a message to the content script.
*/

chrome.action.onClicked.addListener((tab) => {
  // send a message to the content script
  chrome.tabs.sendMessage(tab.id!, { message: "extension_icon_clicked" })
    .then(() => { })
    .catch((err) => {
      console.log(err);
    });
});