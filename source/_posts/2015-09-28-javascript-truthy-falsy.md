title: 'JavaScript: Truthy? Falsy?'
comments: true
date: 2015-09-28 13:21:18
categories:
  - Programming
tags:
  - JavaScript
  - pitfalls
---
{% credit credit:"Genta Mochizawa" link:"https://unsplash.com/foxwalk" desc:"意象說明<br><br>Truthy? Falsy? < 迷惘" %}
![](https://images.unsplash.com/photo-1431051047106-f1e17d81042f?fit=crop&fm=jpg&h=725&q=80&w=1075)
{% endcredit %}

### 簡介

在 JavaScript 中，有許多數值，在邏輯判斷中，其結果與 `false` 等價。由於其數值實際上並非 `false`，因此，特別稱此類數值為 __falsy__ value。

<!-- JavaScript - The Good Parts, P.106 -->

__falsy values__

Value     | Type      | Implementation
----------|-----------|----------------
0         | Number    | Constant
NaN       | Number    | Global Variable
''        | String    | Constant
false     | Boolean   | Constant
null      | Object    | Constant
undefined | Undefined | Global Variable

<!-- more -->

#### 基本邏輯判斷方法

下面使用 `if` 敘述直接進行 truthy / falsy 判斷，上表中所有的 falsy 值皆無法通過 `if` 敘述的判斷，而其餘的值皆會通過：

``` js
if (value) {
}
```

等同於：

``` js
value ? true : false
```

下面這個例子比較特別，注意 `===` 運算子__不會__進行型別轉換，所以唯一會通過邏輯判斷的情況，是 value 的值恰好為 `true` 的情況，其餘的所有值，結果都是 `false`。

``` js
value === true
```

下面這個例子，由於 `==` 運算子__會__進行型別轉換，上表中所有的 falsy 值，都將先轉換為 `false`，然後才與 `true` 進行比較，結果當然為 `false`：

``` js
value == true
```

{% cheatsheet 警告 class:warning %}
不建議使用 `==` 運算子，詳見 [JavaScript - The Good Parts](http://shop.oreilly.com/product/9780596517748.do)
{% endcheatsheet %}

Falsy 值測試範例：

```
var falsy = [0, NaN, '', false, null, undefined];
var tests = {
    'if statement': function (value) {
        if (value) {
            return 'truthy';
        }
        return 'falsy';
    },
    '?: operator': function (value) {
        return value ? 'truthy' : 'falsy';
    },
    '=== operator': function (value) {
        return (value === true) ? 'truthy' : 'falsy';
    },
    '== operator': function (value) {
        return (value == true) ? 'truthy' : 'falsy';
    }
};

falsy.forEach(function (value) {
    Object.keys(tests).forEach(function (test) {
        console.log(test + ': ' + (value === '' ? "''" : value) + ': ' + tests[test](value));
    });
});
```

#### 判斷 string 值的方法

要判斷字串是否等於特定值，毫無疑問，可以使用 `===` 運算子直接進行判斷：

``` js
if (title === 'untitled') {
    // ...
}
```

然而，需要特別注意的是，`''` (空字串) 也是 falsy。

如果程式不接受空字串，也就是說，可以把空字串直接當作是未定義值，那麼可以直接進行邏輯判斷：

下面的例子，假設 `title` 是字串，且唯有當 `title` 字串長度大於 `0` 時，才進行處理：

``` js
if (title) {
    // ...
}
```

或者，當 `title` 未給定值，或者是空字串時，則給予預設值：

``` js
setTitle(title || DEFAULT_VALUE);
```

但是，若空字串也是有效值，則反而需要特別的處理。問題是，該如何判斷字串有給值 (包含空字串也算有值)？

以下皆是不佳甚至錯誤的處理方式：

``` js
// title 可能為 null
setTitle(title === undefined ? DEFAULT_VALUE : title);
// title 可能為 undefined
setTitle(title === null ? DEFAULT_VALUE : title);
// 檢查兩次
setTitle((title === null || title === undefined) ? DEFAULT_VALUE : title);
// title 可能為 null，此時 typeof title === 'object'
setTitle(typeof title === 'undefined' ? DEFAULT_VALUE : title);
// 檢查兩次，若不了解 falsy，可能會以為第二個判斷是多餘的
if (title || title === '') {
    setTitle(title);
} else {
    setTitle(DEFAULT_VALUE);
}
```

比較好的方法，是__利用 `typeof` 輔助判斷__，直接檢查該值的型態是否為 `string`：

``` js
typeof value === 'string'                   // 有給值，至少是空字串
typeof value === 'string' && value.length   // 有給值，而且是長度大於 0 的字串
```

譬如：

``` js
setTitle(typeof title === 'string' ? title : DEFAULT_VALUE);
```

#### 判斷 number 值的方法

由於 `0` 也是 falsy，因此有著與字串類似的問題：

不允許 `0` 的情況，可以直接進行邏輯判斷：

``` js
if (value) {
    // ...
}
```

允許 `0` 的情況，則建議__利用 `typeof` 輔助判斷__，直接檢查該值的型態是否為 `number`：

``` js
setValue(typeof value === 'number' ? value : DEFAULT_VALUE);
```

#### 判斷物件屬性是否存在的方法

判斷物件的屬性值，方法與上述的一般數值相同，當然也包括對於字串和數值的 falsy 值的特別處理。

如果要判斷物件是否具有某個特定的屬性的話，則又有以下不同的方式。假設要判斷 `object` 物件中是否具有 `property` 這個屬性，以下都是可行的方式：

``` js
object.property === undefined
object['property'] === undefined
typeof object.property === 'undefined'
typeof object['property'] === 'undefined'
```

然而，最好的方式，是使用 `in` 運算子：

``` js
if ('property' in object) {
    // ...
}
```

如果需要忽略繼承的屬性的話，可以使用 `.hasOwnProperty()` 函數：

``` js
if (object.hasOwnProperty('property')) {
    // ...
}
```

#### `undefined` 與 `null`，使用時機？

除了 falsy 值容易造成困擾，`undefined` 與 `null` 也是另一個容易讓人不知所措的特性。

上面的例子已經可以看到，對 `undefined` 與 `null` 直接進行邏輯判斷時，兩者皆表現為 falsy：

```
var value1;                 // undefined
value1 ? 'truthy' : 'falsy' // 'falsy'

var value2 = null;          // null
value2 ? 'truthy' : 'falsy' // 'falsy'
```

而要加以區別的話，可以如下處理：

``` js
// 判斷是否為 undefined
value === undefined
typeof value === 'undefined'
// 判斷是否為 null
value === null
```

{% cheatsheet 注意 %}
無法使用 `typeof` 運算子判斷數值是否為 `null`：

``` js
typeof value === 'object'
```

{% endcheatsheet %}

{% cheatsheet 注意 %}
在 JavaScript 中，`undefined` 不是關鍵字，而是以 global 變數的方式實作。在無法完全控制的環境下，可以像這樣確保 `undefined` 不受影響：

``` js
undefined = 'not undefined';

(function (value, undefined) {
    if (value === undefined) {
        // ...
    }
})(value);
```

{% endcheatsheet %}

關於兩者的使用時機：

##### `undefined` 如同其字面上的意義：『未定義』，應該使用在可以省略，或是可以略過定義的場合

通常使用時機如下：

1. 物件的可選屬性，
2. 函數的可選參數，以及
3. 函數的區域變數，在特定流程下也許不會用到的變數。

由於通常我們只關心其是否定義，並且 falsy 的狀況剛好可以當作未定義來處理，因此可以直接進行邏輯判斷，即使實際上該值可能為 `null` 也無妨：

__範例__

``` js
function post(url, data, options) {
    var headers;

    // options 是函數的可選參數
    options = options || {};
    // options.headers 是 options 物件的可選屬性
    if (options.headers) {
        headers = Object.assign({}, options.headers);
    }
    if (Object.isObject(data)) {
        data = JSON.stringify(data);
        headers = Object.assign(headers || {}, { "data-type": "application/json" });
    }
    // headers 是函數的區域變數，在特定流程下也許不會用到的變數。
    if (headers) {
        // ...
    }
    // ...
    // options.success 是 options 物件的可選屬性
    if (typeof options.success === 'function') {
        options.success(null, result);
    }
}
```

##### `null` 則應該用於明確表達『不具有值』的情況。

譬如資料庫在儲存欄位的時候，必須明確表示該欄位是否具有值。

``` js
employee.save({
    name: 'Jack',
    age: 15,
    license: null
});
```

再舉例，node.js 的 callback 函數，依慣例其形式為 `callback(err, result)`。

其中 `err` 是用來標示錯誤的發生，當其值不為 falsy 時，表示發生錯誤，而 `err` 通常就是錯誤訊息或存放錯誤訊息的物件。

相反地，當 `err` 為 falsy 時 (依慣例通常是 `null`，以表示：沒有 error)，這時候，`result` 用來表示回傳的結果。

``` js
function read(file, callback) {
    var data;
    try {
        // do read file
        data = ...;
        // 明確地使用 null 表示沒有錯誤發生
        callback(null, data);
    }
    catch (ex) {
        // 明確地使用 ex 做為實際參數，傳遞給 callback 做為 err 形式參數，以表示發生錯誤
        callback(ex);
    }
}

read('readme.md', function (err, data) {
    if (err) {
        throw err;
    }
    console.log(data);
});

```

### 總結：一般原則

1. 若需要檢查是否給值，而不論其 falsy 狀態，則直接使用 `typeof` 對目標型別進行確認：
``` js
if (typeof title === 'string') {
    this.title = title;
}
if (typeof options.zIndex === 'number') {
    this.zIndex = options.zIndex;
}
if (typeof callback === 'function') {
    callback(null, result);
}
```
2. 若 falsy 狀態恰巧是期望的行為，則直接進行邏輯判斷：
``` js
options = options || {};
this.title = title || DEFAULT_VALUE;
if (message) {
    console.log(message);
}
```

### 結論

由於 JavaScript 對於 falsy 值的認定過於寬鬆，甚至比 C/C++ 還寬鬆，導致在處理有效值的時候，反而需要進行額外的處理。這當然是 bad parts，而且還是無法避開的部份。希望經過本文的詳細探討之後，能幫助初學者掌握到其中的關鍵。

歡迎大家的回饋與心得分享。

### 參考文章：

* [JavaScript: The Good Parts]

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [JavaScript Programming Pattern: Resolver][javascript-programming-pattern-resolver]
* [JavaScript: Resolver vs. Promise][javascript-resolver-vs-promise]
* [JavaScript Promise: resolver vs. handler][javascript-promise-resolver-vs-handler]
{% endpostrefs %}

<!-- external references -->

[JavaScript: The Good Parts]: http://shop.oreilly.com/product/9780596517748.do
