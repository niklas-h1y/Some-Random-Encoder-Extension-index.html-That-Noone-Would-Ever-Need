(() => {
  const encodeRules = [
    [/watch/gi,'ƿætч'],[/changes/gi,'чanʒes'],[/changed/gi,'чanʒeΔ'],[/shouting/gi,'ƩøυtIŋ'],
    [/thoroughfare/gi,'þørøυghfare'],[/through/gi,'þrøυgh'],[/whether/gi,'ƿheðer'],
    [/shall/gi,'ʃall'],[/ship/gi,'ʃIp'],[/the /gi,'ðe '],[/the\b/gi,'ðe'],
    [/ king/gi,' kIŋ'],[/queen/gi,'qυeen'],[/and/gi,'anΔ'],[/vision/gi,'vIzøn'],
    [/w/g,'ƿ'],[/W/g,'Ƿ'],[/d/g,'Δ'],[/m/g,'ɱ'],[/g/g,'ʒ'],[/h/g,'ч'],
    [/o/g,'ø'],[/O/g,'Ø'],[/a/g,'υ'],[/i/g,'I'],[/u/g,'υ'],[/A/g,'Æ'],[/s/g,'s']
  ];
  const decodeRules = [
    [/ƿætч/gi,'watch'],[/чanʒes/gi,'changes'],[/чanʒeΔ/gi,'changed'],[/ƩøυtIŋ/gi,'shouting'],
    [/þørøυghfare/gi,'thoroughfare'],[/þrøυgh/gi,'through'],[/ƿheðer/gi,'whether'],
    [/ʃall/gi,'shall'],[/ʃIp/gi,'ship'],[/ðe /gi,'the '],[/kIŋ/gi,'king'],
    [/qυeen/gi,'queen'],[/anΔ/gi,'and'],[/vIzøn/gi,'vision'],
    [/ƿ/g,'w'],[/Ƿ/g,'W'],[/Δ/g,'d'],[/ɱ/g,'m'],[/ʒ/g,'g'],[/ч/g,'h'],
    [/ø/g,'o'],[/Ø/g,'O'],[/I/g,'i'],[/υ/g,'u'],[/Æ/g,'A'],[/ʃ/g,'sh']
  ];
  function convert(text, mode) {
    return (mode === 'decode' ? decodeRules : encodeRules)
      .reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'convert-selection') return;
    const result = convert(message.text || '', message.mode);
    const active = document.activeElement;
    const editable = active && (
      (active.tagName === 'TEXTAREA') ||
      (active.tagName === 'INPUT' && /^(text|search|url|tel|email)$/i.test(active.type)) ||
      active.isContentEditable
    );
    if (editable && typeof active.setRangeText === 'function' && active.selectionStart != null) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      active.setRangeText(result, start, end, 'select');
      active.dispatchEvent(new Event('input', { bubbles: true }));
      sendResponse({ ok: true, replaced: true });
    } else if (editable && active.isContentEditable) {
      document.execCommand('insertText', false, result);
      sendResponse({ ok: true, replaced: true });
    } else {
      navigator.clipboard?.writeText(result).then(
        () => sendResponse({ ok: true, copied: true }),
        () => sendResponse({ ok: false, copied: false })
      );
      return true;
    }
  });
})();