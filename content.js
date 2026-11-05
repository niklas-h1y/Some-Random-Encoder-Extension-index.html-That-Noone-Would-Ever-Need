(() => {
  // These rules intentionally mirror the phoneticRules array in index.html,
  // in the same order, so page encoding produces the same Sound / Script.
  const phoneticRules = [
    { pattern: /watch/gi, replace: 'ƿætч' },
    { pattern: /changes/gi, replace: 'чanʒes' },
    { pattern: /changed/gi, replace: 'чanʒeΔ' },
    { pattern: /shouting/gi, replace: 'ƩøυtIŋ' },
    { pattern: /thoroughfare/gi, replace: 'þørøυghfare' },
    { pattern: /through/gi, replace: 'þrøυgh' },
    { pattern: /whether/gi, replace: 'ƿheðer' },
    { pattern: /shall/gi, replace: 'ʃall' },
    { pattern: /ship/gi, replace: 'ʃIp' },
    { pattern: /the /gi, replace: 'ðe ' },
    { pattern: /the\b/gi, replace: 'ðe' },
    { pattern: / king/gi, replace: ' kIŋ' },
    { pattern: /queen/gi, replace: 'qυeen' },
    { pattern: /and/gi, replace: 'anΔ' },
    { pattern: /vision/gi, replace: 'vIzøn' },
    { pattern: /w/g, replace: 'ƿ' },
    { pattern: /W/g, replace: 'Ƿ' },
    { pattern: /d/g, replace: 'Δ' },
    { pattern: /m/g, replace: 'ɱ' },
    { pattern: /g/g, replace: 'ʒ' },
    { pattern: /t/g, replace: 't' },
    { pattern: /h/g, replace: 'ч' },
    { pattern: /o/g, replace: 'ø' },
    { pattern: /O/g, replace: 'Ø' },
    { pattern: /a/g, replace: 'υ' },
    { pattern: /i/g, replace: 'I' },
    { pattern: /n/g, replace: 'n' },
    { pattern: /u/g, replace: 'υ' },
    { pattern: /A/g, replace: 'Æ' },
    { pattern: /s/g, replace: 's' }
  ];

  const convert = text => phoneticRules.reduce(
    (value, rule) => value.replace(rule.pattern, rule.replace), text
  );
  const pageMarker = 'data-sound-script-encoded';
  const encodedGlyphs = /[ƿǷΔɱʒчøØυÆƩþðʃŋ]/u;
  const excluded = 'script,style,noscript,textarea,input,select,option,button,[contenteditable],[aria-hidden="true"]';

  function shouldSkip(node) {
    const parent = node.parentElement;
    const value = node.nodeValue || '';
    if (!parent || !value.trim() || parent.closest(excluded) || encodedGlyphs.test(value)) return true;

    for (let element = parent; element && element !== document.documentElement; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return true;
    }
    return false;
  }

  function encodeTextNode(node) {
    if (node?.nodeType !== Node.TEXT_NODE || shouldSkip(node)) return false;
    const before = node.nodeValue;
    const after = convert(before);
    if (after === before) return false;
    node.nodeValue = after;
    return true;
  }

  function encodeSubtree(root) {
    if (!root) return 0;
    if (root.nodeType === Node.TEXT_NODE) return encodeTextNode(root) ? 1 : 0;
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return 0;
    if (root.nodeType === Node.ELEMENT_NODE && (root.matches(excluded) || root.closest(excluded))) return 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let changed = 0;
    let textNode;
    while ((textNode = walker.nextNode())) {
      if (encodeTextNode(textNode)) changed++;
    }
    return changed;
  }

  let observerStarted = false;
  function watchForNewText(root) {
    if (observerStarted) return;
    observerStarted = true;

    // Keep newly inserted or dynamically updated page text encoded until refresh.
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') {
          encodeTextNode(record.target);
        } else {
          for (const addedNode of record.addedNodes) encodeSubtree(addedNode);
        }
      }
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true });
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'encode-page') return;

    if (document.documentElement?.hasAttribute(pageMarker)) {
      sendResponse({ ok: true, alreadyEncoded: true });
      return;
    }

    const root = document.body || document.documentElement;
    if (!root) {
      sendResponse({ ok: false, reason: 'no-document-body' });
      return;
    }

    const changedNodes = encodeSubtree(root);
    document.documentElement?.setAttribute(pageMarker, 'true');
    watchForNewText(root);
    sendResponse({ ok: true, changedNodes, continuous: true });
  });
})();
