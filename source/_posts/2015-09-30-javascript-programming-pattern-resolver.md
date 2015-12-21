title: 'JavaScript Programming Pattern: Resolver'
comments: true
date: 2015-09-30 14:21:48
categories:
  - Programming
tags:
  - JavaScript
  - Design Pattern
---
[
![](https://images.unsplash.com/photo-1428542170253-0d2f063e92c2?fit=crop&fm=jpg&h=800&q=80&w=1200)
](https://unsplash.com/johncobb)

### 前言

在 JavaScript 中，有許多數值，在邏輯判斷中，其結果與 `false` 等價。由於其數值實際上並非 `false`，因此，特別稱此類數值為 __falsy__ value。

在 [上一篇文章][javascript-truthy-falsy] 中，介紹了一般在程式中處理 falsy 值的方法。對於函數回傳值是 falsy 的狀況，上述的原則也都同樣適用，譬如：

``` js
// 回傳的空字串是 falsy 值
function getText() {
    return '';
}

var text = getText();

// 錯誤方式：空字串是 falsy 值，不會進入 if 敘述區塊。
if (text) {
}

// 不佳方式：分別檢查空字串與非空字串的情形。
if (text || text === '') {
}

// 上一篇文章建議的方式。
if (typeof text === 'string') {
}
```

但是，對於函數回傳值是 falsy 的狀況，其實有更好的表達方式，就是本文要介紹的 resolver 模式。

<!-- more -->

### 問題

函數回傳的有效值中，可能包含 falsy 值。

### 解決方案

當函數要回傳一個有效值時，回傳一個函數物件，透過該函數物件本身所呈現的 truthy 值，來表示具有有效值，同時，透過該函數可以取得該有效值；否則回傳 `undefined` (或任意 falsy 值)，以表示無法得出有效值。

### 範例

``` js
function eval(expression) {
    var tokens, resolved;
    tokens = parse(expression);
    resolved = evaluate(tokens);
    // 函數是 truthy 值，若通過 if 敘述，則表示得出正確結果，即使計算結果可能是 0 (一個 falsy 值)。
    if (resolved) {
        console.log(expression + '=' + resolved());
    }
}

function evaluate(tokens) {
    // 進行計算...
    if (ok) {
        // 回傳一個函數物件以表示一個有效值
        return resolve(value);
    }
    // 無回傳 (等於回傳 undefined) 以表示一個無效值
}

function resolve(value) {
    return function () {
        return value;
    };
}

eval('1+1-2');
```

如果有多個互斥的函數，僅有其中一個可以得出正確結果時，可以將這些函數以 `||` 串接在一起，使它們依序執行，直到其中任一個函數回傳 truthy 值，或全部失敗為止：

``` js
var result;
var resolved = expired() || cached() || read();
if (resolved) {
    result = resolved();
}
```

如果，想要簡化對於結果的處理方式，可以在串接的函數最後面，安置一個 guardian 函數，負責回傳預設的結果，以保證最終可以獲得結果：

``` js
var result = (expired() || cached() || read() || defaults())();
```

### 變體

另一種變體是，`resolver` 函數物件由外部傳入，而不是由函數自行建構，並且，改回傳 `true` 以表示具有有效值：

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
        resolve(value);
        // 回傳 true 以表示一個有效值
        return true;
    }
    // 無回傳 (等於回傳 undefined) 以表示一個無效值
}

function resolver() {
    var resolved;
    var resolve = function (value) {
        resolved = value;
    };
    resolve.get = function () {
        return resolved;
    };
    return resolve;
}

eval('1+1-2');
```

這樣的表現方式，乍看似乎有點多餘，但考慮到現在可以將表達式以任意邏輯運算串接起來：

{% gist amobiz/2435713ddec72e7ce87e %}

注意到上面的程式風格，符合 [Robert C. Martin] 在 [Clean Code] 中的建議：程式由上而下，逐一呈現細節。程式的邏輯與意圖一目了然。

### 結論

前一陣子 [釋出][open-source-json-normalizer] 的 [json-normalizer]，大量使用到本文介紹的 resolver 模式，想看更多 [實戰範例][normalize.js] 的朋友，不妨前往瞧個究竟。

歡迎大家的回饋與心得分享。

### 參考文章：

* [Robert C. Martin]
* [Clean Code]

### 相關文章：

* [JavaScript: Truthy? Falsy?][javascript-truthy-falsy]
* [JavaScript: Resolver vs. Promise][javascript-resolver-vs-promise]
* [JavaScript Promise: resolver vs. handler][javascript-promise-resolver-vs-handler]

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[Robert C. Martin]: https://en.wikipedia.org/wiki/Robert_Cecil_Martin
[Clean Code]: http://www.pearsonhighered.com/educator/product/Clean-Code-A-Handbook-of-Agile-Software-Craftsmanship/9780132350884.page
[json-normalizer]: https://github.com/amobiz/json-normalizer
[normalize.js]: https://github.com/amobiz/json-normalizer/blob/master/src/normalize.js
