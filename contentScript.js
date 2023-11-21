// contentScript.js
const dbName = 'firebaseLocalStorageDb';
const storeName = 'firebaseLocalStorage';

function fetchIdToken(refreshToken, callback) {
    const myHeaders = new Headers({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
    });

    const urlencoded = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://securetoken.googleapis.com/v1/token?key=AIzaSyAvCgtQ4XbmlQGIynDT-v_M8eLaXrKmtiM", requestOptions)
    .then(response => response.json())
    .then(result => fetchAccessTokenData(result.id_token, callback))
    .catch(error => console.log('error', error));
}

function fetchAccessTokenData(accessToken, callback) {
    const myHeaders = new Headers({
        "authority": "merlin-uam-yak3s7dv3a-ue.a.run.app",
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "origin": "https://app.getmerlin.in",
        "pragma": "no-cache",
        "referer": "https://app.getmerlin.in/",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "content-type": "application/json"
    });

    const raw = JSON.stringify({
        "token": accessToken
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://merlin-uam-yak3s7dv3a-ue.a.run.app/session/get", requestOptions)
    .then(response => response.json())
    .then(resp => {
        callback({
            accessToken: resp.data.accessToken,
            refreshToken: resp.data.refreshToken
        });
    })
    .catch(error => {
        console.log('error', error);
        callback(null);
    });
}

function handleTokens(tokens) {
    if (tokens) {

        const accessToken = tokens.accessToken
            const refreshToken = tokens.refreshToken
            console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log(`chrome.runtime.sendMessage('camppjleccjaphfdbohjdohecfnoikec',{from:"MERLIN_APP",action:"SIGNIN",payload:{session:{"accessToken":"${accessToken}","refreshToken":"${refreshToken}"},closeTab:false}});`)
        // 设计到扩展跨域问题，不能直接触发监听事件
        // sendMessageToChromeExtension(accessToken, refreshToken)
        window.location.replace("https://app.getmerlin.in/sign-in");

    } else {
        console.log("Error fetching tokens.");
    }
}

/**
 * function sendMessageToChromeExtension(accessToken, refreshToken) {
 * const Pd = 'camppjleccjaphfdbohjdohecfnoikec';
 * const data = {
 * "accessToken": accessToken,
 * "refreshToken": refreshToken
 * };
 * chrome.runtime.sendMessage(Pd, {
 * from: "MERLIN_APP",
 * action: "SIGNIN",
 * payload: {
 * session: data,
 * closeTab: false
 * }
 * });
 * };
 */

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
            const refreshToken = jsonData.value.stsTokenManager.refreshToken

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
            // 调用 fetchIdToken 函数
            fetchIdToken(refreshToken, handleTokens);

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
