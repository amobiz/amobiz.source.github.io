title: Applying ESLint - Using Atom & linter-eslint (ESLint 學習筆記)'
comments: true
date: 2015-12-21 12:48:30
category: Programming
tags: ESLint, lint, tutorial
---
使用 Atom 編輯器，安裝上 linter-eslint 外掛，再加上一個現成的 ESLint 範本，就可以開始無痛投入到 ESLint 懷抱了。

然後找了一個現成的[範版](https://gist.github.com/Corhero/856c9612ce61d22bf100)做為起點，直接放到專案目錄下，就可以開始移轉了。

<!-- more -->

### 轉移到 ESLint

很慶幸我恰巧選擇了使用 [Atom](https://atom.io/) 編輯器，及 [linter-eslint](https://atom.io/packages/linter-eslint) package 外掛來進行轉換工作。

然後找了一個現成的[範版](https://gist.github.com/Corhero/856c9612ce61d22bf100)做為起點，直接放到專案目錄下，就可以開始移轉了。

linter-eslint 其實是 [linter](https://atom.io/packages/linter) 的 plugin，而 linter 的界面做的相當好，可以在編輯器中直接強調錯誤的程式碼，以及違反的規則，這一點我覺得是讓 linter-eslint 最好用的功能，你只要根據規則名稱，到 [Rules](http://eslint.org/docs/rules/) 搜尋一下，就可以找到對應的說明，然後就可以判斷自己要不要遵守這條規則，或是根據自己的喜好或習慣，開關或調整規則的選項。

<% quote http://www.sitepoint.com/comparison-javascript-linting-tools/ >
When comparing it with ESLint, it’s also more difficult to know which rules you need to change in order to enable or disable certain error messages.
</%>

<!-- more -->

### 目錄

[][1]
[](#id)

### 段落標題

[][2]

### 列表

* 項目
* 項目
* 項目
* 項目
  * 子項目
  * 子項目

1. 項目
2. 項目
3. 項目
4. 項目
  1. 子項目
  2. 子項目

### 表格

|title-1|title-2|
|:-----:|:------|
|=Column-1|=Column-2|
|Cell-1|Cell-2|

### 內嵌程式碼

This is `inline` code.

### 程式碼區塊

__filename__
``` lang
```

### GitHub Gist 程式碼

{% gist id %}

### 結論

歡迎大家的回饋與心得分享。

### 參考文章：

* [][1]
* [][2]

### 相關文章：

* [][1]
* [][2]

<!-- cross references -->

[1]: link "title"
[2]: link "title"

<!-- external references -->

[1]: link "title"
[2]: link "title"
