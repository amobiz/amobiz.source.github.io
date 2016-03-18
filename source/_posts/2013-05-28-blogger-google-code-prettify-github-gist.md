title: '在 Blogger 上用 Google Code Prettify 及 GitHub Gist 顯示程式碼 (不修改範本的懶人招數)'
date: 2013-05-28 01:16:59
comments: true
categories:
  - Programming
tags:
  - Blogger
  - Gist
  - GitHub
  - Google Code Prettify
  - howto
---
{% cheatsheet 異動說明 %}
由於部落格已經改用 [GitHub Pages](https://pages.github.com/) 並搬家到 [這裡](/)，現在改用 Markdown 語法撰寫文章，然後使用 [Hexo](https:/hexo.io/) 進行轉換，所以新的部落格已經不再使用這裡提到的技巧。不過，__這些技巧對於使用 [Google Blogger](http://www.blogger.com/) 的朋友仍然有效__。
{% endcheatsheet %}

### 簡介

本文介紹以下五個 [Blogger] 樣式修改及顯示程式碼的小技巧：

* [利用「新增小工具」功能，不必修改範本即可改變部落格的 CSS 樣式的方法](#利用「新增小工具」功能，不必修改範本即可改變部落格的_CSS_樣式的方法)，
* [利用](#利用_Google_Code_Prettify_顯示程式碼的最簡單方法) [Google Code Prettify][Google Code Prettify] [顯示程式碼的最簡單方法](#利用_Google_Code_Prettify_顯示程式碼的最簡單方法)，
* [利用前處理工具處理要貼上網頁的程式碼](#利用前處理工具處理要貼上網頁的程式碼)，
* [美化並強調程式碼區塊](#美化並強調程式碼區塊)，以及
* [顯示](#顯示_GitHub_Gist_程式碼，並且套用（比較）一致的顯示風格) [GitHub][GitHub] [Gist][Gist] [程式碼，並且套用（比較）一致的顯示風格](#顯示_GitHub_Gist_程式碼，並且套用（比較）一致的顯示風格)。

<!-- more -->

### 前言

昨天突然心血來潮，玩起 Blogger 的範本，想換換不同的外觀、換換不同的心情。

玩著玩著，發現「新的」動態檢視 (Dynamic Views) 功能蠻有趣的，把玩了一陣子之後，才發現很多功能在動態檢視功能下都無法使用，尤其是不支援 範本理嵌入 JavaScript，所以之前設定好的 [Google Code Prettify] 程式碼都無法作用。結果，切換回一般範本時，忘記先保留之前的修改，直接套用的結果，竟然就把整個 Google Code Prettify 程式碼都移除了。

只好再重新查找作法。同時，想到可以利用「新增小工具」的功能，直接插入 HTML/JavaScript 碼，就可以避免直接修改 HTML 範本，免得日後又再次手殘...。

#### 利用「新增小工具」功能，不必修改範本即可改變部落格的 CSS 樣式的方法

其實很簡單：

* 進入「版面配置」，
* 按下「新增小工具」，選擇「HTML/JavaScript」 - 將第三方功能或其他程式碼加入您的網誌，然後
* 直接在「內容」區塊裡面輸入任何想要的 script, style 標籤即可。

後面會看到實際作法。另外，小工具放在哪裡都無所謂。

雖然這樣做不符合將 `style`, `script` 元素放在 `head` 區塊的慣例，但其實現在網頁設計的趨勢，已經趨向於將 `script` 元素放在網頁最後面，待頁面整體架構顯示完畢後，才開始處理 script 的邏輯部分。至於 style 的部分，由於 Google Code Prettify 需要更動 `pre` / `code` 區塊的結構之後，才能以正確的方式顯示程式碼，因此在 script 尚未處理程式碼之前，css 也無法完全發揮作用。所以...為了避免直接修改 html 範本，就狠心按下去吧!

#### 利用 Google Code Prettify 顯示程式碼的最簡單方法

網路上找到的 Google Code Prettify 中文資訊，似乎還是很久以前剛做設定時同樣的那幾篇文章，做法都還是不免要直接編輯 HTML 範本，並且要修改兩、三個地方。

這是由於 Google Code Prettify 需要處理以下三個步驟：

{% cheatsheet Google Code Prettify 對程式碼的處理需要三個步驟 %}
* 載入 css 樣式表，設定程式碼顯示的樣式，
* 載入 javascript 檔案，這時候頁面很可能還沒顯示完畢，為避免遺漏，所以...
* 等待頁面顯示完畢後，再執行 javascript 程式碼，搜尋網頁中的 `<pre>`, `<code>`, `<xmp>` 元素，進行加工處理。
{% endcheatsheet %}

我直接找到 [Google Code Prettify] 的官網，在 [Getting Started] 這篇文章，說明了其實可以一個步驟自動載入必要的 CSS 檔案與 JavaScript 檔案，並且能自動在部落格頁面載入完畢後，自動尋找 `<pre>`, `<code>`, `<xmp>` 元素，處理程式碼美化。也就是說，現在啟用 Google Code Prettify 只要一行程式碼即可：

{% cheatsheet 啟用 Google Code Prettify 只要一行程式碼 %}
如果還沒有新增的話，利用前面介紹的「新增小工具」方法，插入這一行程式碼：

```html
<script src="https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js"></script>
```
{% endcheatsheet %}

其實 Google Code Prettify 還有許多功能，譬如可以利用 `skin` 參數選擇外觀，利用 `lang` 參數以程式語言的副檔名指定語言：

```html
<script src="https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js?skin=sunburst&lang=js"></script>
```

目前官方支援的外觀可以在 [skin gallery] 查找，指定參數時，指定 skin gallery 列表中的標題名稱即可。或者，也可以自己設計 css 檔案，自行修改外觀。

由於在 `script` 標籤中指定語言會套用到所有的網頁，因此 Google Code Prettify 也支援利用 `class` 屬性 `lang-*` 的方式，指明程式語言：

``` html
<pre class="prettyprint lang-scm">(friends 'of '(parentheses))</pre>
```

或者，採用 HTML5 標準，在 `code` 標籤以 `language-*` 的 `class` 屬性，指明程式語言：

``` html
<pre class="prettyprint"><code class="language-java">...</code></pre>
```

要顯示行號的話，要在 `class` 上加上 `linenums`：

``` html
<pre class="prettyprint linenums"><code>...</code></pre>
```

如果貼上的程式碼不是從頭開始，還可以指定開始的行號：

``` html
<pre class="prettyprint linenums:40"><code>...</code></pre>
```

#### 利用前處理工具處理要貼上網頁的程式碼

程式碼要貼在 html 檔案前，要先進行處理，轉換與 html 標籤有關的文字，否則會導致 html 網頁結構錯亂。

{% cheatsheet 使用工具處理程式碼中的 HTML 特殊字元 %}
我目前使用這個工具：[Javascript Tools]。開啟該網站後：
* 先選擇 **JS Encode,Decode**，
* 貼上程式碼之後，按下 **Encode** 按鈕，
* 然後複製 **HTML special chars** 的文字內容，就可以貼到 html 檔案的 code 區塊上了。
{% endcheatsheet %}

#### 美化並強調程式碼區塊

我還蠻喜歡程式碼區塊前面加上 code 標籤，凸顯程式碼區塊的做法，就如同現在各位所看到的樣子。這部分直接借用網友的做法；不過，還是放在 HTML/JavaScript 小工具中：

{% cheatsheet 為程式碼區塊加上 [code] 圖樣 %}
如果還沒有新增的話，利用前面介紹的「新增小工具」方法，插入這些程式碼：

```
<style>
pre.code {
display: block;
overflow: auto;
min-height: 30px;
max-height:800px;
padding: 0 0 0 11px;
border: 1px solid #ccc;
background: #f8f8ff url("data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAASwCAYAAAAt7rCDAAAABHNCSVQICAgIfAhkiAAAAQJJREFUeJzt0kEKhDAMBdA4zFmbM+W0upqFOhXrDILwsimFR5pfMrXW5jhZr7PwRlxVX8//jNHrGhExjXzdu9c5IiIz+7iqVmB7Hwp4OMa2nhhwN/PRGEMBh3Zjt6KfpzPztxW9MSAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzB8HS+J9kUTvzEDMwAAAABJRU5ErkJggg==") left top repeat-y;
}
code.prettyprint {
line-height: 1.2em;
margin: 1px;
}
</style>

<script src="https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js"></script>
```

要注意這裡設定了 `max-height: 800px;` 限制程式碼區塊的最大長度，這裡的值可以依照個人喜好需求調整。
{% endcheatsheet %}

另外，改成這樣之後，`pre` 標籤負責顯示 `[code]` 這個圖形標籤，而 `code` 標籤則負責程式碼美化，所以要貼上程式碼時，要這樣寫：

``` html
<pre class="code"><code class="prettyprint linenums">...</code></pre>
```

#### 顯示 GitHub Gist 程式碼，並且套用（比較）一致的顯示風格

GitHub 是現在很熱門的程式碼管理工具，它甚至也提供了純粹用來分享程式碼片段的功能: [Gist]。甚至不需要註冊，就可以使用，也支援版本管理。當然，它也提供了在網頁上顯示程式碼的功能，只要複製要 [分享的程式碼片段的頁面] 左邊的 **Embed this gist** 內容，貼到 html 上即可。

貼上的 html 程式碼，長得像這個樣子：

``` html
<script src="https://gist.github.com/amobiz/c1d9f88c5a159cd040a5.js"></script>
```

實際在網頁中顯示的樣子，可以參考後面的例子，或是可以參考這篇文章：[Differential backup using 7-Zip for Windows (Part 1) - 利用 7-Zip 進行差異備份（上篇）][differential-backup-using-7-zip]。

要挑剔的話，應該說可惜 Gist 不提供目錄和標籤功能，且一定要有檔名，如果我們不提供，系統將自動產生如 `gistfile1.js` 這樣的檔名。當分享的程式碼片段變多了，就不是很好管理。我的策略是使用文章的名稱當作前綴，這樣至少還能透過排序找出相關檔案。另外就是，我似乎找不到分享一般 GitHub 專案檔案，在網頁上直接嵌入的方法。如果有朋友知道該怎麼做的話，懇請指導一下。

我在 [amobiz's gists][amobiz-gist] 上面分享部落格中的程式碼，歡迎大家利用。

最後，就是要讓 Gist 的顯示，與我前面的設定盡量一致，所以還要修改之前的 style 標籤內容:

<!-- blogger-google-code-prettify-github-gist-style.html -->
<!-- gist inno-v/5658792 -->
{% cheatsheet 為 Gist 程式碼區塊加上 [code] 圖樣 %}
如果還沒有新增的話，利用前面介紹的「新增小工具」方法，插入這些程式碼，完整取代之前的 HTML/JavaScript 小工具的內容：
{% gist amobiz/c1d9f88c5a159cd040a5 %}
{% endcheatsheet %}

{% cheatsheet 完整程式碼 class:hidden %}
``` html
<style>
.cheatsheet {
  margin: 8px 0;
  padding: 8px;
  border: 1px solid #ccc;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  -ms-border-radius: 3px;
  -o-border-radius: 3px;
  border-radius: 3px;
  -moz-box-shadow: 0 1px 4px 0 rgba(0,0,0,0.44);
  -ms-box-shadow: 0 1px 4px 0 rgba(0,0,0,0.44);
  -o-box-shadow: 0 1px 4px 0 rgba(0,0,0,0.44);
  -webkit-box-shadow: 0 1px 4px 0 rgba(0,0,0,0.44);
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.44);
}
.hentry .gist .gist-file {
  margin-bottom: 0;
  border: none;
}
.gist, pre.code {
  display: block;
  overflow: auto;
  min-height: 30px;
  max-height:800px;
  padding: 0 0 0 11px;
  border: 1px solid #ccc;
  background: #f8f8ff url("data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAASwCAYAAAAt7rCDAAAABHNCSVQICAgIfAhkiAAAAQJJREFUeJzt0kEKhDAMBdA4zFmbM+W0upqFOhXrDILwsimFR5pfMrXW5jhZr7PwRlxVX8//jNHrGhExjXzdu9c5IiIz+7iqVmB7Hwp4OMa2nhhwN/PRGEMBh3Zjt6KfpzPztxW9MSAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzB8HS+J9kUTvzEDMwAAAABJRU5ErkJggg==") left top repeat-y;
}
code.prettyprint {
  line-height: 1.2em;
  margin: 1px;
}
</style>
<script src="//google-code-prettify.googlecode.com/svn/loader/run_prettify.js"></script>
```
{% endcheatsheet %}

### 結論

終於把處理顯示程式碼的方法，完整地整理在一起了，日後又癡呆的時候，就可以回頭參考了。

歡迎大家的回饋與心得分享。

### 參考資料：

* [在網頁中嵌入顯示程式碼：全系列效果比較及教學整理][werdna1222coldcodes]
* [在 Blogger 文章中利用 CSS Block 及 Google Code Prettify 顯示程式碼][fly2sky999]
* [在 Blogger 上用 Google Code Prettify 顯示程式碼][cookys]
* [Google Code Prettify]
* [Getting Started]
* [Gallery of themes for code prettify][skin gallery]
* [Javascript code prettifier]
* [Gist with Blogger's "Dynamic Views"][moski]
* [Javascript Tools]

<!-- cross references -->


<!-- external references -->

[Hexo]: https:/hexo.io/
[Blogger]: http://www.blogger.com/
[Google Code Prettify]: https://github.com/google/code-prettify/
[Getting Started]: https://github.com/google/code-prettify/blob/master/docs/getting_started.md
[GitHub]: https://github.com/
[GitHub Pages]: https://pages.github.com/
[Gist]: https://gist.github.com/

[skin gallery]: http://google-code-prettify.googlecode.com/svn/trunk/styles/index.html "Gallery of themes for code prettify"
[Javascript code prettifier]: http://google-code-prettify.googlecode.com/svn/trunk/README.html
[Javascript Tools]: http://iblogbox.com/devtools/js/
[分享的程式碼片段的頁面]: https://gist.github.com/amobiz/d0be531a7c109c785845
[differential-backup-using-7-zip]: http://andmobiz.blogspot.tw/2012/07/differential-backup-using-7-zip-windows.html "直接連結到 blogger 以顯示正確的效果"
[amobiz-gist]: https://gist.github.com/amobiz
[werdna1222coldcodes]: http://werdna1222coldcodes.blogspot.tw/2012/02/blog-post.html "在網頁中嵌入顯示程式碼：全系列效果比較及教學整理"
[fly2sky999]: http://fly2sky999.blogspot.tw/2012/03/blogger-css-block-google-code-prettify.html "在 Blogger 文章中利用 CSS Block 及 Google Code Prettify 顯示程式碼"
[cookys]: http://blog.cookys.net/2012/10/blogger-google-code-prettify.html "在 Blogger 上用 Google Code Prettify 顯示程式碼"
[moski]: http://blog.moski.me/2012/01/gist-with-bloggers-dynamic-views.html "Gist with Blogger's Dynamic Views"
