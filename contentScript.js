// contentScript.js
const dbName = 'firebaseLocalStorageDb';
const storeName = 'firebaseLocalStorage';

/**
 * 下载 JSON 数据为文件
 * @param {string} json - JSON 数据字符串
 * @param {string} fileName - 下载的文件名
 */
function downloadJson(json, fileName) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
            new Blob([json], {
                type: 'application/json'
            }), );
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * 读取上传的文件
 * @param {File} file - 上传的文件对象
 * @returns {Promise} - 读取文件的 Promise
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

/**
 * 导出功能
 */
function exportDatabase() {
    const openRequest = indexedDB.open(dbName);

    openRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const getRequest = objectStore.getAll();

        getRequest.onsuccess = (event) => {
            const data = event.target.result;
            const firstDataItem = data[0];
            const json = JSON.stringify(firstDataItem);
            const email = firstDataItem.value.email;
            const fileName = `indexeddb_${email}.json`;
            downloadJson(json, fileName);
        };

        getRequest.onerror = () => {
            console.error('Error reading key-value pairs.');
        };
    };

    openRequest.onerror = () => {
        console.error('Error opening database.');
    };
}

/**
 * 导入功能
 */
function importDatabase() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();

    input.onchange = async(event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        try {
            const fileContent = await readFile(file);
            const jsonData = JSON.parse(fileContent);
            const openRequest = indexedDB.open(dbName);

            openRequest.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, 'readwrite');
                const objectStore = transaction.objectStore(storeName);

                objectStore.clear().onsuccess = () => {
                    console.log('ObjectStore cleared successfully.');
                };

                transaction.oncomplete = () => {
                    const addTransaction = db.transaction(storeName, 'readwrite');
                    const addObjectStore = addTransaction.objectStore(storeName);

                    addObjectStore.add(jsonData);

                    addTransaction.oncomplete = () => {
                        console.log('Database restored successfully.');
                    };
                };
            };

            openRequest.onerror = () => {
                console.error('Error opening database.');
            };
        } catch (error) {
            console.error('Error reading file:', error);
        }
    };
}

function onContentLoaded() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'exportDatabase') {
            exportDatabase();
            sendResponse({
                result: 'success'
            });
        } else if (request.action === 'importDatabase') {
            importDatabase();
            sendResponse({
                result: 'success'
            });
        }
    });
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', onContentLoaded);
} else {
    onContentLoaded();
}
chrome.runtime.sendMessage({
  messageType: 'showNotification',
  title: 'Extension installed',
  message: 'Thank you for installing the Merlin Database Backup extension.',
});