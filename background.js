// self.addEventListener('install', (event) => {
  // console.log('Extension installed');
// });

// self.addEventListener('activate', (event) => {
  // console.log('Extension activated');
// });

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await showNotification('安装成功', '插件已成功安装!');
    chrome.tabs.create({ url: 'options.html' }); 
  } else if (details.reason === 'update') {
    await showNotification('更新成功', '插件已成功更新!');
  }
});

async function showNotification(title, message) {
  try {
    chrome.notifications.create(null, {
      type: 'basic',
      iconUrl: 'icons/icon16.png',
      title: title,
      message: message,
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}