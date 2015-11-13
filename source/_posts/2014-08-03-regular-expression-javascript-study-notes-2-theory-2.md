title: 'Regular Expression (JavaScript) 學習筆記 (2) - 原理篇 (下)'
date: 2014-08-03 00:06:55
comments: true
categories: 
tags:
  - JavaScript
  - Regular Expression
  - regex
---
### 前言

[上一篇][regular-expression-javascript-study-notes-1-theory-1] 介紹了正則引擎的基本功能與原理，接下來介紹功能更為強大的 lookaround (環視)。

### Lookaround (環視) 不會佔用匹配字元

有時候，要匹配的文本主體，需要滿足的條件不只一個；或者，需要對上下文進行多重約束。

然而，對於一般的表達式而言，一旦文本匹配成功，便會由表達式所佔有；也就是說，同一段文本，絕不可能同時由兩個表達式所匹配。

另一方面，有時候，需要確保匹配的文本主體不含特定的內容，但是這個特定的內容，不是一個單一字元。在單一字元的情況下，我們可以使用否定型字元組來處理。但是在多重字元的情況下，卻很難使用一般的表達式辦到。

在這樣的需求下，許多新的 flavor (流派) 開始支援 lookaround (環視) 的功能。

對於環視表達式，最重要的特性就是，它們不會 consume (吃掉) 任何字元：不論匹配結果是否成功、不論是肯定型還是否定型、不論是順序還是逆序，引擎都會回到開始匹配前的原點，並且丟棄所有匹配的內容以及過程中儲存的備選狀態。在此之後，引擎才會根據環視表達式的匹配成功與否，進行下一個動作：當匹配成功時，引擎由目前位置繼續下一個表達式的匹配；當匹配失敗時，引擎回溯 (請參考前面回溯的說明) 到上一個儲存點 (這是由上一個表達式所儲存)，繼續由上一個表達式儲存的下一個選擇進行嘗試 (或繼續回溯到上上個表達式)。

(環視使用的是一種擴展的 NFA：[NFA-λ (也叫做 NFA-ε 或有 ε 移動的 NFA)][NFA-λ]，它允許轉換到新狀態的變換不消耗任何輸入符號。)

可以這樣想像，lookaround (環視) 就像是站在原地不動，向前或向後觀望。依照環視檢視文本的方向，可以區分為 lookahead (順序環視) 和 lookbehind (逆序環視)。

<!-- more -->

#### Lookahead (順序環視)

Lookahead (順序環視)，或稱為「順向環視」、「向前環視」，顧名思義是在原地向前看的意思。也就是先偷看還沒看過的內容，確認是否符合預期，只有在接下來的內容能夠滿足指定條件的前提下，才繼續由下一個表達式、由目前位置開始後續的測試。(注意這裡的「前」，是 ahead 的意思，是指對引擎而言，擺在引擎前方尚未測試過的文本。與中文的「先前」，英文的 previous 意思不同。由於在中文裡，ahead 與 previous 的翻譯都有「前」這個字眼，但是實際上方向卻完全相反，為避免混淆，建議使用「順序環視」（依照檢視的順序），以強調環視測試文本的方向與引擎測試文本的方向，兩者之間的關係。) 

順序環視表達式的語法為：

肯定型：

```
(?=expression)
```

否定型：

```
(?!expression)
```

