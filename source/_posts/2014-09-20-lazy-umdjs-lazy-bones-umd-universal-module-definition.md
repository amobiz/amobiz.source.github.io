title: 'Lazy-umd.js - 懶人 UMD (Universal Module Definition)'
date: 2014-09-20 18:32:59
comments: true
categories:
  - Programming
tags:
  - AMD
  - CommonJS
  - GitHub
  - JavaScript
  - RequireJS
  - UMD
  - open source
---
[
![](https://unsplash.imgix.net/44/E5KMvPp9SsCnqmEGUwAS_2014-08-10%2012.56.40%201.jpg?q=75&fm=jpg&auto=format&s=f5f8fc5b9a9da6696369befc0497fe47)
](https://unsplash.imgix.net/44/E5KMvPp9SsCnqmEGUwAS_2014-08-10%2012.56.40%201.jpg?q=75&fm=jpg&auto=format&s=f5f8fc5b9a9da6696369befc0497fe47)

### 前言

最近在整理過去寫的程式庫，想要統一支援 script loader，同時又很貪心地想要：

1.同時支援 AMD (RequireJS)、CommonJS (node.js) 及 browser，解決不同語法差異。
2.模組套用時，避免修改 script loader 程式碼的需要。

研究了一下，發現偉大的 [Addy Osmani] 已經寫了 [UMD]。UMD 可以滿足第一點，但是應該是為了避免 script loader 程式碼擁腫，所以套用的時候，一定要修改 script loader 的部分。所以我自己整理出兩種做法，放在 [Github][lazy-umd.js] 供大家參考：

<!-- more -->
<!-- forkme https://github.com/amobiz/lazy-umd.js -->

### 方法一、傳統的 factory 模式

```
(function (name, /* optional */deps, factory) {
    'use strict';

    /* global define, require, module, window */
    var i;

    // deps is not an array, means the module has no dependencies, and deps is a factory function.
    if (typeof deps === 'function') {
        factory = deps;
        deps = [];
    }

    // AMD (RequireJS)
    if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
    // CommonJS (node.js)
    else if (typeof module !== 'undefined' && module.exports) {
        if (deps.length) {
            for (i = 0; i < deps.length; ++i) {
                deps[i] = require(deps[i]);
            }
        }
        module.exports = factory.apply(null, deps);
    }
    // Browser globals
    else {
        if (deps.length) {
            for (i = 0; i < deps.length; ++i) {
                deps[i] = window[deps[i]];
            }
        }
        window[name] = factory.apply(null, deps);
    }
})('MyModule', ['Promise'], function (Promise) {
    'use strict';

    return {
    };
});
```

模組的定義寫在後半段的 factory 方法中，然後當作參數傳遞給前面的 script loader 函數，控制權在 script loader 函數。這種寫法在語法上比較接近 RequireJS 的做法。

#### 優點：

1. 大量的程式庫都是採取與 UMD 類似的做法。容易了解。

#### 缺點：

1. 如果相依性較多，則會有很長的相依陣列，這是 RequireJS 原本就有的問題。
2. 模組的主體定義在後面，強迫程式設計師先看到與模組無關的程式碼。
3. 針對 RequireJS 而言，無法支援不匯出模組的 `require()` 函數。      (這其實不算缺點，畢竟就是要定義模組，讓模組能盡量支援各種不同的執行環境，才需要考慮 script loader 的相容性問題。一般應用程式通常執行環境早已確認。)

### 方法二、builder 串接語法模式

```
(function (module) {
    'use strict';

    module('MyModule')
        .require('Promise')
        .define(function (Promise) {
            return {
            };
        });

})(function (name) {
    'use strict';

    /* global define, require, module, window */
    var deps = [];

    // AMD (RequireJS)
    if (typeof define === 'function' && define.amd) {
        return {
            require: function (lib) {
                deps.push(lib);
                return this;
            },
            define: function (factory) {
                define(deps, factory);
            },
            run: function (script) {
                require(deps, script);
            }
        };
    }
    // CommonJS (node.js)
    else if (typeof module !== 'undefined' && module.exports) {
        return {
            require: function (lib) {
                deps.push(require(lib));
                return this;
            },
            define: function (factory) {
                module.exports = factory.apply(null, deps);
            },
            run: function (script) {
                script();
            }
        };
    }
    // Browser globals
    else {
        return {
            require: function (lib) {
                deps.push(window[lib]);
                return this;
            },
            define: function (factory) {
                window[name] = factory.apply(null, deps);
            },
            run: function (script) {
                script();
            }
        };
    }
});
```

這是模仿 [melchior.js] 的做法。

在後半段先定義好 script loader，然後當作參數傳遞給模組定義函數，控制權在模組定義函數。

#### 優點：

1. 模組的主體定義在前面，避免與模組無關的程式碼的干擾。
2. 相依模組的定義清晰易懂；若無相依也可以直接略掉 `.require()` 的呼叫。

#### 缺點：

1. Script loader 部分的程式碼變得更為冗長。

{% cheatsheet 題外話 %}
[melchior.js](https://github.com/voronianski/melchior.js) 為了避免在它的模組定義函數 `body()` 中重新宣告相依模組變數，選擇將相依模組變數都放到 global，如果採用的話需要多加注意。
{% endcheatsheet %}

### 參考資料:

* [Addy Osmani]
* [UMD]
* [lazy-umd.js]
* [melchior.js]

<!-- cross references -->


<!-- external references -->

[Addy Osmani]: https://github.com/addyosmani
[UMD]: https://github.com/umdjs/umd
[lazy-umd.js]: https://github.com/amobiz/lazy-umd.js
[melchior.js]: https://github.com/voronianski/melchior.js
