title: 'Regular Expression (JavaScript) 學習筆記 (1) - 原理篇 (上)'
date: 2014-08-03 00:06:54
comments: true
categories:
  - Programming
tags:
  - JavaScript
  - Regular Expression
  - regex
---
### 前言

過去初學 regular expression 時，看了許多入門教學及參考資料，但多數資料幾乎都只是將一些表達式符號一一列出，然後再舉一些無關緊要的範例，以為這樣就可以弄懂 regular expression 了。做為初學者，看到這麼多的表達式符號，就以為 regular expression 很難學。直到看了 [Mastering Regular Expressions, 3rd Edition] 這本書，才知道其實是被誤導了。雖然 regular expression 提供了許多簡寫符號，但是大多數的簡寫符號多半只是為了縮短表達式的長度，這些簡寫符號只要在使用的時候查一下，實際使用過就可以熟悉了，根本不需要特別花時間記憶。其實學習 regular expression 的關鍵，不在於記憶簡寫符號，而是對引擎匹配原理的掌握。

<!-- more -->

### 正則表達式

正則表達式是強大、極富彈性、高效的文本處理工具。

其通用的模式表示法，具有如同迷你程式語言般的功能，賦予使用者描述和解析文本的能力。
配合上特定工具提供的支援，正則表達式能夠添加、移除、分離 (isolate)、疊加 (fold)、插入 (spindle) 和截斷 (mutilate) 各類型的文本和數據。

完整的正則表達式是由兩類不同的字元構成，特殊字元是由 `*`, `+`, `?`, `^` 之類的字元構成，稱為 metacharacters (元字元)，其餘的字元稱為 literal (文本字元) 或是 normal text characters (普通文字字元)。

可以把 metacharacters  想像為程式語言中的 operator (運算子)，而 literal 則是 operand (運算元)。

(事實上，literal 本身也應該算是 operator： literal 中的每個字元，都代表必須匹配一個字元，而且是逐字元匹配。)

完整的正則表達式是由如上述的小的建構模塊單元組成。每個單獨的建構模塊都很簡單，過它們能夠以無窮多種方式組合，要將它們結合起來實現特殊目標，則必須依靠經驗。

### 歷史

正則表達式的源起，是代數學上的 regular sets (正則集合)。

代數學家 [Stephen Cole Kleene] 發明了一套簡潔的表示正則集合的方法，稱為 regular expressions (正則表達式)。

Stephen Cole Kleene 的正則表達式，使用的是 [Deterministic Finite Automaton] (DFA, 確定性有限狀態自動機)，是一種不使用回溯的有限狀態機。是真正數學意義上的正則集合。

而由 Perl 語言所引領風潮的正則表達式，包括 JavaScript，所採用的正則引擎則屬於 [Nondeterministic Finite Automaton] (NFA, 非確定性有限狀態自動機) 引擎。這種引擎實際上已經不是數學意義上的正則表達式了。[Mastering Regular Expressions, 3rd Edition] 的作者 Jeffrey E. F. Friedl 將這種引擎比擬為「燃油引擎」，意思是它跟正統的 DFA 引擎相比，更難掌控，但威力強大，如果控制得宜，可以做到 DFA 引擎做不到的功能。 (簡單地說，可以玩出更多花樣。)

### NFA 引擎匹配基本原理

這裡介紹的匹配原理，是以描述程式處理邏輯的方式說明，不涉及數學公式。以下文章在內文中提到正則表達式時，會以「`expression`」的方式表示，在提到文本以及匹配的文本時，會以 `"literal"` 的方式表示。

#### 由文本的起始位置開始，逐字元測試、匹配整個正則表達式

NFA 引擎進行匹配時，是以字元為單位，由文本的起始位置，事實上是第一個字元之前的**位置**，開始嘗試匹配。由此位置，逐字元測試**整個**正則表達式能匹配文本的各種可能性。

