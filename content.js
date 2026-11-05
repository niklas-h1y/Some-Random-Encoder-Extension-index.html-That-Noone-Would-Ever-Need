(() => {
  // These rules intentionally mirror the phoneticRules array in index.html,
  // in the same order, so page encoding produces the same Sound / Script.
  const phoneticRules = [
    // Structural digraphs & blends
    { pattern: /watch/gi, replace: 'ƿætч' },
    { pattern: /changes/gi, replace: 'чanʒes' },
    { pattern: /changed/gi, replace: 'чanʒeΔ' },
    { pattern: /shouting/gi, replace: 'ƩøυtIŋ' },
    { pattern: /thoroughfare/gi, replace: 'þørøυghfare' },
    { pattern: /through/gi, replace: 'þrøυgh' },
    { pattern: /whether/gi, replace: 'ƿheðer' },

    // Consonants and special words
    { pattern: /shall/gi, replace: 'ʃall' },
    { pattern: /ship/gi, replace: 'ʃIp' },
    { pattern: /the /gi, replace: 'ðe ' },
    { pattern: /the\b/gi, replace: 'ðe' },
    { pattern: / king/gi, replace: ' kIŋ' },
    { pattern: /queen/gi, replace: 'qυeen' },
    { pattern: /and/gi, replace: 'anΔ' },
    { pattern: /vision/gi, replace: 'vIzøn' },

    // Character substitutions (including the original no-op rules)
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

  // A page is encoded at most once per document. The DOM marker also guards
  // against this content script being initialized more than once.
  const pageMarker = 'data-sound-script-encoded';
  const encodedGlyphs = /[ƿǷΔɱʒчøØυÆƩþðʃŋ]/u;

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

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;

    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      const value = node.nodeValue || '';
      if (!parent || !value.trim()) continue;

      // Don't alter code, controls, editable regions, or explicitly hidden text.
      if (parent.closest('script,style,noscript,textarea,input,select,option,button,[contenteditable],[aria-hidden="true"]')) continue;

      let hidden = false;
      for (let element = parent; element && element !== document.documentElement; element = element.parentElement) {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
          hidden = true;
          break;
        }
      }
      if (hidden) continue;

      // Preserve text that already contains this script's distinctive glyphs.
      // This avoids mangling pre-encoded snippets mixed into ordinary webpages.
      if (encodedGlyphs.test(value)) continue;

      nodes.push(node);
    }

    for (const textNode of nodes) {
      textNode.nodeValue = convert(textNode.nodeValue);
    }

    document.documentElement?.setAttribute(pageMarker, 'true');
    sendResponse({ ok: true, changedNodes: nodes.length });
  });
})();