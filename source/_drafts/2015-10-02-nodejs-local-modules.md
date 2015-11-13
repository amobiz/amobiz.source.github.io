title: node.js 連結本地模組
date: 2015-11-11 20:05:00
comments: true
categories: 
tags:
  - HTML
  - Markdown
  - Blogger
  - Medium
  - Facebook Notes
---
### 前言

一般來說，自己開發的模組，多半不會對外公開 (如透過 [npmjs.com](https://www.npmjs.com/))。但是基於共用程式碼的理由，專案與模組之間往往又必須相互引用。在不考慮採用 [npm private modules](https://www.npmjs.com/private-modules) 的前提下，本文介紹共用本地模組的諸多方法。

<!-- more -->

### 使用 [`npm link`](https://docs.npmjs.com/cli/link) 指令來連結共用的本地模組

假設有兩個專案： common 及 app，其中 common 是要共用的專案，而 app 要引用 common 專案。同時假設目錄結構如下：
```
~/projects
  /common
    /lib
      lib_1.js
    index.js
  /app
    /src
      /modules
        module_1.js
      main.js
```

* 為 common 建立共享連結 (可當作是 local 的 [publish](https://docs.npmjs.com/cli/publish))
```bash
$ cd ~/projcets/common
$ npm link
```

* 為 app 連結 common (可當作是 local 的 [install](https://docs.npmjs.com/cli/install))
```bash
$ cd ~/projects/app
$ npm link common
```
這樣，在 app 中，就可以像一般的公開模組一樣引用 common：
```javascript
var common = require('common');
```
如果要直接引用 common 內部的模組，只要指定相對於 common 的模組路徑：
```javascript
var common_lib_1 = require('common/lib/lib_1');
```


若要移除 app 對 common 的引用：
```bash
$ cd ~/projects/app
$ npm unlink common
```

要移除 common 的共用，不再讓其他專案引用：
```bash
$ cd ~/projcets/common
$ npm unlink
```

缺點：

* 多人同時開發專案，或開發環境變動時，都要重新進行設定，
* 若決定要公開 publish 專案，必須先將透過 `npm link` 引用的模組公開，或者直接含入專案。

#### 使用 [link-directories](https://github.com/purposeindustries/link-directories) 自動化引用設定：
利用 `link-directories` 這類工具，可以協助在專案初始化階段，進行引用的設定，省去設定的說明文件。

__package.json__
```json
"scripts": {
  "postinstall": "link-directories"
},
"link-directories": [{
  "src": "../common",
  "dest": "node_modules/common"
}]
```

```bash
$ cd ~/projects/app
$ npm i -D link-directories
$ npm install
```
缺點：

* 模組之間若有循環引用，執行 `npm install` 時會陷入無窮迴圈  [註]，
* 使用相對路徑引用專案，因此專案之間的目錄結構，在所有的環境下必須一致，
* 若決定要公開 publish 專案，必須先將透過 `npm link` 引用的模組公開，或者直接含入專案。

#### 在 `postinstall` 執行 `npm link` 自動化此一過程：
如果有權限可以修改所有的涉入的專案，可以考慮此方案。

* 要被引用的本地專案，利用 `postinstall` 將自己公開：

common's __package.json__
```json
"scripts": {
  "postinstall": "npm link"
}
```
```bash
$ cd ~/projects/common
$ npm install
```
* 要引用共用模組的專案，利用 `postinstall` 連結相關模組：

app's __package.json__
```json
"scripts": {
  "postinstall": "npm link common"
}
```

```bash
$ cd ~/projects/app
$ npm install
```
優點：

* 不需要使用額外的輔助工具，
* 透過 `npm link` 引用模組，因此專案之間的目錄結構，__不需要__在所有的環境保持一致。

缺點：

* 專案與模組之間若有循環引用，執行 `npm install` 時會陷入無窮迴圈，
* 若決定要公開 publish 專案，必須先將透過 `npm link` 引用的模組公開，或者直接含入專案。

### 直接在 package.json 中指定本地相依模組 (適用於 npm version 2.0.0 以後版本)
```bash
$ cd ~/projects/app
$ npm install ../common
```
或者，直接修改 __package.json__：
```json
"dependencies": {
  "../common": "*",
}
```
然後
```bash
$ npm install
```
這樣就可以引用本地模組。
 
與 `npm link` 不同的是，透過這種方式引用本地模組，會複製被引用的模組在 node_modules 目錄下。因此，當被引用的本地模組更新時，必須在 app 專案目錄下，重新執行 `npm install` 指令。

缺點：

* 使用相對路徑引用專案，因此專案之間的目錄結構，在所有的環境下必須一致，
* 若決定要公開 publish 專案，必須先將本地的模組公開，或者直接含入專案。

### 連結專案自己的子模組
當專案本身變得龐大起來，一定要盡可能地模組化，使每個模組保持[職責單一](https://en.wikipedia.org/wiki/Single_responsibility_principle)。但是模組一多，就容易在專案中出現 `../../../../../../..` 引用。如何避免？推薦大家詳讀 [browserify-handbook](https://github.com/substack/browserify-handbook)。其中 [organizing modules](https://github.com/substack/browserify-handbook#organizing-modules) 一節，提到如何避免專案中出現 `../../../../../../..` 引用。

### 將專案自己的子模組放在 node_modules 目錄下

將 __.gitignore__
```
node_modules
```
改成：
```
node_modules/*
!node_modules/foo
!node_modules/bar
```

> 這個作法，我覺得最大的風險，是難免手賤直接砍掉整個 node_modules 目錄。或者備份的時候自動忽略所有的 node_modules 目錄。如果沒有頻繁 git commit 的話，就哭哭了。


### 連結專案本身
在專案並不大的情形下，上面的作法似乎有點小題大作。但是若考慮到專案的測試原始碼，通常是獨立於專案原始碼 (通常是在 src 或 app 目錄下)，另外存放在 test 目錄下，與專案模組平行發展。這麼一來，在測試程式中，就必須使用如下的方式，才能引用專案模組：

~/projects/app/test/modules/__module_1.test.js__ 要引用 ~/projects/app/src/modules/__module_1.js__：
```javascript
var module_1 = require("../../src/modules/module_1");
```

```bash
$ cd ~/projects/app
$ npm link
$ npm link app
```

連結之後，就可以寫成這樣：

```javascript
var module_1 = require("app/src/modules/module_1");
```
總算不必再辛苦計算相對路徑到底有幾層了。

缺點：

* 由於連結引用專案自身，造成循環引用，若企圖自動化，也就是若透過 package.json 的 `postinstall` script 來自動建立連結，則只要在專案目錄下執行 `npm install`，就會導致 npm 陷入無窮迴圈。
* 若決定要公開 publish 專案，恐怕須先修改測試程式。否則就必須令使用者自行進行連結；不然，就會讓模組使用者看到那令人吃驚的『無窮迴圈』。

---
[註] 造成無窮迴圈的原因，是因為在 `npm install` 指令執行的過程中，每當有模組下載完成或 link 進來時，便會依序執行該模組的 `preinstall`, `install`, `postinstall` 等指令。注意其中 `install` 指令，又會遞迴去下載該模組的相依模組。由於循環參照的緣故，這個動作就不斷地重複。不過，實際上迴圈跑了幾次之後就會停下來，這是因為，每次處理相依模組，路徑就會以 `/node_modules/<module_name>` 的形式不斷增長，直到碰觸到 [作業系統路徑長度限制](https://en.wikipedia.org/wiki/Comparison_of_file_systems#cite_note-note-12-9) 為止。


