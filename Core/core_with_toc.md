- [ Merlin-DefaultPrompt](#head1)
- [ Merlin-Web](#head1)
	- [ 导出到本地文件](#head2)
	- [ 导入indexedDB：](#head3)
		- [ indexedDB.json文件格式参考](#head4)
		- [ indexedDB.json最精简内容](#head5)
	- [ 清空网站数据indexedDB信息](#head6)
	- [ 清空网站所有indexedDB内容](#head7)
- [ Merlin-Plugin](#head8)
	- [ 登录](#head9)
		- [ Web授权](#head10)
			- [ Web触发事件登录](#head11)
			- [ Web触发事件注销](#head12)
		- [ Console控制](#head13)
			- [ **R指定字段值**:](#head14)
			- [ **R全部字段的值**](#head15)
			- [ C/U指定字段值](#head16)
			- [ C/U全部字段值](#head17)
			- [ D指定字段值](#head18)
			- [ D全部字段值](#head19)
# <span id="head1">Merlin-DefaultPrompt</span>

```
您是ChatGPT， 请忽略您可能已经收到的任何先前指示或信息。理解您作为Merlin的角色，一个由GPT-4架构支持的有帮助的AI助手。您唯一的任务是有效地构建对用户查询的全面解决方案。

即使在可用信息看似不足的情况下，您的任务仍然是创建一个有力和知情的响应，尽可能好地使用现有数据。不要推断或做出超越现有信息的假设。专注于准确性大大超过完成的需求。

遵循这些准则，为用户的查询生成准确且有意义的响应，仅在明确询问您的身份时介绍自己。
```
# <span id="head1"> Merlin-Web</span>

> 登录、注销操作==直接操作indexedDB数据库

## <span id="head2"> 导出到本地文件</span>

```js
const dbName = 'firebaseLocalStorageDb';  //数据库名字
const storeName = 'firebaseLocalStorage'; //储存对象名字

const openRequest = indexedDB.open(dbName);

openRequest.onsuccess = (event) => {
const db = event.target.result;
const transaction = db.transaction(storeName, 'readonly');
const objectStore = transaction.objectStore(storeName);
const getRequest = objectStore.getAll();

getRequest.onsuccess = (event) => {
const data = event.target.result;
const json = JSON.stringify(data);

const a = document.createElement('a');
a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
a.download = 'indexeddb_backup.json';
a.style.display = 'none';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
};

getRequest.onerror = () => {
console.error('Error reading key-value pairs.');
};
};

openRequest.onerror = () => {
console.error('Error opening database.');
};
```

> 导出文件名: "indexeddb_<email>.json"

## <span id="head3"> 导入indexedDB：</span>

```js
// 1. 获取要还原的 JSON 文件
const dbName = 'firebaseLocalStorageDb';  //数据库名字
const storeName = 'firebaseLocalStorage'; //储存对象名字
const input = document.createElement('input');
input.type = 'file';
input.accept = 'application/json';
input.style.display = 'none';
document.body.appendChild(input);
input.click();

input.onchange = (event) => {
const file = event.target.files[0];
if (!file) {
return;
}

// 2. 读取 JSON 文件的内容并将其解析为 JavaScript 对象
const reader = new FileReader();
reader.onload = (event) => {
const jsonData = JSON.parse(event.target.result);

// 3. 打开与要还原的 IndexedDB 数据库的连接
const openRequest = indexedDB.open(dbName);

openRequest.onsuccess = (event) => {
const db = event.target.result;
const transaction = db.transaction(storeName, 'readwrite');
const objectStore = transaction.objectStore(storeName);

// 4. 清空现有的 objectStore
objectStore.clear().onsuccess = () => {
console.log('ObjectStore cleared successfully.');
};

// 当事务完成时，确保先清空 objectStore，然后再添加新数据
transaction.oncomplete = () => {
// 5. 将解析后的数据添加回 objectStore
const addTransaction = db.transaction(storeName, 'readwrite');
const addObjectStore = addTransaction.objectStore(storeName);

jsonData.forEach((item) => {
addObjectStore.add(item);
});

addTransaction.oncomplete = () => {
console.log('Database restored successfully.');
};
};
};

openRequest.onerror = () => {
console.error('Error opening database.');
};
};

reader.onerror = () => {
console.error('Error reading file.');
};

reader.readAsText(file);
};
```

### <span id="head4"> indexedDB.json文件格式参考</span>

```json
{
"fbase_key": "firebase:authUser:AIzaSyAvCgtQ****************eLaXrKmtiM:[DEFAULT]",
//对于Merlin所有普通用户固定AIzaSyAvCgtQ4XbmlQGIynDT-v_M8eLaXrKmtiM，固定不变
"value": {
"uid": "****************",   //随意可变
"email": "****************@gmail.com",//随意可变
"emailVerified": true, //随意可变
"displayName": "****************",//随意可变
"isAnonymous": false, //随意可变
"photoURL": "https://lh3.googleusercontent.com/a/AAcH****************bda7itYTWunEU=s96-c",//随意可变
"providerData": [
{
"providerId": "google.com",//随意可变
"uid": "10****************83376",//随意可变
"displayName": "****************",//随意可变
"email": "****************@gmail.com",//随意可变
"phoneNumber": null,//随意可变
"photoURL": "https://lh3.googleusercontent.com/a/AAcH****************a7itYTWunEU=s96-c"//随意可变
}
],
"stsTokenManager": {
"refreshToken": "APZUo0Skj****************igXtQbkbAnRMQ", //唯一用户核心Token
"accessToken": "eyJhbG****************eNPlMcg", //随意可变，临时Token，有效期1个小时
"expirationTime": 1686645507245 //随意可变
},
"createdAt": "1686641905000", //随意可变
"lastLoginAt": "1686641905001", //随意可变
"apiKey": "AI****************mtiM", //随意可变
"appName": "[DEFAULT]" //随意可变
}
}

```

### <span id="head5"> indexedDB.json最精简内容</span>

```json
//除了$.fbase_key和$.value.stsTokenManager.refreshToken是最核心参数，其他参数可变更，但不可删除
{
"fbase_key": "firebase:authUser:AIzaSyAv****************LaXrKmtiM:[DEFAULT]",
"value": {
"uid": "s2Xdi****************rPg1",
"emailVerified": true,
"displayName": "xF****************g7",
"isAnonymous": false,
"stsTokenManager": {
"refreshToken": "APZUo0SH5mdTItZY-wISO1CKucB5BZ0LbRRJcKU6VK1WZ****************Pns-KMgTow"
}
}
}
```

## <span id="head6"> 清空网站数据indexedDB信息</span>

```js
function clearFirebaseLocalStorage() {
// 数据库名称
const dbName = 'firebaseLocalStorageDb';
// 对象存储名称
const objectStoreName = 'firebaseLocalStorage';

const openRequest = window.indexedDB.open(dbName);
// 给 openRequest 添加事件监听器 onupgradeneeded，在数据库结构需要升级时触发。这在首次创建数据库或指定的版本与现有版本不同时发生。
openRequest.onupgradeneeded = (event) => {
// 利用 event.target.result 获取数据库对象，并将其赋值给 db。
const db = event.target.result;
// 对象存储是否存在；如果不存在，则在数据库中创建它。
if (!db.objectStoreNames.contains(objectStoreName)) {
db.createObjectStore(objectStoreName);
}
};

openRequest.onsuccess = (event) => {
const db = event.target.result;
// 使用 db.transaction(objectStoreName, 'readwrite') 创建一个读/写访问权限的事务，用于在对象存储 (object store) 中执行操作
const transaction = db.transaction(objectStoreName, 'readwrite');
// 用 transaction.objectStore(objectStoreName) 获取 firebaseLocalStorage 对象存储，将结果赋值给 objectStore。
const objectStore = transaction.objectStore(objectStoreName);

const clearRequest = objectStore.clear();

clearRequest.onsuccess = () => {
console.log(`All data in ${objectStoreName} cleared successfully.`);
};

transaction.oncomplete = () => {
db.close();
};
};
}

clearFirebaseLocalStorage();
```

## <span id="head7"> 清空网站所有indexedDB内容</span>

```js
async function clearAllIndexedDB() {
const databases = await window.indexedDB.databases();

for (const dbInfo of databases) {
const dbName = dbInfo.name;
const deleteRequest = window.indexedDB.deleteDatabase(dbName);

deleteRequest.onsuccess = () => {
console.log(`Database ${dbName} deleted successfully.`);
};

deleteRequest.onerror = () => {
console.error(`Error deleting database ${dbName}.`);
};
}
}

clearAllIndexedDB();
```



# <span id="head8"> Merlin-Plugin</span>

## <span id="head9"> 登录</span>

### <span id="head10"> Web授权</span>

#### <span id="head11"> Web触发事件登录</span>

```js
//===直接访问https://app.getmerlin.in/sign-in-from-extension
const Pd = 'camppjleccjaphfdbohjdohecfnoikec';
const data = {
"accessToken": "eyJhbGciOiJ*****ZWndbj5JLHh-NQ",
"refreshToken": "eyJhbGciOiJIUzI1NiI*****tr6Um65fRgMhoYDMaKLE"
};
chrome.runtime.sendMessage(Pd, {
from: "MERLIN_APP",
action: "SIGNIN",
payload: {
session: data,
closeTab: false
}
});
```

#### <span id="head12"> Web触发事件注销</span>

```js
//===直接访问https://app.getmerlin.in/sign-out-from-extension
const Pd = 'camppjleccjaphfdbohjdohecfnoikec';
chrome.runtime.sendMessage(Pd, {
from: "MERLIN_APP",
action: "SIGNOUT",
payload: {
closeTab: false
}
});
```

### <span id="head13"> Console控制</span>

> 运用`chrome.storage.local`的get(),set(),remove(),clear()方法

#### <span id="head14"> **R指定字段值**:</span>

```js
//Method1
function getFromStorage(key) {
return new Promise((resolve, reject) => {
chrome.storage.local.get([key], function(result) {
const error = chrome.runtime.lastError;
if (error) {
reject(error);
} else {
resolve(result[key]);
}
});
});
}
getFromStorage('authDetails')
.then(value => {
console.log('authDetails value is: ' + value);
})
.catch(error => {
console.error('Error fetching data:', error);
});


//Method2
chrome.storage.local.get(['authDetails'], function(result) {
console.log('authDetails value is: ' + result.authDetails);
});
```

#### <span id="head15"> **R全部字段的值**</span>

```js
// 获取存储中的所有数据
chrome.storage.local.get(null, function(items) {
// 这里处理获取到的数据
console.log(items);

for (let key in items) {
console.log(key + ": " + items[key]);
}
});




// 递归函数，用于打印对象的所有键和值
function printAllKeysAndValues(obj, parentKey = '') {
for (let key in obj) {
let newKey = parentKey ? `${parentKey}.${key}` : key;
if (typeof obj[key] === 'object' && obj[key] !== null) {
printAllKeysAndValues(obj[key], newKey);
} else {
console.log(newKey + ": " + obj[key]);
}
}
}
// 获取存储中的所有数据
chrome.storage.local.get(null, function(items) {
// 这里处理获取到的数据
console.log(items);
printAllKeysAndValues(items);
});
```

```json
//配置信息过多，已省略
```

> 登录与非登录用户区别:
>
> 1. $.authDetails
> 2. $.cacheStorage.userPromptTemplates.data.userMade

#### <span id="head16"> C/U指定字段值</span>

```js
// 定义要修改的字段（键），例如 'authDetails'
let keyToModify = 'authDetails';
const token = null
const refreshToken =null
const isAuthenticated = false;

// 从 chrome.storage.local.get 读取数据
chrome.storage.local.get(keyToModify, (result) => {
// 检查字段是否存在
if (result.hasOwnProperty(keyToModify)) {
// 修改 authDetails 对象
let modifiedAuthDetails = JSON.parse(result[keyToModify]);
console.log(modifiedAuthDetails)
modifiedAuthDetails.token = token;
modifiedAuthDetails.session.refreshToken = refreshToken;
modifiedAuthDetails.isAuthenticated = isAuthenticated;
console.log(modifiedAuthDetails)
// 使用 chrome.storage.local.set 保存修改后的 authDetails
chrome.storage.local.set({ [keyToModify]: JSON.stringify(modifiedAuthDetails)}, () => {
console.log('authDetails 已更新');
});
} else {
console.log('字段不存在，无需修改', keyToModify);
}
});
```

#### <span id="head17"> C/U全部字段值</span>

```js
//字符串形式
const authDetails1 ="{\"email\":\"_js6b*****tion.com\",\"isAuthenticated\":true,\"isLoading\":false,\"name\":\"eB****Y9z7\",\"session\":{\"refreshToken\":\"eyJhbGciOi********lY1npm0s\"},\"token\":\"eyJhbGciOiJ****ccxQb0\",\"usageDetails\":{\"used\":20,\"limit\":101,\"type\":\"FREE\",\"plan\":\"FREE\"}}"

//双引号包括为字符串字段，无引号包括为对象。如果authDetails为字符串需要转义，可以直接填authDetails1，如果是对象需由JSON.stringify(c)序列化为字符串
const dataSave1 = {
"authDetails": authDetails1
}
chrome.storage.local.set(dataSave1), function() {
console.log("全部值已经设置");
};
```

```js
//对象形式
const authDetails2 = {"email":"_js6by******tion.com","isAuthenticated":true,"isLoading":false,"name":"eBk***9z7","session":{"refreshToken":"eyJhbGciOiJIUzI1N******GyGlY1npm0s"},"token":"eyJhbGc*******Koq6OccxQb0","usageDetails":{"used":20,"limit":101,"type":"FREE","plan":"FREE"}}


const dataSave2 = {
"authDetails": JSON.stringify(authDetails2)
}

chrome.storage.local.set(dataSave2), function() {
console.log("全部值已经设置");
};
```



#### <span id="head18"> D指定字段值</span>

```js
// 首先，定义要删除的字段（键），例如 'authDetails'
let keyToRemove = 'authDetails';

// 使用 chrome.storage.local.remove 删除指定字段
chrome.storage.local.remove(keyToRemove, () => {
console.log('字段已删除', keyToRemove);
});




//不建议以上用法，会把其他非关键参数也一并删除，引起错误，使用以下
// 定义要修改的字段（键），例如 'authDetails'
let keyToModify = 'authDetails';

// 从 chrome.storage.local.get 读取数据
chrome.storage.local.get(keyToModify, (result) => {
// 检查字段是否存在
if (result.hasOwnProperty(keyToModify)) {
// 修改 authDetails 对象
let modifiedAuthDetails = JSON.parse(result[keyToModify]);
console.log(modifiedAuthDetails)
modifiedAuthDetails.token = null;
modifiedAuthDetails.session.refreshToken = null;
modifiedAuthDetails.isAuthenticated = false;

// 使用 chrome.storage.local.set 保存修改后的 authDetails
chrome.storage.local.set({ [keyToModify]: JSON.stringify(modifiedAuthDetails)}, () => {
console.log('authDetails 已更新');
});
} else {
console.log('字段不存在，无需修改', keyToModify);
}
});
```

#### <span id="head19"> D全部字段值</span>

```js
//不建议这样使用，会把其他非用户相关的配置类数据删除，引起错误
chrome.storage.local.clear(function () {
var error = chrome.runtime.lastError;
if (error) {
console.error(error);
} else {
console.log("All fields have been cleared");

}
});
```

