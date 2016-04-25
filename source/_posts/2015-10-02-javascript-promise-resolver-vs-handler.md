title: 'JavaScript Promise: resolver vs. handler'
date: 2015-10-02 17:55:08
comments: true
categories:
  - Programming
tags:
  - JavaScript
  - Design Pattern
  - Promise
---
{% credit credit:"Liane Metzler" link:"https://unsplash.com/liane" desc:"意象說明<br><br>Promise < 承諾" %}
![](https://images.unsplash.com/photo-1439920120577-eb3a83c16dd7?crop=entropy&fit=crop&fm=jpg&h=975&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1900)
{% endcredit %}

### 鑽牛角尖時間：Promise: resolver vs handler

不曉得讀者有沒有同樣的困擾：[`Promise`][promise] 的 resolver 與 handler 有著不同的 signature (形式) 及啟動方式，看起來非常地不協調：

``` js
// resolver 由 Promise() constructor 啟動
return new Promise(resolver)
    // handler 由 then() 函數啟動
    .then(handler, onerror);

// resolver 具有 function (resolve, reject) 的形式
function resolver(resolve, reject) {
    fs.readFile('readme.md', function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
}

// fulfillment handler 具有 function (result) 的形式
function handler(markdown) {
    return marked(markdown);
}

// rejection handler 具有 function (reason) 的形式
function onerror(error) {
    log(error);
}
```

<!-- more -->

這樣的設計，著眼點是：對於已經使用 promise 模式的函數，早就已經回傳 `Promise` 物件了，使用上不涉及到 `Promise` 物件的建立，只要直接取用其回傳的 `Promise` 物件，呼叫其 `#then()` 函數即可，像這樣：

``` js
$.get(url)
    .then(function (text) {
        // ...
    });
```

至於那些需要自行處理 `Promise` 物件的函數，是尚未使用 promise 模式的函數。這些函數，若要使用 promise 模式<sup>[[註1](#promisify)]</sup>，必須先設法建立一個 `Promise` 物件，然後 `Promise` 物件在稍後呼叫指定的 resolver 函數，而 resolver 函數異步處理完畢後，再透過 `resolve()` 與 `reject()` 函數來完成整個處理過程。既然建立 `Promise` 物件和呼叫 resolver 函數這兩個動作似乎具有時間上的耦合，因此，這個責任就被設計，並落在 `Promise` 物件的 constructor 上：

``` js
return new Promise(resolver);

function resolver(resolve, reject) {
    fs.readFile('readme.md', function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
}
```

但是，真的不能處理得更好，更一致嗎？

#### 嘗試 1：讓 resolver 的 signature 與 handler 一致

首先，必須先建立一個 `Promise` 物件。由於 `Promise` 提供有 `Promise.resolve()` 函數，可以建立一個已經 fulfilled 的 `Promise` 物件，顯然可以利用它來幫忙建立初始的 `Promise` 物件。有了初始的 `Promise` 物件，就可以對它呼叫 `#then()` 函數，然後以一致的 signature 撰寫 resolver 與 handler 了。

然而，因為要讓 resolver 與 handler 使用一致的 signature，這麼一來，resolver 就無法取得 `resolve()` 與 `reject()` 函數，所以 resolver 反而必須自行建立 `Promise` 物件：

``` js
Promise.resolve(true)
  .then(resolver)
  .then(handler)
  .catch(onerror);

function resolver(initValue) {
    return new Promise(function (resolve, reject) {
        fs.readFile('readme.md', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function handler(markdown) {
    return marked(markdown);
}

function onerror(error) {
    log(error);
}
```

嗯...不好。看起來只是把該做的事情，搬到不同的地方做而已，並沒有讓事情更簡化。

#### 嘗試 2：讓 handler 與 resolver 採用一般化的，一致的 signature

如果採用兩者的聯集形式： `function (value, resolve, reject)` 呢？

為此，我為 `Promise` 添加了兩個函數，分別是 `Promise.first()` 與 `Promise#next()`，負責幫忙建立 `Promise` 物件，並且轉送 `#then()`  函數傳遞的值：

``` js
Promise.first = function (handler) {
    return new Promise(function (resolve, reject) {
        return handler(undefined, resolve, reject);
    });
};

Promise.prototype.next = function (handler) {
    return this.then(function (value) {
        return new Promise(function (resolve, reject) {
            return handler(value, resolve, reject);
        });
    });
};

return Promise
  .first(resolver)
  .then(handler)
  .next(writer)
  .catch(onerror);

function resolver(initValue, resolve, reject) {
    fs.readFile('readme.md', function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
}

function handler(markdown) {
    return marked(markdown);
}

function writer(data, resolve, reject) {
    fs.writeFile('readme.md.bak', data, function (err) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
}

function onerror(error) {
    log(error);
}
```

看起來還蠻順眼的，讀者以為呢？

### 參考文章：

* [Promise][promise]
* [You're Missing the Point of Promises][point-of-promise]
* <span id="promisify"></span>有許多 Promise 程式庫，譬如 [bluebird]，提供 [方法][promisification] 幫助將 callback 形式的函數轉化為 Promise 形式。

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [JavaScript: Truthy? Falsy?][javascript-truthy-falsy]
* [JavaScript Programming Pattern: Resolver][javascript-programming-pattern-resolver]
* [JavaScript: Resolver vs. Promise][javascript-resolver-vs-promise]
{% endpostrefs %}

<!-- external references -->

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[point-of-promise]: https://blog.domenic.me/youre-missing-the-point-of-promises/ "You're Missing the Point of Promises"
[bluebird]: https://github.com/petkaantonov/bluebird
[promisification]: https://github.com/petkaantonov/bluebird/blob/master/API.md#promisification
