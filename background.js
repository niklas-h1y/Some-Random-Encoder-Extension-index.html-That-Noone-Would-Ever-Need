const MENU_ENCODE = 'sound-script-encode';
const MENU_DECODE = 'sound-script-decode';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: MENU_ENCODE, title: 'Encode selected text with Sound / Script', contexts: ['selection'] });
    chrome.contextMenus.create({ id: MENU_DECODE, title: 'Decode selected text with Sound / Script', contexts: ['selection'] });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id || !info.selectionText) return;
  const mode = info.menuItemId === MENU_DECODE ? 'decode' : 'encode';
  chrome.tabs.sendMessage(tab.id, { type: 'convert-selection', text: info.selectionText, mode }, () => {
    // Some restricted pages (for example chrome:// pages) do not accept content scripts.
    void chrome.runtime.lastError;
  });
});