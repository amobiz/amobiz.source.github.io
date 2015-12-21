title: "The Problems of JSHint (JSHint 的問題)"
comments: true
date: 2015-12-20 06:30:30
category:
  - Programming
tags:
  - JavaScript
  - JSHint
  - lint
  - pitfalls
---
最早的 JavaScript [linter] 是 [JSLint]，但是由於作者 [Douglas Crockford] 設定了太多個人主觀認定必須要遵守的強制規則，而且很少有妥協的餘地，所以後來強調可以配置規則的 [JSHint] 漸漸崛起，我自己從一開始就是使用 JSHint，並且也用了蠻長一段時間。然而...

<!-- more -->

### JSHint 的問題

過去使用 JSHint 時，有非常多的困擾：

#### 1. 難以確認發生錯誤的規則

預設情況下，根本無法從它的錯誤訊息中，得知是違反那一條[規則][JSHint Options]。每次遇到錯誤，只能利用它的錯誤訊息來搜尋文件，每次幾乎都是看完所有的文件，還是找不到正確的規則。然後你才會不小心[發現 (想起來)][JSHint Doc]，它可以在執行的時候指定 `--verbose` 參數，然後就會顯示對應的規則代碼 (warning code)，譬如 `(W034)`。這難道不應該是預設行為才對嗎？

最糟糕的是，JSHint 的 API 並不支援 `verbose` 選項，這是寫在 [`cli`][JSHint CLI] 模組裡的，也就是說，如果你是使用自動化建制工具，如 [Gulp] 或 [Grunt]，那麼你永遠看不到規則代碼！

#### 2. 沒有完整的規則代碼列表

好不容易總算找到規則代碼了，到它的[文件][JSHint Doc]頁面，在右上角輸入規則代碼，按下 "Jump to docs" 搜尋，結果只會跳到 [JSHint Options] 頁面，好吧，那麼應該在頁面上搜尋得到吧，按下 Ctrl+F 搜尋，還是找不到 `W034`。

翻遍文件，你絕對找不到任何說明，除了文件[首頁的介紹文章][Search W034]中，以 `W034` 介紹如何開關警告錯誤訊息時提到。

那麼，`W034` 到底是什麼呢？還好，有 [JSLint Error Explanations] 這樣的網站，可以在這裡查詢錯誤代碼，譬如：搜尋 [W034][jslinterrors W034]，可以找到這個錯誤是 [Unnecessary 'use strict']，在這裡可以看到極為詳細的說明。

#### 3. 規則代碼無法望文生義

當你調整好規則，繼續快樂地 coding。幾天之後，你再次看到 `W034`，卻根本記不得這條規則是什麼。像這種寫在 source code 檔案中的 directives： `/* jshint -W034 */`，除非你在旁邊寫註解來說明這條規則，否則你光是看到 `W034`，根本稿不清楚這是什麼規則。但是這樣一來，每個檔案都必須重複同樣的內容，根本違反 [DRY] 原則。

那麼，寫在 `.jshintrc` 檔案如何？很不幸的是，`.jshintrc` 檔案是 [JSON] 格式，而標準 JSON 是不能有註解的。更不用提 JSHint 文件上根本就沒有提到像 `W034` 這樣的規則，要如何寫在 `.jshintrc` 檔案中了。

在 Google 直接搜尋 `W034`，可以找到在這個 [Grunt] 的 [Issue][Grunt Issue 59] 中，有人回答了 Grunt 的作法：

``` javascript
jshint: {
  options: {
    '-W034': true
  }
}
```
同樣的方法也可以套用在 `.jshintrc` 檔案中。

#### 4. 配置選項與規則代碼兩套規則

前面提到的[文件][JSHint Doc]頁面，裡面提到的 directives 使用的 [options][JSHint Options] 都是像 `unused` 及 `eqnull` 這樣的選項。這些選項，比較像是大分類，而執行 JSHint 時所報告的錯誤，實際可能是由這些選項、或是預設的選項所控制，但是卻無從得知這些規則代碼與配置選項之間的對應關係。所以，即使你很仔細地設定了每一條配置選項， JSHint 還是有可能會報告錯誤。除非你已經是 JavaScript 的專家，在面對 JSHint 報告的發生錯誤的規則代碼時，你很難知道究竟是那一條規則所造成的，於是，你只能以規則代碼去查詢 [JSLint Error Explanations] 網站。最後，恐怕還是只能在 source code 上寫下 `/* jshint -W034 */` 。

### 結論

其實 JSHint 自己也[承認][JSHint Doc]這些問題的存在：
> Trying to figure out how JSHint options work can be confusing and frustrating (and we're working on fixing that!)

在 JSHint 變得更酷之前，就先允許我們小小地[叛逃][applying-eslint-using-atom-linter-eslint]吧。

### 參考文章：

* [JSHint Documentation][JSHint Doc]
* [JSHint Options][JSHint Options]
* [JSHint在线文档翻译（一）：基本介绍][JSHint Doc CN]
* [JSHint在线文档翻译（二）: 选项][JSHint Options CN]

### 相關文章：

* [(ESLint 學習筆記) Applying ESLint - Using Atom & linter-eslint][applying-eslint-using-atom-linter-eslint]

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[linter]: https://en.wikipedia.org/wiki/Lint_%28software%29
[JSLint]: http://www.jslint.com/
[Douglas Crockford]: https://en.wikipedia.org/wiki/Douglas_Crockford
[JSHint]: http://jshint.com/docs/
[JSHint Options]: http://jshint.com/docs/options/
[JSHint Doc]: http://jshint.com/docs
[JSHint CLI]: https://github.com/jshint/jshint/blob/master/src/cli.js
[Search W034]: https://www.google.com.tw/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=site%3Ajshint.com%20W034
[JSLint Error Explanations]: https://jslinterrors.com/
[jslinterrors W034]: https://jslinterrors.com/?q=W034
[Unnecessary 'use strict']: https://jslinterrors.com/unnecessary-use-strict
[DRY]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[JSON]: https://en.wikipedia.org/wiki/JSON
[Gulp]: http://gulpjs.com/
[Grunt]: http://gruntjs.com/
[Grunt Issue 59]: https://github.com/gruntjs/grunt-contrib-jshint/issues/59

[JSHint Doc CN]: http://xianjing.github.io/blog/2013/10/16/jshint-doc/ "JSHint在线文档翻译（一）：基本介绍"
[JSHint Options CN]: http://xianjing.github.io/blog/2013/10/21/jshint-options/ "JSHint在线文档翻译（二）: 选项"
