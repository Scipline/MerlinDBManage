// ==UserScript==
// @name         Merlin Database Export/Import
// @namespace    http://tampermonkey.net/
// @version      0.2.5
// @description  Add export and import functionality to Tampermonkey dashboard
// @author       Scipline
// @match        https://app.getmerlin.in/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAEbklEQVRYhb2XW4hVZRTHf/vMMZvRoDJFMy81FKWYdIMgMnoYexDS6CmNpBSqhygvUZBhEklE00QWIWYwJfbgQ4hElBVlJdHlsYKQvA2OjgbRnLNv3/7W6uHbt7PPeMb7hu98Z5+9Of/fuuy11vYAoiia53ne26D3ApdzEQ6xigkVG0oYh7LP+qyZMf+KPzwnzq9A98UQzgESB5CEggkFE2pgAu+OmrP84ooDaPqpxU/dnmcHvDiO/EsBYI1iQiEJs10wofq1SyEOoAooqGq6gyo9tUshDqCiqOCWZkBKR4CmH9D0g3MWDcKQRqNZElYnXoLpCPDQ8qdZvHQlBw8dPWvx4eMjLHl4NYuXrUSsFBC5uIPpCHD7rfM5MXKKFavXnhXE8PERlq9aw5GhYyxcMA9VDxVFbDtER4DXNq5j6ZI+Rk7+wyNPPMeBvw+PL37iJCtWreXo0DD33XMXA5s3oDYTV9SCpOJiwYvjSDv9obXC+pc2s+fzb5g2dQp7dw8yaVLPmPcaY3hg2eMcGTrG/Yvu5r3+TXR5dZJISSJxhShKH8HIFaUzegpqta70W0fW9A53T82r4eFKsFhFEk09kXrDOm90BLBWeHHjG+z+bC9Trr6Swa1vntZ6gAkTJrBz+wCzrpvB19/t58lnXyYMDJI4UUlFMwgZLwc2vPoWn+75kqnXXMXODwe4sXcuAM2mzzPrN/HVtz9irbDp9XfYPrgLgBnTp7FjWz8zr53Ovv0/8/zGzYUXLKknUgijnXOgb+lKms0mH2/rp/f6OfnvBw8P0ffgY0yceBlzZs3krwMHuW3hfHZ9tCW/58ihYR59ah1RFPHFjk+wsea5kESuMcW+7QzQaDQBmDx5Utu19z/YyZatg8SxYe7smbzb/wo339QLOOuSSPnvX584TOiu9+TC5YSMGuMAjHeMjjY4PnKKG+bOpqvLRVMFkliwkZLEqcUV65NIiH0hasj5AVQPVZyrYylcXoWJXDeMGw7gwjUjdS3XGkl3t8QoNsnOwSZahCIW6hdEOxOPK8u0LimLp944bwCVkuVjiLaIx64KFpXwPAHEVoTiyl655qah0mwYnWMIVMlj2xLjknBSCYMJBRNIeSg9Bw8o2LSuS+KSSpLTuD0uwmICJ16GyEDOCECFtnJaQJQ8MQaEE1fiQDEty0GcFiAbGETI+3nW1dyeWl8NQ2ll4sYXjO+KT+ENB1IXm06pqYurM1sxyWhLV8s9kLSGQZLU8tTdcQYQZOfSEpK6CQv1fHTOBkihELe09PMCoDUf3KOmpZhrq+UViHoSSoDSXXhAi9E580Tau/N+XgqDLYEkUfbqle5ZCMqifguEXzeh/IDSlz1e7WFozwMthSGLfV7hUoD87SfQdst9wfhK5Ov33vDvo/PE4xfQHrK5XWmbXtuTsXC5LbfZsbwQViB8xQTix5He6QEc+m30Fs+zA6osUqWbShhaJ1qX9UlW3WJNu13aakPFRJV3wKBIShNIEPm6L4l1zQs/Lfjzf2TQwc8hAO5kAAAAAElFTkSuQmCC
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

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
      new Blob([json], { type: 'application/json' }),
    );
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

  input.onchange = async (event) => {
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
            window.location.replace("https://app.getmerlin.in/sign-in");
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

  GM_registerMenuCommand('导出', exportDatabase);
  GM_registerMenuCommand('导入', importDatabase);

})();