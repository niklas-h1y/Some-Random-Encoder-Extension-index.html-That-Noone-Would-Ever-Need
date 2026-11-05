(() => {
  const encodeRules = [
    [/watch/gi,'ƿætч'],[/changes/gi,'чanʒes'],[/changed/gi,'чanʒeΔ'],[/shouting/gi,'ƩøυtIŋ'],
    [/thoroughfare/gi,'þørøυghfare'],[/through/gi,'þrøυgh'],[/whether/gi,'ƿheðer'],
    [/shall/gi,'ʃall'],[/ship/gi,'ʃIp'],[/the /gi,'ðe '],[/the\b/gi,'ðe'],
    [/ king/gi,' kIŋ'],[/queen/gi,'qυeen'],[/and/gi,'anΔ'],[/vision/gi,'vIzøn'],
    [/w/g,'ƿ'],[/W/g,'Ƿ'],[/d/g,'Δ'],[/m/g,'ɱ'],[/g/g,'ʒ'],[/h/g,'ч'],
    [/o/g,'ø'],[/O/g,'Ø'],[/a/g,'υ'],[/i/g,'I'],[/u/g,'υ'],[/A/g,'Æ'],[/s/g,'s']
  ];

  const convert = text => encodeRules.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement), text
  );

  let encoded = false;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'encode-page') return;
    if (encoded) {
      sendResponse({ ok: true, alreadyEncoded: true });
      return;
    }

    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || !node.nodeValue.trim()) continue;
      if (parent.closest('script,style,noscript,textarea,input,select,option,button,[contenteditable=""],[contenteditable="true"],[aria-hidden="true"]')) continue;
      nodes.push(node);
    }

    for (const textNode of nodes) textNode.nodeValue = convert(textNode.nodeValue);
    encoded = true;
    sendResponse({ ok: true, changedNodes: nodes.length });
  });
})();