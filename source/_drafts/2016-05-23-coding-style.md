title: "Coding Styles 之我見"
date: 2016-06-23 10:10:00
comments: true
categories:
  - Programming
tags:
  - coding style
---
### Indent: Tab or Space? That is a Question.

當使用 space 時，有幾個問題：

1. 到底要使用幾個 space 字元？用多了浪費空間，用少了 indent 不明顯。
1. 如果不顯示 space 字元，當程式比較長時，你必須很費力才能判斷目前所在 block 究竟 indent 是第幾層。
2. 如果顯示 space 字元，相信多數人絕對不會只用一個 space 字元，一般至少使用兩個字元。那麼，每個 indent 必須要使用兩個字元，這是個浪費，不過這通常不構成問題。真正的問題是：每個 indent 顯示兩個 space 字元，你會在畫面上看到雙倍的 space 字元。當你看到越多東西，就越是對你的視覺構成更大的負擔。同時，也許你沒有注意到，你的腦袋一直在幫你換算，『嗯，這邊有 6 個 space，所以這是 3 個 indent』。

![](space.png)

反過來，當使用 tab 字元時，有什麼好處？

1. 免除了 indent 到底要幾個字元的問題，2 個？ 4 個？還是 3 個？使用 tab 字元，你愛顯示為幾個字元都可以。
2. 你可以隨意調整 tab 顯示的字元數，即使不顯示 tab 字元，你還是可以很容易地區分 indent 階層。
3. 而更重要的，若選擇顯示 tab 字元，每個 tab 字元就是一個符號，既不構成視覺負擔，也不對腦力構成壓力，還可以加減節省幾個 bytes。

![](tab.png)

如過有人不遵守怎辦？

我想這其實就是過去大家偏好使用 space 的原因之一。但是，時代不同了：

1. 現代編輯器可以直接 (或裝外掛) 顯示不符合規範的部份，或者可以選擇顯示 space 及 tab 字元，可以直接看到問題，直接修改。
2. 使用 linter 可以自動檢查，可以在 build 的時候做，或者使用 git hook，在 commit 的時候檢查。

### {}

類似 CoffeeScript、Python、jade (現在被迫改名為 pug) 這樣的程式語言或模板語言，使用 indent 做為程式階層的控制，實在是對我的小小腦袋構成極大的負擔。這種程式碼，如果很短就算了，瞄一下就知道整函數在做什麼，沒什麼問題。我自己是極力避免，但是當看到長程式時，你就必須不斷地去注意目前到底是在哪個 indent，是在哪個 block 中，天啊。是輸入程式的時間多，還是看程式的時間比較多？少打幾個字，卻反而要浪費許多時間用腦力補回那些看不見但實際上必須存在的東西，真的值得嗎？

有人也許會說，Python 使用 indent 做為層級是為了強制 coding style。反問，有 {} 就不能強制嗎？

### 參考資料

https://www.facebook.com/ypcheng5673/posts/10208572178757696
https://www.youtube.com/watch?v=SsoOG6ZeyUI

为什么代码缩进时必须要用 Tab 而不能用空格
http://www.techug.com/why-tabs-are-clearly-superior