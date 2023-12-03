/**
 * @Author        Scipline
 * @Since         2023-06-13 20:42:58
 * @LastEditor    Scipline
 * @LastEditTime  2023-12-03 16:54:48
 * @FileName      popup.js
 * @Description   
 */
// popup.js
function isMerlinUrl(url) {
  return url.includes('getmerlin');
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
        alert('This action can only be performed on https://*.getmerlin.in/*');
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
        alert('This action can only be performed on https://*.getmerlin.in/*');
      }
    }
  );
});
