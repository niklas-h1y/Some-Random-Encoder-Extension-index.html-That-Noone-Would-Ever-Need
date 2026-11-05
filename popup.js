const button = document.getElementById('encode-page');
const status = document.getElementById('status');

button.addEventListener('click', async () => {
  button.disabled = true;
  status.textContent = 'Encoding this page…';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');
    await chrome.tabs.sendMessage(tab.id, { type: 'encode-page' });

    // Close the action popup once the page has accepted the encode request.
    window.close();
  } catch {
    status.textContent = 'This page cannot be changed (try a regular website).';
    button.disabled = false;
  }
});
