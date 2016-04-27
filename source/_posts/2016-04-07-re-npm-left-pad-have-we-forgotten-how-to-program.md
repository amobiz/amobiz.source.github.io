title: "反駁：NPM & left-pad: Have We Forgotten How To Program?"
date: 2016-04-07
comments: true
category:
  - Programming
tags:
  - NPM
  - Programming
  - Open Source
	- modularity
	- JavaScript
---
{% credit credit:"Dmitrii Vaccinium" link:"https://unsplash.com/@vaccinium"	desc:"意象說明<br><br>JavaScript 社群 < 百家爭鳴 < 車廠＋車廂<br>黎明？黃昏？" %}
![](https://images.unsplash.com/photo-1434871619871-1f315a50efba?crop=entropy&fit=crop&fm=jpg&h=975&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1075)
{% endcredit %}



[前一陣子](http://qz.com/646467/how-one-programmer-broke-the-internet-by-deleting-a-tiny-piece-of-code/)，[`left-pad`](https://github.com/azer/left-pad) 的作者，因為不滿 npmjs.com 屈從財團的壓力，未經作者同意就擅自移轉所有權，因此憤而將全部模組從 npm 下架，而導致眾多知名模組受到波及。此事件引起了廣泛的反思。

然而，漸漸出現一種聲音，開始呼籲大家不要使用 open source、要盡量自己寫程式碼，不要依賴別人的模組，就像這篇文章：『[NPM & left-pad: Have We Forgotten How To Program?](http://www.haneycodes.net/npm-left-pad-have-we-forgotten-how-to-program/)』([中譯](http://qianduan.guru/2016/04/04/npm-left-pad-have-we-forgotten-how-to-program/))。更有甚者，連『懂得怎麼寫程式之前，別去玩 node.js 好嗎？』這樣的話都出來了。

<!-- more -->

### 走火入魔？

首先，該文作者提到，整個事件的源頭，`left-pad` 只有 11 個星星 (話說現在已經有 710 顆星星)，只有 11 行程式碼。整個產業卻因 11  行程式碼而崩潰實在不可思議。

我還是要說，造成崩潰的並不是這 11 行程式碼，這 11 行程式碼並沒有造成任何程式執行錯誤，這 11 行程式碼沒有品質問題；造成崩潰的是這 11 行程式碼，掌握在不遵守 open source 遊戲規則的 npmjs.com 手中；造成崩潰的是，整個產業的運作，竟是依賴在這樣一家公司上。(說的有點重，但是實在是無法接受傾斜於財團而欺壓獨立開發者的行為。)

Npm 事件的問題，是整個 ecosystem 『把持』在少數特定企業而衍生的危機，解法應該是盡可能的分散化，不要依賴於『中央集權』。就像 Java 現在把持在 Oracle 手中，遲遲不肯實現 open source 的承諾而遭人唾棄一樣。

這跟 open source 如何演化，跟程式設計師會不會寫程式，根本毫無關係。

作者提到：

> There’s a package called isArray that has 880,000 downloads a day, and 18 million downloads in February of 2016. It has 72 dependent NPM packages. Here’s its entire 1 line of code:
1
> `return toString.call(arr) == '[object Array]';`

作者在文中就提到，依賴於 `isArray()` 的模組，有 72 個。只有 72 個相依性，竟然有人可以稱之為『瘋狂的引用他人的模組』、『走火入魔』。

#### 模組下載數量怎麼算？

那『18 million downloads in February of 2016』又怎麼說呢，大家不是在『瘋狂下載』？

大家真的知道 npm 的 download 數怎麼計算的嗎？

以我的 [globjoin](https://www.npmjs.com/package/globjoin) 為例，只不過僥倖被 [stylelint](https://github.com/stylelint/stylelint) 一個模組引用，現在每個月都有超過三萬次下載，請問，有人瘋狂地引用我的模組嗎？沒有，只有一個 stylelint 引用！三萬次下載你以為就有三萬個不重複使用者嗎？也不是，每次模組更新，就會重新下載，合併計算。

作者舉的 [`isArray`](https://www.npmjs.com/package/isarray) 例子，大家可以去看看它的[相依模組](https://www.npmjs.com/browse/depended/isarray)，其中不乏像 [browserify](https://www.npmjs.com/package/browserify)、[buffer](https://www.npmjs.com/package/buffer) 這樣的重量級模組。我可以說，`isArray()` 的超高下載量，跟我的 globjoin 的現象相同 (當然等級不同)，只是被某些知名的模組引用了。並沒有人『瘋狂的引用他人的模組』，好嗎？！

至於另一個例子 [`is-positive-integer`](https://www.npmjs.com/package/is-positive-integer)，『檢查一個整數是否是正數』這個模組的存在本身，的確符合作者的理論。但是由這個模組的實際下載量根本不高來看，更只能證明，顯然絕大多數的開發者並不會貿然使用毫無意義的模組。沒有人使用的模組，就算它依賴於兩萬個模組，影響也極有限。特地拿一個沒有人使用的模組來指責全體開發者，有何意義？

#### 一部分要歸咎於歷史因素

至於像 `isArray` 這樣的函數的存在，正是因為過去並沒有原生的函數可以使用，而導致每個人都要自己寫一個系統本應該要有的功能。這一點在英文原文下面的討論，是一個攻防重點，大家不妨去看看。

回頭看看 `isArray()` 的實現：

```js
return toString.call(arr) == '[object Array]'
```

沒錯，只有短短的一行。但是捫心自問，不參考任何文件、資料，你隨時都寫的出來嗎？
如果你每次__又要再寫一遍__的時候，都還需要翻找文件，這樣真的會比較快嗎？

#### 再來談談封裝

如果程式中到處充滿 `return toString.call(arr) == '[object Array]'`，你就必須直接看到程式碼的細節，而無法像 Bob 大叔在『[Clean Code](http://www.books.com.tw/products/0010579897)』中所說的，程式碼應該要『讓名稱代表意圖』。於是，你還是會把它封裝成 `isArray()`。封裝之後，請問你會把它放在哪裡？

__某個模組裡！__

這麼一來，跟直接引用別人的模組，又有何不同，只不過是自己寫的就會比較好看？就不存在模組相依性問題？

不要忘了，別人還寫好了測試程式。

沒有測試程式的程式碼，就是『遺留程式碼』。

你為了不要『相依』別人的模組，自幹了自己的模組，然後不寫測試？好吧，你會寫測試，那麼，這就不是『一行程式碼』的問題了。從頭到尾，你只是在重複別人已經處理好的問題。

### 『Have We Forgotten How To Program?』

作者提到，一個簡單的『blank project template』就要引用 28,000 個檔案，這是不是太過複雜了？甚至於直接結論：

> I get the impression that the NPM ecosystem participants have created a fetish for micro-packages.

『開發者有一種不良的、對微型模塊的熱衷。』

> It feels to me as if the entire job of an NPM-participating developer is writing the smallest amount of code possible to string existing library calls together in order to create something new that functions uniquely for their personal or business need.

只想『拼拼湊湊、串起來交差』。

先不論這 28,000 個檔案，究竟實際被專案引用的有多少，而用來輔助專案開發的比例又有多少。如果一個專案實際上就是有這些需求，那麼這些檔案，不論改用何種方式撰寫，它們的複雜性並不會因此降低，並不是把 100 個函數，全部寫在一起，變成為一個函數，它就變得不複雜了；事實上剛好相反。

過去開發者不斷地重新發明輪子，而軟體專家則不斷地疾呼要 reuse。終於現在 JavaScript 社群蓬勃發展，大家支持 open source，信任 open source 反而變成『不良』的習慣？

### 『Functions Are Not Packages』

模組並不是這樣定義的。根據維基百科對『[Modularity](https://en.wikipedia.org/wiki/Modularity)』的定義：

> In software design, modularity refers to a logical partitioning of the "software design" that allows complex software to be manageable for the purpose of implementation and maintenance. The logic of partitioning may be based on related functions, implementation considerations, data links, or other criteria.

『在軟體設計中，模組化是指軟體設計的邏輯分割，以允許複雜的軟體，能夠以可管理的方式實作及維護。邏輯分割可能基於相關性、實作考量、資料連結、以及其它要素。』

要我說，任何具有獨立性、內聚性，可以管理的東西，都可以將它做成模組，哪怕只是提供一些常數。

『[Do one thing and do it well](https://en.wikipedia.org/wiki/Unix_philosophy)』，『程式應該只關注一個目標，並儘可能把它做好。讓程式能夠互相協同工作。』稟持著 Unix 的設計哲學，node.js 社群也信奉這個原則，讓每個元件，做到最好，讓每個元件，能夠隨意組合使用。

### 『Third Party Problems』

> There’s absolutely no guarantee that what someone else has written is correct, or even works well. Even if correct, is it the most optimal solution possible? At least when you write the code yourself, you can easily modify it to fix bugs and improve its efficiency. Not that there should be many bugs in 1 line functions.

沒有人強迫你用他們的模組，你要使用前，本應做好評估。甚至，如果你是 TDD 派，只要你的程式碼通過測試，就是該模組的功能符合你的需求的證明。更何況如果你對該模組有疑慮，大可以針對該模組撰寫測試來進行評估。『為什麼要幫別人寫測試？』你問。這一段程式你原本不是要自幹？難道自幹就不用寫測試？

至於，如何保證引用的模組，是『最有效率的解決方案』？好問題，你如何證明你自幹的程式碼，是『最有效率的解決方案』？

『至少我自己寫的程式碼，要怎麼改就可以怎麼改。』---- 你知道 open source 是什麼意思嗎？

> Second, even if the package’s logic is correct, I can’t help but be amazed by the fact that developers are taking on dependencies for single line functions that they should be able to write with their eyes closed. In my opinion, if you cannot write a left-pad, is-positive-integer, or isArray function in 5 minutes flat (including the time you spend Googling), then you don’t actually know how to code.

我前面已經回答過了，忘記的話請自行回捲。

### 『Strive For Few Dependencies』

> The more dependencies you take on, the more points of failure you have.

你自己寫的程式碼也是一樣，如果你不寫測試的話。

> have you vetted any of the programmers who have written these functions that you depend on daily?

你每天吃進肚子裡的東西，穿在身上的衣服，出門開的車，住的房子，你有去審核評估過製作者嗎？

還是那句話，別人都已經攤開 source 給你看了，為什麼還偏偏要自己寫？你要不要相信這些程式碼，由測試決定！要是怕 npm 又出問題，不會把用到的模組都複製一份到 local repo，或是自己架個 server 嗎？

### 結論

作者其實只有一個重點：只有自己會寫程式，別人都是笨蛋都不會寫程式，所以不要相信別人寫的程式。即使別人寫的程式有嚴謹的測試，自己的卻沒有。

一個開源社群的茁壯非常不容易，落井下石卻很簡單。



