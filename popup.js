(() => {
  const encodeRules = [
    [/watch/gi,'ƿætч'],[/changes/gi,'чanʒes'],[/changed/gi,'чanʒeΔ'],
    [/shouting/gi,'ƩøυtIŋ'],[/thoroughfare/gi,'þørøυghfare'],[/through/gi,'þrøυgh'],[/whether/gi,'ƿheðer'],
    [/shall/gi,'ʃall'],[/ship/gi,'ʃIp'],[/the /gi,'ðe '],[/the\b/gi,'ðe'],
    [/ king/gi,' kIŋ'],[/queen/gi,'qυeen'],[/and/gi,'anΔ'],[/vision/gi,'vIzøn'],
    [/w/g,'ƿ'],[/W/g,'Ƿ'],[/d/g,'Δ'],[/m/g,'ɱ'],[/g/g,'ʒ'],[/h/g,'ч'],
    [/o/g,'ø'],[/O/g,'Ø'],[/a/g,'υ'],[/i/g,'I'],[/u/g,'υ'],[/A/g,'Æ'],[/s/g,'s']
  ];
  const decodeRules = [
    [/ƿætч/gi,'watch'],[/чanʒes/gi,'changes'],[/чanʒeΔ/gi,'changed'],
    [/ƩøυtIŋ/gi,'shouting'],[/þørøυghfare/gi,'thoroughfare'],[/þrøυgh/gi,'through'],[/ƿheðer/gi,'whether'],
    [/ʃall/gi,'shall'],[/ʃIp/gi,'ship'],[/ðe /gi,'the '],[/kIŋ/gi,'king'],
    [/qυeen/gi,'queen'],[/anΔ/gi,'and'],[/vIzøn/gi,'vision'],
    [/ƿ/g,'w'],[/Ƿ/g,'W'],[/Δ/g,'d'],[/ɱ/g,'m'],[/ʒ/g,'g'],[/ч/g,'h'],
    [/ø/g,'o'],[/Ø/g,'O'],[/I/g,'i'],[/υ/g,'u'],[/Æ/g,'A'],[/ʃ/g,'sh']
  ];
  const $ = id => document.getElementById(id);
  let mode = 'encode';
  const input = $('input');
  function convert(text, selectedMode = mode) {
    return (selectedMode === 'encode' ? encodeRules : decodeRules)
      .reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
  }
  function render() {
    const value = input.value;
    const result = convert(value);
    $('output').textContent = result;
    $('char-count').textContent = value.length + ' characters';
    $('word-count').textContent = (value.trim() ? value.trim().split(/\s+/).length : 0) + ' words';
    $('output-count').textContent = result.length + ' characters';
  }
  function setMode(next) {
    mode = next;
    $('encode-mode').classList.toggle('active', mode === 'encode');
    $('decode-mode').classList.toggle('active', mode === 'decode');
    $('source-label').textContent = mode === 'encode' ? 'Standard text' : 'Phonetic script';
    $('result-label').textContent = mode === 'encode' ? 'Phonetic script' : 'Standard text';
    $('result-badge').textContent = mode === 'encode' ? 'Sound-led' : 'Decoded';
    render();
  }
  $('encode-mode').addEventListener('click', () => setMode('encode'));
  $('decode-mode').addEventListener('click', () => setMode('decode'));
  input.addEventListener('input', render);
  $('clear').addEventListener('click', () => { input.value = ''; render(); input.focus(); });
  $('copy').addEventListener('click', async () => {
    const value = $('output').textContent;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      const button = $('copy');
      button.textContent = 'Copied!';
      setTimeout(() => button.textContent = 'Copy output', 1300);
    } catch {
      $('copy').textContent = 'Copy failed';
      setTimeout(() => $('copy').textContent = 'Copy output', 1300);
    }
  });
  chrome.runtime.onMessage.addListener(message => {
    if (message?.type !== 'load-selection') return;
    input.value = message.text || '';
    setMode(message.mode === 'decode' ? 'decode' : 'encode');
    render();
  });
  render();
})();