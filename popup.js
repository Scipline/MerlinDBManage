// popup.js
function isMerlinUrl(url) {
  return url.startsWith('https://app.getmerlin.in');
}

document.getElementById('exportButton').addEventListener('click', () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      if (isMerlinUrl(tabs[0].url)) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'exportDatabase',
        });
      } else {
        alert('This action can only be performed on https://app.getmerlin.in/*');
      }
    }
  );
});

document.getElementById('importButton').addEventListener('click', () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      if (isMerlinUrl(tabs[0].url)) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'importDatabase',
        });
      } else {
        alert('This action can only be performed on https://app.getmerlin.in/*');
      }
    }
  );
});