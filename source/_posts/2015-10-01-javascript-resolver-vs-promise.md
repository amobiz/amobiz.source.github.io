title: 'JavaScript: Resolver vs. Promise'
date: 2015-10-01 14:05:18
comments: true
categories:
  - Programming
tags:
  - JavaScript
  - Design Pattern
  - Promise
---
[
![](https://images.unsplash.com/photo-1429308755210-25a272addeb3?fit=crop&fm=jpg&h=800&q=80&w=1200)
](https://unsplash.com/demidearest)

### 前言

讀者應該已經發現，{% post_link javascript-programming-pattern-resolver 上一篇 %} 文中提到的 resolver 模式，與 [Promise][promise] 似乎有著極為類似的形式。的確，Promise 與 resolver 模式有許多相似之處，尤其是 resolver 的變體形式，與 Promise 一樣，都有著 `resolve()` 函數。然而，resolver 主要是用來對付 falsy 值問題，而 promise 的主要目的是處理 asnyc (異步) 問題。

<!-- more -->

__resolver 模式__

``` js
function eval(expression) {
    var tokens, resolve;
    resolve = resolver();
    tokens = parse(expression);
    if (evaluate(tokens, resolve)) {
        console.log(expression + '=' + resolve.get());
    }
}

function evaluate(tokens, resolve) {
    // 進行計算...
    if (ok) {
        // 由 resolve() 函數幫忙回傳 true 以表示一個有效值
        return resolve(value);
    }
    // 無回傳 (等於回傳 undefined) 以表示一個無效值
}

function resolver() {
    var resolved;
    var resolve = function (value) {
        resolved = value;
        return true;
    };
    resolve.get = function () {
        return resolved;
    };
    return resolve;
}

function parse(expression) {
    // ...
}
```

__promise 模式__

``` js
return new Promise(resolver);

function resolver(resolve, reject) {
    fs.read(file, function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
}
```

同時，最能彰顯兩者強大功能的地方，同樣是串連多個函數時：

__resolver 模式__

``` js
var result = (expired() || cached() || read() || defaults())();
```

__promise 模式__

``` js
return new Promise(read)
    .then(process)
    .then(write);
```

### 結論

在 Design Pattern 的世界中，有許多的 pattern 其實具有相近甚至相同的形式，而其嘗試解決的問題，卻是如此不同。能夠注意到諸多 pattern 在形式上的相似，已然是融會貫通的具體表徵，但更重要的是，對於問題本質的洞察。

### 參考文章：

* [Promise][promise]
* [You're Missing the Point of Promises][point-of-promise]

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [JavaScript: Truthy? Falsy?][javascript-truthy-falsy]
* [JavaScript Programming Pattern: Resolver][javascript-programming-pattern-resolver]
* [JavaScript Promise: resolver vs. handler][javascript-promise-resolver-vs-handler]
{% endpostrefs %}

<!-- external references -->

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[point-of-promise]: https://blog.domenic.me/youre-missing-the-point-of-promises/ "You're Missing the Point of Promises"
