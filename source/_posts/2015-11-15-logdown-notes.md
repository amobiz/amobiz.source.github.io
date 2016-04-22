title: Logdown 學習筆記
date: 2015-11-15 02:05:00
comments: true
categories:
  - Software
tags:
  - Logdown
  - Markdown
  - pitfalls
---
{% credit credit:"John Breland 3" link:"https://unsplash.com/jrbreland" desc:"意象說明<br><br>Logdown 諧音 Look down" %}
![](https://images.unsplash.com/photo-1457717047216-96440b68d44c?crop=entropy&fit=crop&fm=jpg&h=975&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1075)
{% endcredit %}

### 前言

長期關注本部落格的朋友，可能有發現到，除了原本在 Blogger 的 [格物致知][andmobiz] 之外，還有一個同步更新的網站 [Fragments of Time][fragmentsoftime] 位於 [Logdown]。

這是因為我在之前的文章『{% post_link medium-vs-facebook-notes Medium 與 Facebook Notes 簡短試用 %}』中提到的，厭倦了使用 HTML 撰寫部落格，所以在 Logdown [發佈][interview]之後，曾經有一段時間，我是在 Logdown 先用 Markdown 語法撰寫文章，然後再將 HTML 複製到 Blogger 中。

現在決定改用 [GitHub Pages](https://pages.github.com/) / [hexo](https://hexo.io/zh-tw/)，上面的步驟就省了，現在我可以直接用 Markdown 寫文章，然後下個指令，就自動轉成 HTML 並且發佈。當初除了必須手動複製這個原因之外，其實在使用 Logdown 時，還遇到一些不方便的地方，並且做了一些筆記。我不確定現在這些問題是否依舊沒有改善，整理出來，給不幸遇到的朋友參考看看。

<!-- more -->

#### Q: 無法在同一頁中，建立交互連結

A: 有兩個問題:

1. Logdown 不會自動為 header 元素設定 id，所以必須自行加上 anchor 元素。如:
``` markdown
### <a id="mylink" href="#">My Link</a>
```
2. Logdown 不支援 `[link text][link reference]` 的連結語法，所以只能使用 `[My Link](#mylink)` 的語法建立連結。如：
``` markdown
Here is [My Link](#mylink).
```

參考:

[Markdown Cheatsheet]

#### Q: 在 Logdown 的 inline code 中，「`$`」顯示不出來。(2014/08/04)

A: 由於 Logdown 支援 LaTeX，其中還支援 inline math 語法，就是「`$ expression $`」，但是這樣卻反而造成顯示普通程式時的困擾，如 jQuery 的代表符號「`$`」，如果產出的 HTML 要用「`<code>`」標籤強調，用 markdown 語法必須寫成「`$`」，但是在 Logdown 中，這樣寫的時候「`$`」這個符號是顯示不出來的。目前解決方法是直接使用 HTML 標籤：「`<code>$</code>`」。

參考:

[在 logdown 裡面打複雜方程式][latex-in-logdown]

### 參考文章：

* [Markdown Cheatsheet]
* [在 logdown 裡面打複雜方程式][latex-in-logdown]
* [台灣製造，新一代部落格平台 Logdown 團隊專訪][interview]

### 相關文章：

<!-- cross references -->

* {% post_link medium-vs-facebook-notes Medium 與 Facebook Notes 簡短試用 %}

<!-- external references -->

[Logdown]: http://logdown.com/
[interview]: http://www.inside.com.tw/2013/07/17/logdown-interview-a "台灣製造，新一代部落格平台 Logdown 團隊專訪"
[andmobiz]: http://andmobiz.blogspot.tw/ "格物致知"
[fragmentsoftime]: http://fragmentsoftime.logdown.com/ "Fragments Of Time"
[Markdown Cheatsheet]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#links
[latex-in-logdown]: http://nan.logdown.com/post/2013/08/03/write-complex-latex-equations-in-logdown-by-mathjax-support "在 logdown 裡面打複雜方程式"