若由當前位置所進行的各種可能性的嘗試都失敗時，則引擎將捨棄當前位置所鄰接的字元，向前推進到文本的下一個字元之前的**位置**，由此位置，繼續測試整個正則表達式能匹配文本的各種可能性。

在引擎找到匹配結果前，必須在文本的所有位置上重複上述過程。過程中，一旦其中任何一種可能性能夠通過整個正則表達式的測試，則整個正則表達式匹配成功。

若引擎推進到最後一個字元後面的位置，在此位置的各種嘗試仍告失敗，則整個正則表達式匹配失敗。

由上可知，當引擎宣告匹配失敗時，引擎必然嘗試了所有的可能性。所以必須注意當匹配失敗時，可能會有的效率問題。

#### 優先選擇最前端的匹配結果 (The Match That Begins Earliest Wins)

由於 NFA 引擎是由文本的起始位置，逐字元測試整個正則表達式，同時，在不斷嘗試的過程中，一旦其中任何一種可能性能夠通過測試，則整個正則表達式匹配成功。因此，只要正則表達式能匹配成功，則其必定是在所有可能結果的最前端。

譬如，下例的匹配結果，是 `"belly"`，而不是 `"fat"`：

``` js
"The dragging belly indicates your cat is too fat".match(/fat|cat|belly|your/);    // [ "belly" ]
```
{% cheatsheet Regular Expression 語法快速說明 %}
這裡的 「`fat|cat|belly|your`」代表多選結構。由「`|`」所分隔的任一表達式，如果能成功匹配文本，即代表該多選結構成功完成匹配。請參考後面 [BNF 語法](#bnf-grammar) 的說明。
{% endcheatsheet %}

雖然「`fat`」出現在多選結構中的第一項，但引擎在測試完所有的可能性之前，絕不會向前推進，略過當前字元。引擎會逐字元測試整個正則表達式的所有可能性，過程中不斷失敗，然後向前推進。直到當引擎推進到『^ belly』這個位置時，此時，可選結構中的「`belly`」通過測試，因此正則表達式測試成功，匹配結果為 `"belly"`。

#### 標準匹配量詞是匹配優先的 (The Standard Quantifiers Are Greedy)

除了直接指定簡單的匹配字元文字 (literal)，正則表達式也能指定要匹配的內容的重複次數，這就是 quantifier (量詞) 的作用。

標準匹配量詞有 `+`, `?`, `*`, `{m,n}`。(詳見後面 [BNF 語法](#bnf-grammar) 的說明)

使用量詞來約束子表達式時，進行嘗試的次數是存在下限和上限的。而標準匹配量詞總是希望獲得最長的可能匹配。也就是說，它們**總是嘗試匹配盡可能多的字元**，直到匹配上限為止。這正是它的名字 **greedy (貪婪)** 的由來。

譬如:

``` js
"Subject: Hi there".match(/Subject: (.*)/);       // [ "Subject: Hi there", "Hi there" ]
"Subject: Hi there".match(/Subject: (.*)(.*)/);   // [ "Subject: Hi there", "Hi there", "" ]
```
{% cheatsheet Regular Expression 語法快速說明 %}
「`.`」代表匹配任意字元；
「`*`」代表前面的字元，也就是這裡的「`.`」，可以匹配最少 0 次，最多無限次；
「`()`」代表要將匹配的內容，另外捕捉、儲存下來。

請參考後面 [BNF 語法](#bnf-grammar) 的說明。
{% endcheatsheet %}

第一個例子， 唯一的「`(.*)`」匹配 `"Subject: "` 之後的全部內容: `"Hi there"`。

第二個例子， 第一個「`(.*)`」仍然匹配 `"Subject: "` 之後的全部內容: `"Hi there"`。 而第二個「`(.*)`」則匹配到空內容 `""`。

這是因為 「`*`」量詞是匹配優先的，所以第一個「`(.*)`」會盡可能匹配所有可以匹配的字元，

由於「`.`」代表匹配任意字元，所以「`(.*)`」會匹配 `"Subject: "` 之後的所有的字元，直到整個文本結束。

即使在第二個例子中，存在有兩個「`(.*)`」，第一個「`(.*)`」仍然會嘗試匹配所有的字元，直到文本結束。

由於此時再無其它可匹配字元，第一個「`(.*)`」匹配結束，由第二個「`(.*)`」開始嘗試匹配。

在此情況下，第二個「`(.*)`」將首先從文本的最後一個字元後面的位置開始進行測試。

這時候雖然已經沒有字元可以匹配了，但由於「`*`」量詞可以匹配最少 0 次，所以，第二個「`(.*)`」成功匹配到空字元 `""`。

整個表達式匹配成功。

#### 匹配優先量詞 (以及後面提到的忽略優先量詞) 總想獲得全局匹配 (Greediness and Laziness Always Favor an Overall Match)

前面的例子，剛好第二個「`(.*)`」可以匹配 0 個字元，所以整個正則表達式可以匹配成功。然而，如果在包含匹配優先量詞的表達式之後，還有其它表達式，並且期望獲得至少一個字元的匹配，是否該表達式就會匹配失敗呢？

為了成功匹配整個正則表達式，為了使匹配優先量詞後續的表達式也能匹配 (然後才能使整個正則表達式成功匹配)，有時候引擎必須要求量詞表達式將已經匹配的字元再交還 (吐) 出來，這個過程叫做 **relinquish (放棄)** 或 **unmatch (交還)**。(其實這只是 backtracking (回溯) 的一個特例，詳見後面 backtracking 的說明。)

譬如:

``` js
"Subject: Hi there".match(/(.*): (.*)/);        // [ "Subject: Hi there", "Subject:", "Hi there" ]
"Subject: Re: Hi there".match(/(.*): (.*)/);    // [ "Subject: Re: Hi there", "Subject: Re:", "Hi there" ]
```

首先，因為「`*`」量詞是匹配優先的，所以兩個例子中的第一個「`(.*)`」會嘗試匹配所有的字元，直到文本結束。

由於此時再無其它可匹配字元，第一個「`(.*)`」匹配結束，由下一個表達式「`:`」開始嘗試匹配。

由於此時已達文本結束位置，再無其它字元可以匹配，

而引擎知道前一個量詞表達式實際上不需要匹配全部的字元即可滿足匹配條件，

此時引擎會要求前面的量詞表達式交還已匹配的最後一個字元，讓後續的表達式嘗試匹配。

在這兩個例子中，此時將交還最後一個 `"e"`，並且由 `"e"` 前方的位置開始嘗試匹配，即:『Subject: Hi ther ^ e』。

由於「`:`」無法匹配 `"e"`，匹配失敗。

此時引擎會繼續要求前面的表達式交還已匹配的最後一個字元，讓後續的表達式繼續嘗試匹配。

此過程一直重複，直到交還 `":"` 字元時，此時，第一個例子所在的位置是『Subject ^ : Hi there』，

而第二個例子所在的位置是『Subject: Re ^ : Hi there』。

此時，「`:`」成功匹配，接下來由第二個「`(.*)`」開始嘗試匹配。

「`*`」量詞是匹配優先的，所以第二個「`(.*)`」匹配剩餘的所有字元。

所有的表達式匹配完成，整個表達式匹配成功。

#### 忽略優先量詞是忽略優先的

在前面的第二個例子裡，兩個「`*`」量詞分別匹配到 `"Subject: Re:"` 及 `"Hi there"`。如果我們期望的結果是： `"Subject:"` 及 `"Re: Hi there"` 呢。由於匹配優先量詞的特性，使得處理這樣的問題變得複雜而困難。為此，部分 flavor (流派)，包含 JavaScript，提供了所謂忽略優先量詞。

{% cheatsheet Regular Expression 語法快速說明 %}
忽略優先量詞有 `+?`, `??`, `*?`, `{m,n}?`。(請參考後面 [BNF 語法](#bnf-grammar) 的說明。)

對，就是標準匹配量詞後面再加個 「`?`」。
{% endcheatsheet %}

忽略優先量詞的特性，與標準匹配量詞相反，是忽略優先的，也就是**總是嘗試匹配盡可能少的字元**。這正是它的名字 **lazy (懶惰)** 或 **reluctant (厭惡)** 的由來。

譬如:

``` js
"Subject: Re: Hi there".match(/(.*?): (.*)/);    // [ "Subject: Re: Hi there", "Subject", "Re: Hi there" ]
```

由於忽略優先量詞總是嘗試匹配盡可能少的字元，「`(.*?)`」首先決定略過匹配 (或者說，匹配 `""`)。

接下來，「`:`」嘗試匹配 `"S"` 字元，匹配失敗。

於是引擎又回到「`(.*?)`」，「`(.*?)`」只好「勉強」匹配了一個字元 `"S"`，然後又交給下一個表達式繼續嘗試匹配。

當然，「`:`」嘗試匹配 `"u"` 字元又匹配失敗了。

於是引擎又回到「`(.*?)`」，「`(.*?)`」再匹配一個字元，然後又交給下一個表達式繼續嘗試匹配。

如此不斷重複，直到「`(.*?)`」匹配到 `"t"` 為止。

接著，「`:`」嘗試匹配`":"` 字元，終於匹配成功了。

於是又接著嘗試下一個表達式「` `」空白字元表達式也成功匹配了文本空白字元。

然後是「`(.*)`」，這是匹配優先量詞，所以，匹配到文本結束，成功匹配。

於是，整個正則表達式成功匹配。

我們也成功取得第一個 `":"` 之前的文本，以及之後 (其中包含了第二個 `":"`) 的全部文本。

這裡可以看到，如果由文本的同一個位置開始，存在多個可能的匹配結果時，匹配優先量詞總是匹配最長的結果；忽略優先量詞總是匹配最短的結果。

事實上，匹配優先與忽略優先量詞，兩者的唯一差異，在於嘗試匹配的路徑的次序不同。匹配優先量詞總是先嘗試最長的結果；忽略優先量詞總是先嘗試最短的結果。

#### Backtracking (回溯)

NFA 引擎最重要的性質是，它會依序處理各個子表達式或組成元素，在遇到需要在兩個 (或多個) 成功的可能中進行選擇時，它會**選擇**其一，同時**記住 (儲存)** 另一個，以備稍後可能的需要。

##### 選擇什麼

需要做出選擇的情形，包括量詞 (決定是否嘗試另一次匹配) 和多選結構 (決定選擇哪個多選分支，留下哪個稍後嘗試)。

對於量詞而言，在做選擇的時候，如果需要在「進行嘗試」和「跳過嘗試」之間做選擇，

對於**匹配優先量詞**，引擎會優先選擇「進行嘗試」，但在嘗試之前，先儲存目前位置以及「跳過嘗試」的選項；

而對於**忽略優先量詞**，在滿足匹配數量下限前，行為與匹配優先量詞一致。

滿足下限之後，會選擇「跳過嘗試」，但在跳過之前，先儲存目前位置以及「進行嘗試」」的選項。

(所以匹配優先量詞總是匹配最長的結果；忽略優先量詞總是匹配最短的結果。)

對於**多選結構**而言，在做選擇的時候，多數的 FNA 引擎，包括 JavaScript，會依序處理在表達式中的多選分支。

基本做法就是，將多選分支依反向次序，連同文本當前位置儲存起來，然後由第一個多選分支開始進行測試。

(所以對於從同一個位置開始的文本，如果存在多個分支可以同時匹配，則總是排在前面的多選分支獲得匹配。)

不論選擇哪一途徑，如果它能夠匹配成功，而且正則表達式的餘下部分也成功了，匹配即告完成。如果正則表達式中餘下的部分，最終匹配失敗，引擎會知道需要回溯到之前做出選擇的地方，選擇其它備用分支繼續嘗試。

##### 回溯到哪裡

而當強制回溯發生時，引擎總是回到最後儲存的選擇項目。實際運作方式即為 LIFO (Last In First Out, 後進先出)，如同堆疊般運作。

對於**匹配優先量詞**，引擎會退回到「進行嘗試」之前的位置 (等於就是 unmatch 一個字元)，如果這個退回動作，會導致匹配的字元少於量詞要求匹配的下限，則量詞匹配失敗，引擎必須退回更早的儲存位置 (由其它表達式儲存的位置) 。否則，量詞仍然處於匹配成功的狀態，引擎又推進到下一個表達式，嘗試匹配這個被 unmatch 的字元。

對於**忽略優先量詞**，引擎會退回到當初「跳過嘗試」之前儲存的位置 (其實就是當前位置)，由量詞「進行嘗試」匹配一個字元。若這個字元無法匹配，則量詞匹配失敗，由於退回此狀態之前的後續表達式也已經失敗，所以整個表達式匹配失敗。如果個字元匹配成功，則量詞匹配成功，在達到匹配數量上限之前，量詞又面臨到「進行嘗試」和「跳過嘗試」的選擇，忽略優先量詞再次選擇「跳過嘗試」，同時儲存目前位置以及「進行嘗試」」的選項，然後向引擎報告匹配成功。引擎則繼續推進到下一個表達式，嘗試匹配下一個字元。

對於**多選結構**而言。需要回溯的時候，只要依循 LIFO 原則，將儲存的狀態取出，即可依照多選分支列舉的先後順序依序處理。

這樣，藉由選擇路徑和回溯，引擎最終會嘗試表達式的所有可能途徑 (或者是匹配完成之前需要的所有途徑)。

### 小結

到這裡，已經介紹完了正則引擎的基本功能與原理。在學習時，可以多看看現成的範例，了解專家們在構造正則表達式的過程中如何思考。譬如 [Regular Expressions Cookbook, 2nd Edition] 裡，就有相當多的範例。另外，搭配查閱 [非正式 BNF 語法][regular-expression-javascript-study-notes-3-informal-bnf-grammar]，可以更快掌握正則表達式的完整功能。

[下一篇文章][regular-expression-javascript-study-notes-2-theory-2]，將介紹更強大的功能：lookaround (環視)。

### 參考資料

* [Stephen Cole Kleene]
* [Deterministic Finite Automaton]
* [Nondeterministic Finite Automaton]
* [Mastering Regular Expressions, 3rd Edition]
* [Regular Expressions Cookbook, 2nd Edition]

### 相關文章

* [Regular Expression (JavaScript) 學習筆記 (1) - 原理篇 (上)][regular-expression-javascript-study-notes-1-theory-1]
* [Regular Expression (JavaScript) 學習筆記 (2) - 原理篇 (下)][regular-expression-javascript-study-notes-2-theory-2]
* <span id="bnf-grammar"></span>[Regular Expression (JavaScript) 學習筆記 (3) - Informal BNF 語法][regular-expression-javascript-study-notes-3-informal-bnf-grammar]
* [Open Sourced my JavaScript Regular Expression Generator - RegexGen.js][open-sourced-my-javascript-regular-expression-generator-regexgenjs]
* [為什麼我要開發 Regular Expression Generator - RegexGen.js][why-i-developed-javascript-regular-expression-generator-regexgenjs]

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[Stephen Cole Kleene]: http://en.wikipedia.org/wiki/Stephen_Cole_Kleene
[Deterministic Finite Automaton]: http://en.wikipedia.org/wiki/Deterministic_Finite_Automaton
[Nondeterministic Finite Automaton]: http://en.wikipedia.org/wiki/Nondeterministic_Finite_Automaton
[Mastering Regular Expressions, 3rd Edition]: http://shop.oreilly.com/product/9780596528126.do
[Regular Expressions Cookbook, 2nd Edition]: http://shop.oreilly.com/product/0636920023630.do
