title: '為什麼我要開發 Regular Expression Generator - RegexGen.js'
date: 2014-08-05 16:42:19
comments: true
categories:
  - Programming
tags:
  - CommonJS
  - GitHub
  - JavaScript
  - Regular Expression
  - nodejs
  - npm
  - regex
  - open source
---
[
  ![](http://38.media.tumblr.com/376a46baffe3444282f3b414a2fd0d46/tumblr_n9hxcf3Bm91st5lhmo1_1280.jpg)
](http://unsplash.com/post/93258573139/download-by-s-zolkin)

[RegexGen.js] is a JavaScript Regular Expression Generator that helps to construct complex regular expressions.

如同我在 [Regular Expression 學習筆記][regular-expression-javascript-study-notes-1-theory-1] 所說明的：「學習 regular expression 的關鍵，不在於記憶簡寫符號，而是對引擎匹配原理的掌握。」最佳的 regular expression 學習方法，就是先學習正則引擎的匹配原理。想要快速查閱重點的話，可以參考前三篇學習筆記: [(1)][regular-expression-javascript-study-notes-1-theory-1], [(2)][regular-expression-javascript-study-notes-2-theory-2], [(3)][regular-expression-javascript-study-notes-3-informal-bnf-grammar]，如果有充足的時間的話，當然還是建議詳閱 [Mastering Regular Expressions] 這本書。

然而，畢竟正則表達式的語法相當緊湊，想要一眼看懂複雜的表達式，幾乎是不可能的。首先必須熟悉正則表達式的 meta-character (元字元)，然後一步一步拆解。雖然有 [RegexBuddy] 這樣的軟體可以幫忙拆解，但即使能正確的拆解，也可能無法了解作者 (通常是自己) 原本的思考邏輯，或者要避免的問題。

<!-- more -->
<!-- forkme https://github.com/amobiz/regexgen.js -->

如果使用的是 Perl 或 PHP 之類的程式設計語言，可以使用註解模式來撰寫 regular expression，這樣撰寫的時候，一方面可以直接將 sub-expression (子表達式) 一一拆解開來，方便辨識，另一方面可以寫上註解，說明該 sub-expression 的用途、考量的問題、使用的技巧等。

最後，就是正則表達式本身的 meta-character 的記憶問題。如果不是經常需要接觸 regular expression 的人，相信每隔一段時間要再回過頭來使用 regular expression 時，一定會有這樣的困擾：雖然已經熟悉引擎的匹配原理，但是要撰寫的時候，恐怕還是需要查表確認才行。另外，像要匹配 `"]"`, `"}"` 字元時，其實不需要 escape (轉義)、以及在 character class (字元組)裡面，匹配 `"^"`, `"-"` 字元的特殊使用技巧等，不查資料的話，應該很難記得住吧?

那麼，是不是可以重新設計 regular expression 的語法，讓它不要這麼不容易理解呢? 在讀過 [Easy regular expressions with JSVerbalExpressions] 這篇文章，見識到 [JSVerbalExpressions] 之後，我知道我事實上是可以重新設計 regular expression 的語法，只不過，並不是整個重新設計，而是經由程式產生器：一個能夠產出接近完整 regular expression 語法的產生器，能夠像人寫的一樣好，並且語法本身能夠一目瞭然。

這就是 [RegexGen.js] 了。RegexGen.js 的設計，謹守著下列目標：

1. 寫出來的程式碼，應該易讀易懂。
2. 產出來的程式碼，應該要像專家寫的一樣緊湊，不要為了產生器本身容易撰寫，而產出機械式程式碼。尤其是不要產出不必要的 `{}` 或 `()`。
3. 不再需要手動對元字元進行轉義。(除了 `\` 元字元本身。或者使用了表達式置換 (regex overwrite) 功能。)
4. 如果產生器力有未逮，無法產生理想的子表達式，必須要能夠在語法中直接指定替代的子表達式。也就是表達式置換功能。

至於為什麼是 JavaScript? 雖然 C++, Java 都是我更熟悉的語言，但是自從開始接觸 JavaScript 之後，應該說，自從讀過 [JavaScript: The Good Parts] 之後，我覺得開始愛上這門輕巧簡單的程式語言了。

希望 JavaScript 版的 RegexGen 只是個開始，藉由它的 [open source][open-sourced-my-javascript-regular-expression-generator-regexgenjs]，由此拋磚引玉，吸引同好投入開發、除錯、改進、加強，甚至開發各種語言的 regular expression generator。

### 參考資料

* [Mastering Regular Expressions]
* [Learn, Create, Understand, Test, Use and Save Regular Expressions with RegexBuddy][RegexBuddy]
* [JSVerbalExpressions - JavaScript Regular expressions made easy"][JSVerbalExpressions]
* [Easy regular expressions with JSVerbalExpressions]
* [JavaScript: The Good Parts]
* [RegexGen.js]

### 相關文章：

* [Regular Expression (JavaScript) 學習筆記 (1) - 原理篇 (上)][regular-expression-javascript-study-notes-1-theory-1]
* [Regular Expression (JavaScript) 學習筆記 (2) - 原理篇 (下)][regular-expression-javascript-study-notes-2-theory-2]
* [Regular Expression (JavaScript) 學習筆記 (3) - Informal BNF 語法][regular-expression-javascript-study-notes-3-informal-bnf-grammar]
* [Open Sourced my JavaScript Regular Expression Generator - RegexGen.js][open-sourced-my-javascript-regular-expression-generator-regexgenjs]

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[Mastering Regular Expressions]: http://shop.oreilly.com/product/9780596528126.do
[RegexBuddy]: http://www.regexbuddy.com/ "Learn, Create, Understand, Test, Use and Save Regular Expressions with RegexBuddy"
[JSVerbalExpressions]: https://github.com/VerbalExpressions/JSVerbalExpressions "JSVerbalExpressions - JavaScript Regular expressions made easy"
[Easy regular expressions with JSVerbalExpressions]: http://macr.ae/article/jsverbalexpressions.html "Easy regular expressions with JSVerbalExpressions"
[JavaScript: The Good Parts]: http://shop.oreilly.com/product/9780596517748.do
[RegexGen.js]: https://github.com/amobiz/regexgen.js "RegexGen.js is a JavaScript Regular Expression Generator that helps to construct complex regular expressions"
