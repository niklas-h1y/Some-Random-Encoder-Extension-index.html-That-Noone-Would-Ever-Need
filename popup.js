const button = document.getElementById('encode-page');
const status = document.getElementById('status');

button.addEventListener('click', async () => {
  button.disabled = true;
  status.textContent = 'Encoding this page…';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'encode-page' });
    status.textContent = result?.alreadyEncoded
      ? 'Already encoded. Refresh to restore the original.'
      : 'Page encoded. Refresh to restore the original!';
    button.textContent = result?.alreadyEncoded ? 'Already encoded ✓' : 'Encoded ✓';
  } catch {
    status.textContent = 'This page cannot be changed (try a regular website).';
    button.disabled = false;
  }
});