其中，對於肯定型順序環視表達式，其子表達式必需匹配文本，才算匹配成功。對於否定型順序環視表達式，其子表達式必需不匹配文本，才算匹配成功。 (請參考後面 [BNF 語法](#bnf-grammar) 的說明)

##### Lookbehind (逆序環視)

Lookbehind (逆序環視)，或稱為「逆向環視」、「向後環視」，顧名思義是在原地往後看的意思。也就是由目前位置回頭測試文本。只有在目前位置之前的內容能夠滿足指定條件的前提下，才繼續由下一個表達式、由目前位置開始後續的測試。(注意這裡的「後」，是 behind 的意思，是指對引擎而言，擺在引擎後方已經測試過的文本。與中文的「後續」，英文的 next 意思不同。由於在中文裡，behind 與 next 的翻譯都有「後」這個字眼，但是實際上方向卻完全相反，為避免混淆，建議使用「逆序環視」（依照檢視的相反順序），以強調環視測試文本的方向與引擎測試文本的方向，兩者之間的關係。)

逆序環視表達式的語法為：

肯定型：

```
(?<=expression)
```

否定型：

```
(?<!expression)
```

其中，對於肯定型逆序環視表達式，其子表達式必需匹配文本，才算匹配成功。對於否定型逆序環視表達式，其子表達式必需不匹配文本，才算匹配成功。 (請參考後面 [BNF 語法](#bnf-grammar) 的說明)

注意，JavaScript 只支援 lookahead，不支援 lookbehind。這裡特意列出以完整說明 NFA 引擎的正則表達式的能力。

注意：lookahead (順序環視表達式) 所允許的子表達式，在多數的流派中都沒有特殊限制。而的 lookbehind (逆序環視表達式) (JavaScript 不支援) 通常限定子表達式的匹配長度必須固定。

##### 匹配的文本主體需要滿足多重條件

針對本節開頭所描述的問題，當要匹配的文本主體，需要滿足的條件不只一個時，可以將順序環視表達式置於用來匹配主體的表達式的前方。或者將逆序環視表達式置於其後方。像這樣：

```
(?=lookahead-expression-1)(?!lookahead-expression-2)(main-expression)
```

或

```
(main-expression)(?<=lookbehind-expression-1)(?<!lookbehind-expression-2)
```

譬如，下面的表達式，來自於 [Mastering Lookahead and Lookbehind] 這篇文章，用來檢查密碼是否符合規範：

``` js
/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)\w{6,10}$/
```

其中：

「`\w{6,10}`」 就是匹配主體，要求匹配文本必須是英數字或底線，包含最少 6 個字元，最多 10 個字元。

「`(?=.*?[a-z])`」 是肯定型順序環視，要求匹配的文本中，必須含有小寫的英文字母。

「`(?=.*?[A-Z])`」 是肯定型順序環視，要求匹配的文本中，必須含有大寫的英文字母。

「`(?=.*?\d)`」 是肯定型順序環視，要求匹配的文本中，必須含有數字字母。

注意，其中「`.*?`」是前面介紹過的忽略優先量詞，意思是，先忽略，直接匹配後面的表達式。若後面的表達式匹配失敗，再回過頭來由「`.`」匹配一個任意字元，然後又繼續嘗試匹配後面的表達式。在這裡的效果，就是不斷地測試文本是否含有後面的表達式指定的字元，直到測試成功 (匹配)，或抵達文本的結尾，然後失敗 (不匹配)。由於這裡都是肯定型，整個表達式，意義就是：匹配 6 到 10 個英數字或底線字母，其中必須包含大寫英文字母、小寫英文字母、數字字母至少各一個字元。

##### 匹配文本的上下文需要滿足指定條件

當要匹配的內容，必須出現在特定的字元之後。

由於 JavaScript 不支援 lookbehind，這裡只列出 [Mastering Regular Expressions 一書 66 頁的 Perl 語言的範例][Mastering Regular Expressions, p.66]，該範例利用逆序環視來為數值加上每三位數出現一次的 `","` 逗號，使數值的位數更容易分辨：

``` perl
$text =~ s/(?<=\d)(?=(\d\d\d)+(?!\d))/,/g;
```

基本原理就是，添加逗號時必須由個位數開始計算，每三位數添加一個逗號。實際上，要插入逗號的「位置」是，左邊有數字 (上文)，右邊的數字的個數正好是 3 的倍數 (下文)。以下讓我們一步一步來看建構的過程：

要找出個位數，先要找出一整串數字，因為這整串數字最右邊的數字就是個位數字。由此導出「`\d+`」。

由於要每三位數添加一個逗號，這串數字至少要含有三位數，少於三位數就不需要添加逗號了。由此導出「`\d\d\d`」。

但是這樣一來，超過三位數的數字，匹配到的就會是最高位數開始往右算的三個數字，而不是由個位數往左算的三個數字。譬如 `"12345"` 這串數字，匹配到的將是 `"123"` 而不是 `"345"`。仔細想想個位數有什麼特別的地方呢? 就是它的右邊 (下文) 沒有數字。這時候第一個否定型向前環視登場了，我們可以使用「`(?!\d)`」來保證右邊沒有數字，也就是確保匹配的是由個位數往左算的三個數字。由此導出的是「`(\d\d\d)(?!\d)`」。

由於每三位數都要添加一個逗號。因此應該是「`(\d\d\d)+(?!\d)`」。

由於要添加逗號的位置，是位於連續三位數的左邊的「位置」，上述的表達式卻會吃掉字元，因此需要使用順序環視來進行測試，以保持位置不變。由此導出「`(?=(\d\d\d)+(?!\d))`」。

同上，找到的這個「位置」，它的左邊 (上文) 也必須有數字。否則，這表示已經到達整串數字的最高位數，那麼這個「位置」也不需要添加逗號。這時候，就必須使用肯定型逆序環視表達式，來確保這個位置的左邊確實有數字存在。由此導出「`(?<=\d)(?=(\d\d\d)+(?!\d))`」。

上面的表達式，一次只會匹配一個「位置」(在數值字串所有需要插入逗號的位置的最左邊那個)。同時字串中可能包含多個數值字串，必須全部處理。所以必須使用 global search，找出所有的數值字串的適當「位置」。由此導出「`/(?<=\d)(?=(\d\d\d)+(?!\d))/g`」。

配合 Perl 語言提供的功能，可以在以上每個找到的「位置」，插入 `","` 逗號。由此導出「`$text =~ s/(?<=\d)(?=(\d\d\d)+(?!\d))/,/g`」。

書中也指出，可以使用捕獲型群組，來模擬逆序環視：

``` perl
$text =~ s/(\d)(?=(\d\d\d)+(?!\d))/$1,/g;
```

這裡最前面的「`(\d)`」捕捉的，正是上面第 6 點提到的肯定型逆序環視表達式捕捉到的那個數字字元，所以使用置換功能來插入逗號時，必須包含該字元，所以取代字串為「`$1,`」。

另外，舉個簡單的例子，若需要匹配 `$9999` 這樣的字串，又不想包含前面的 `"$"`，只想要取得數值字串時，可以使用下列表達式：

``` perl
/(?<=$)\d+/
```

同樣，若不使用逆序環視，可以使用：

``` perl
/$(\d+)/
```

這裡與前面插入逗號的例子相反，捕捉的是數值字串本身，所以「`$1`」代表的就是我們所要的結果。

##### 確保匹配的文本主體不含特定內容

到這裡應該很清楚了，這個情況可以使用否定型順序環視來實現。

這裡引用 [Mastering Regular Expressions, 167 頁][Mastering Regular Expressions, p.167] 的例子，用來匹配一個 HTML 中，完整的 `<b></b>` 標籤。

首先，若使用匹配優先量詞，「`<b>.*</b>`」，非常有可能會匹配到 `"<b> ... </b> ... <b> ... </b>"` 這樣的結果。

使用忽略優先量詞，「`<b>.*?</b>`」，仍然有可能匹配到 `"<b> ... <b> ... </b>"` 這樣的結果。

由這一點可以知道，忽略優先量詞並不是排除型字元組的多字元版的完美替代方案。

使用否定型順序環視，就可以安全地排除多重字元：

``` js
/<b>(?:(?!<\/?b>).)*<\/b>/
```

{% cheatsheet Regular Expression 語法快速說明 %}
這裡的「`(?: ... )`」代表非捕獲型群組。請參考後面 [BNF 語法](#bnf-grammar) 的說明。
{% endcheatsheet %}

注意，在這個例子裡，`"<b>"` 及 `"</b>"` 同時是必須包含的內容 (也就是做為標籤的邊界符號)，同時又是 `"<b>"` 及 `"</b>"` 標籤之間的內文 (對 JavaScript 而言，就是 `innerHTML`) 中不可出現的內容 (否則找到的就不是一個獨立的標籤了)。因此，這裡的否定型順序環視表達式，必須與「`.`」元字元，一同由「`*`」量詞一起修飾。也就是說，在開頭的「`<b>`」表達式匹配完之後，在匹配內文時，必須逐字元檢視，確認該字元起始的文本，不是 `"<b>"` 或 `"</b>"`，如果不是，就可以把該字元視為內文，由「`.`」匹配。否則，一旦遭遇 `"<b>"` 或 `"</b>"`，否定型順序環視表達式匹配失敗，導致「`*`」量詞回溯到上一個儲存位置，也就是 `"<"` 之前的位置，然後「`*`」量詞結束 (並成功) 匹配 (記住「`*`」量詞可以匹配 0 次)。接著，再由「`<\/b>`」繼續匹配。

##### 完全排除特定內容

有一個簡化的特別情況，如果要排除的內容本身，不需要以任何形式存在於要匹配的內容中，也就是單純要加以排除時，其實有更快速的方法，就像前面的檢查密碼範例一樣，只是這裡使用的是否定型順序環視表達式：

``` js
/^(?!.*?hede).*$/
```

這裡的 `"hede"` 是要排除的字串。其中「`.*?`」是前面介紹過的忽略優先量詞，意思是，先忽略，直接匹配後面的表達式，也就是「`hede`」。若後面的表達式匹配失敗，再回過頭來匹配一個任意字元，然後又繼續嘗試匹配後面的表達式。在這裡的效果，就是環視表達式不斷地測試文本是否含有 `"hede"` 字串，若抵達文本的結尾都沒有發現 `"hede"` 字串，則否定型順序環視表達式匹配成功。於是，引擎又回到原點，也就是文本的開始位置，然後由「`.*`」匹配優先量詞，直接匹配到字串尾端。匹配成功。

這個表達式的效率，在最差的情形下，都比 `/^(?:(?!hede).)*$/` 快上一倍以上。可以參考 [jsfiddle.net] 這裡的比較結果，以及我在 [StackOverflow] 的回答。

### 小結

到這裡，正則引擎最重要的功能與原理都介紹完畢了。記得在學習時，可以搭配查閱 [非正式 BNF 語法][regular-expression-javascript-study-notes-3-informal-bnf-grammar] 快速掌握正則表達式的語法。

### 參考資料

* [NFA-λ (也叫做 NFA-ε 或有 ε 移動的 NFA)][NFA-λ]
* [Mastering Lookahead and Lookbehind]
* [Mastering Regular Expressions 一書 66 頁的 Perl 語言的範例][Mastering Regular Expressions, p.66]
* [Mastering Regular Expressions, 167 頁][Mastering Regular Expressions, p.167]
* [jsfiddle.net]
* [StackOverflow]

### 相關文章

* [Regular Expression (JavaScript) 學習筆記 (1) - 原理篇 (上)][regular-expression-javascript-study-notes-1-theory-1] 
* [Regular Expression (JavaScript) 學習筆記 (2) - 原理篇 (下)][regular-expression-javascript-study-notes-2-theory-2]
* <span id="bnf-grammar"></span>[Regular Expression (JavaScript) 學習筆記 (3) - Informal BNF 語法][regular-expression-javascript-study-notes-3-informal-bnf-grammar]
* [Open Sourced my JavaScript Regular Expression Generator - RegexGen.js][open-sourced-my-javascript-regular-expression-generator-regexgenjs]
* [為什麼我要開發 Regular Expression Generator - RegexGen.js][why-i-developed-javascript-regular-expression-generator-regexgenjs]

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[NFA-λ]: http://en.wikipedia.org/wiki/Nondeterministic_finite_automaton_with_%CE%B5-moves "NFA-λ (也叫做 NFA-ε 或有 ε 移動的 NFA)"
[Mastering Lookahead and Lookbehind]: http://www.rexegg.com/regex-lookarounds.html "Mastering Lookahead and Lookbehind"
[Mastering Regular Expressions, p.66]: http://books.google.com.tw/books?id=ucwR4KIvExMC&amp;pg=PA66&amp;source=gbs_toc_r&amp;cad=4#v=onepage&amp;q&amp;f=false "Mastering Regular Expressions 一書 66 頁的 Perl 語言的範例"
[Mastering Regular Expressions, p.167]: http://books.google.com.tw/books?id=ucwR4KIvExMC&amp;pg=PA167&amp;source=gbs_toc_r&amp;cad=4#v=onepage&amp;q&amp;f=false "Mastering Regular Expressions, 167 頁"
[jsfiddle.net]: http://jsfiddle.net/pvJL5/3/ "jsfiddle.net"
[StackOverflow]: http://stackoverflow.com/a/24743196/726650 "StackOverflow"
