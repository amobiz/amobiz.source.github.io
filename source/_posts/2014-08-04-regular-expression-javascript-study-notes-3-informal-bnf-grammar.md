title: 'Regular Expression (JavaScript) 學習筆記 (3) - Informal BNF 語法'
date: 2014-08-04 00:06:06
comments: true
categories: 
tags:
  - JavaScript
  - Regular Expression
  - regex
---
## Informal BNF of Regular Expression of JavaScript (語法篇)

[能夠找得到的][regexp-plg] regular expression 的 [BNF] 語法不太多，以下是自己整理的 JavaScript 的 regular expression 的非正式語法，是依照自己的理解與體會所整理出來的，一定有許多錯誤、遺漏以及命名不當的地方，但還是把它列出來，幫助自己快速複習目前已掌握的 regular expression 的完整語法。讀者如果發現有任何錯誤或是有更好的表示方式，請不吝多多指教。

<!-- more -->

```
<regex> ::= "/"  <sub-expression-set>  "/"  [ <modifier-set> ]
```

一個 `regex` (regular expression, 正則表達式) 是由一個 `sub-expression-set` (子表達式集合) 組成，前後以 "`/`" 字元包圍，可以添加 `modifier-set` (模式修飾子集合) 後綴，改變 `regex` 的行為。

```
<sub-expression-set> ::= <sub-expression>  |  <sub-expression> <sub-expression-set>
```

一個 `sub-expression-set` (子表達式集合)，是由一個或多個 `sub-expression` (子表達式) 串接組成。

```
<sub-expression> ::=  [  <lookahead-set>  ]  <unit-expression>  [ <quantifier>  [ <quantifier-modifier> ]  ]   [  <lookahead-set>  ]
```

一個 `sub-expression` (子表達式) 是由一個 `unit-expression` (單元表達式) 組成。該單元表達式可以在後面緊接著可選的 `quantifier` (量詞) 及 `quantifier-modifier` (量詞修飾子)。在前後可添加 `lookahead` (順序環視表達式)。

其中，可選的量詞及環視表達式(註)作用於整個單元表達式上。

註：環視表達式事實上是獨立的表達式，不需依附在單元表達式上。請參考 `unit-expression` (單元表達式) 及 `lookahead` (順序環視表達式) 的說明。

```
<unit-expression> ::= <expression-construct>  |  <alternation-expression-group>  |  <group>  |  <back-reference>
```

一個單元表達式，可以是一個 `expression-construct` (表達式構成元素、不可分割的表達式)、一個 `alternation-expression-group` (群組多選結構表達式)、一個 `group` (群組表達式) 或一個 `back-reference` (反向引用)。

所謂單元表達式，是指其本身對外具有「不受侵害」的能力。所謂不受侵害，是指單元表達式與其它表達式以任何方式結合之後，不會改變單元表達式內部的表達式的意義。關於這個議題，一部分是與正則表達式本身的組成方式有關，另一部分則與 operator (運算元) 的 precedence (優先級別) 有關。

舉例來說，多選結構表達式，是以「`|`」元字元來區隔多個子表達式，譬如：「`fat|cat|belly|your`」。若在此表達式之後，緊接著想要匹配一個 `"!"` 字元，如果寫成這樣：「`fat|cat|belly|your!`」，那麼 `"!"` 字元就會與多選結構裡的子表達式「`your`」結合，成為「`your!`」。這是因為，「`|`」元字元的優先級別較低，低於普通字元的結合 (也就是 alternation (多選結構) 運算子的優先級別低於 sequence (表達式的結合) 運算子，請參考後面關於 [元字元的 precedence (優先級別)](#precedence) 的說明)。正確的寫法，應該是：「`(fat|cat|belly|your)!`」，或是使用非捕獲型群組：「`(?:fat|cat|belly|your)!`」。

由於正則表達式是以字元為匹配單位，能夠匹配一個字元的表達式，也就是 `expression-construct` (表達式構成元素、不可分割的表達式)，就是最小的單元表達式。這些表達式都具有「不受侵害」的能力。

當多個 `expression-construct` 串連在一起，構成複雜的表達式時，若要確保整個表達式具有「不受侵害」的能力，譬如，以量詞為例，若要讓量詞作用於整個表達式上，就必須使用 `group` (群組表達式) 將整個表達式加以包裝區隔，使其成為單元表達式。否則，量詞將僅套用在整個表達式的最後一個 `expression-construct` 上。

舉例來說，「`your`」這個表達式本身，相較於以「`|`」元字元來區隔的多選結構表達式，如：「`fat|cat|belly|your`」，「`your`」在其中又可以視為一個獨立的子表達式。假設現在想對整個表達式添加量詞「`?`」，如果寫成這樣：「`your?`」，由於正則表達式是以字元為匹配單位，而量詞的優先級別又高於表達式的結合，這時候量詞將只作用於最後一個字元，上面的表達式實質上相當於：「`(?:you)(?:r?)`」；這時候，正確的寫法應該是：「`(?:your)?`」。

由上面的例子也可以看出，`group` (群組) 的元字元 `"("`、 `"(?:"`、`")"` 具有極高的優先級別 ，任何表達式一旦以群組加以保護，即成為單元表達式。

注意：也許將 `alternation-expression-group` (群組多選結構表達式) 歸類為 `group` (群組表達式) 會比較好。但是考慮到當它是整個正則表達式中唯一的表達式時，其實可以省略群組括號，表達為 `alternation-expression` (多選結構表達式)，也就是說，它又不必然一定是群組。為了不增加 BNF 的複雜性，所以將它放在這裡。請參考 `alternation-expression-group` (群組多選結構表達式) 的說明。

```
<lookahead-set> ::= <lookahead>  |  <lookahead>  <lookahead-set>
```

一個 `lookahead-set` (順序環視表達式集合) 是由一個或多個 `lookahead` (順序環視表達式) 組成。

```
<lookahead> ::= <positive-lookahead>  |  <negative-lookahead>
```

一個 `lookahead` (順序環視表達式)，可以是 `positive-lookahead` (肯定型順序環視表達式) 或 `negative-lookahead` (否定型順序環視表達式)。

注意，`lookahead` (順序環視) 與 `lookbehind` (逆序環視) 合稱 `lookaround` (環視)。JavaScript 只支援 `lookahead`，不支援 `lookbehind`。

嚴格來說，環視表達式是一個獨立的表達式，並不需要依附在單元表達式上。雖然環視表達式實際上不是直接作用在單元表達式上，但是依據其放置的位置，實際上會對單元表達式所要匹配的內容，起到不同的約束作用。所以在這裡把環視當作單元表達式的修飾詞來介紹。說明如下：

##### 順序環視表達式置於單元表達式前方

順序環視表達式置於單元表達式前方時，由於環視表達式匹配成功後，引擎會回到開始之前的位置，然後繼續下一個表達式的匹配。也就是說，置於前方的順序環視表達式，與單元表達式，測試文本的起始位置相同，並且測試的內容有所重疊。換句話說，單元表達式主體所匹配的內容，必須同時、依序滿足順序環視表達式以及單元表達式的匹配條件。

另外，由於順序環視表達式只是對即將由單元表達式進行匹配的文本，進行額外的測試，並不會佔有字元；單元表達式才是真正的主體，負責實際上去 match (匹配並佔有) 文本。為了與 "match" 區分，我在這裡以 "contain" 來隱含「測試相同的內容但不佔有」這個意思。這樣，若以單元表達式為主體的觀點出發，將主體的匹配行為表達為 "match"，將順序環視表達式的測試行為表達為 "contain"。可以把順序環視表達式的作用描述為：

對於肯定型順序環視表達式，單元表達式所要匹配 (matches) 的內容，必須同時吻合 (also contains) 肯定型順序環視表達式能夠匹配的內容。

對於否定型順序環視表達式，單元表達式所要匹配 (matches) 的內容，必須不含 (must not contains) 否定型順序環視表達式能夠匹配的內容。

##### 順序環視表達式置於單元表達式後方

順序環視表達式置於單元表達式後方時，由於這個時候單元表達式主體已經匹配成功 (並佔有已匹配字元)，順序環視表達式所要接續測試的內容，顯然不包含單元表達式已經匹配的內容，而是緊接在其後的內容。同時，由於順序環視表達式匹配失敗時，會先回到開始之前的位置，並且觸發一個回溯，這時候除非單元表達式主體還儲存有其它備選狀態 (譬如表達式是多選結構或具有量詞)，可以嘗試不同選擇 (在多選結構的情形下)，或仍保持匹配成功狀態可以讓順序環視表達式由不同的路徑開始嘗試 (在量詞的情形下)。否則，這個回溯將立即導致單元表達式主體匹配失敗，並回到上上個表達式 (如果有的話)。也就是說，即使在單元表達式匹配成功後，在其匹配內容後方接續的內容，如果無法滿足順序環視表達式的匹配條件，因為回溯的關係，會噵致該單元表達式失敗。

簡單的說，若置於單元表達式後方的順序環視表達式測試失敗，則單元表達式的匹配也算失敗。

同樣地，由於單元表達式才是真正的主體，負責實際上去 match (匹配並佔有) 文本，而順序環視表達式則不佔有字元，它所測試的內容，並不會被佔有。同樣為了與 "match" 有所區分，我在這裡以 "followed by" 來隱含「測試尾隨的內容但不佔有」這個意思。在這個情形下，可以把順序環視表達式的作用描述為：

對於肯定型順序環視表達式，單元表達式所要匹配 (matches) 的內容，必須跟隨著 (followed by) 肯定型順序環視表達式能夠匹配的內容。

對於否定型順序環視表達式，單元表達式所要匹配 (matches) 的內容，不可跟隨著 (not followed by) 否定型順序環視表達式能夠匹配的內容。

##### 順序環視表達式匹配失敗時，其所「修飾」的單元表達式即匹配失敗

綜合以上順序環視表達式置於前方與後方兩部分的討論，可以得出這樣的結論：順序環視表達式匹配失敗時，其所「修飾」的單元表達式即匹配失敗。

當然，正則表達式是由許多子表達式構成，對於同一個順序環視表達式，位於其前方的單元表達式，可將其視為是 (not) followed by；位於其後方的單元表達式，則可將其視為是 (not) contains。哪個才是對的呢? 還是都對呢? 應該是根據表達式的目的來決定吧。

```
<positive-lookahead> ::= "(?="  <sub-expression-set>  ")"
```

一個 `positive-lookahead` (肯定型順序環視表達式)，是由一個 `sub-expression-set`  (子表達式集合) 組成，前後分別由 "`(?=`" 及 "`)`" 符號包圍。

對於肯定型順序環視表達式，其 `sub-expression-set` 必需匹配文本，才算匹配成功。

```
<negative-lookahead> ::= "(?!"  <sub-expression-set>  ")"
```

一個 `negative-lookahead` (否定型順序環視表達式)，是由一個 `sub-expression-set` (子表達式集合) 組成，前後分別由 "`(?!`" 及 "`)`" 符號包圍。

對於否定型順序環視表達式，其 `sub-expression-set` 必需不匹配文本，才算匹配成功。

```
<group> ::= <capture-group>  |  <non-capture-group>
```

一個 `group` (群組表達式)，可以是 `capture-group` (捕獲型群組) 或 `non-capture-group` (非捕獲型群組)。

如 `unit-expression` (單元表達式) 的說明，使用群組的主要目的之一，是要使群組內的整個表達式「不受侵害」，譬如量詞的使用。

另一個用途是捕獲子群組的內容，請參考 `capture-group` (捕獲型群組) 的說明。

```
<capture-group> ::= "("  <sub-expression-set>  ")"
```

一個 `capture-group` (捕獲型群組)，是由一個 `sub-expression-set`  (子表達式集合) 組成，前後分別由 "`(`" 及 "`)`" 符號包圍。

當正則表達式可以匹配文本內容時，會回傳整個匹配的內容。如果希望額外回傳其中的部分特定內容，可以將對應的子表達式使用捕獲型群組加以包圍。整個正則表達式可以使用多個群組，也可以巢狀套疊。回傳的順序，依照群組的左括號 "`(`" 出現的順序排列。

捕獲型群組所匹配的內容，可以在正則表達式中直接參照，請參考 `back-reference`。

若要在 JavaScript 程式中參照捕獲型群組，可使用 `$1`, `$2` 對應，依此類推。

```
<non-capture-group> ::= "(?:"  <sub-expression-set>  ")"
```

一個 `non-capture-group` (非捕獲型群組)，是由一個 `sub-expression-set`  (子表達式集合) 組成，前後分別由 "`(?:`" 及 "`)`" 符號包圍。

使用非捕獲型群組，可以避免使用捕獲型群組時，引擎為了保留捕獲的內容，而在嘗試和回溯的過程中，不斷儲存和丟棄捕獲的內容所花費的時間，增進效率。缺點是會使正則表達式看起來更複雜。

```
<back-reference> ::= "\"  <number>
```

一個 `back-reference` (反向參照) 是由 "`\`" 字元緊接著一個數字組成。

JavaScript 對數字大小似乎沒有限制，即範圍為 1 ~ Number.MAX_VALUE。這也就是說，對於捕獲型群組的數量沒有限制。但是，在部分流派中，如 [PHP][PHP_preg-replace]，數字必須為 1 ~ 99 的任意數字。在 [sed 中甚至只能是 1 ~ 9][sed-backreference-limit]。

反向參照的意義，是要匹配參照的捕獲型群組所捕獲的內容，也就是反向參照匹配的位置出現的內容，應該與捕獲型群組匹配的內容相同。通常用在內容必須成對出現，或重複多次的情況。

```
<expression-construct> ::= <raw-character>  |  <meta-character-escape>  |  <ascii-character-escape>  |  <unicode-character-escape>  |  <character-class-shorthand>  |  <character-class>  |  <negative-character-class>
```

一個 `expression-construct` (表達式構成元素、不可分割的表達式)，可以是 `raw-character` (普通字元) 、 `meta-character-escape` (已轉義元字元)、`ascii-character-escape` (ASCII 跳脫字元)、`unicode-character-escape` (Unicode 跳脫字元)、`character-class-shorthand` (簡寫字元組)、`character-class` (字元組) 或 `negative-character-class` (排除型字元組)。

由於正則表達式是以字元為匹配單位，基本上，能夠匹配單一一個字元的表達式，就是不可分割的表達式。請參考 `unit-expression` (單元表達式) 的說明。

```
<raw-character> ::= any character that is not <meta-character>
```

一個 `raw-character` (普通字元)，是任何不是 `meta-character` (元字元) 的字元。在 JavaScript 中，包含任意 Unicode 字元。

```
<meta-character> ::= "^"  |  "|"  |  "."  |  "*"  |  "+"  |  "-"  |  "?"  |  "\"  |  "["  |  "]"  |  "{"  |  "}"  |  "("  |  ")"  |  "$"
```

正則表達式的 `meta-character` (元字元)，只有 "`^`"、"`|`"、"`.`"、"`*`"、"`+`"、"`-`"、"`?`"、"`\`"、"`[`"、"`]`"、"`{`"、"`}`"、"`(`"、"`)`" 及 "<span class="MathJax" id="MathJax-Element-1-Frame" role="textbox" aria-readonly="true"><nobr><span class="math" id="MathJax-Span-1" style="width: 0.002em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.002em; height: 0px; font-size: 113%;"><span style="position: absolute; clip: rect(3.85em 1000.002em 4.139em -0.43em); top: -3.99em; left: 0.002em;"><span class="mrow" id="MathJax-Span-2"></span><span style="display: inline-block; width: 0px; height: 3.994em;"></span></span></span><span style="border-left-width: 0.003em; border-left-style: solid; display: inline-block; overflow: hidden; width: 0px; height: 0.111em; vertical-align: -0.052em;"></span></span></nobr></span><script type="math/tex" id="MathJax-Element-1"></script>" 十五個字元。

注意到其中 "`-`"、"`]`" 及 "`}`" 三個字元。前兩個字元只有在它們位於沒有 escape (轉義) 的 "`[`" 字元之後，也就是在 `character-class` (字元組) 中，才成為元字元。而 "`}`" 字元只有當位於一個沒有轉義的 "`{`" 字元之後，也就是以 「`{m,n}`」形式存在，成為量詞時，才成為元字元。對於這三個字元，當要做為普通字元進行匹配時，在任何時候都沒有必要進行轉義。

另外，由於 JavaScript 使用 "`/`" 字元包圍的方式來表現正則表達式 literal。當使用這種語法時，必須在表達式內部對 "`/`" 字元進行轉義，也就是以「`\/`」的方式表示 `"/"` 字元。而當以字串形式表現正則表達式時，就不需要進行轉義。由於這是宿主語言的特性使然，因此不將 "`/`" 字元視為 `meta-character` (元字元)。

##### <span id="precedence">元字元的 precedence (優先級別)</span>

根據 O'Reilly Learning Perl 3rd Edition, [Chapter 8: More About Regular Expressions][orelly_perl3_ch8] 這篇文章，列出了元字元的 precedence (優先級別) ，依序如下：

1. Group (群組字元)：「`()`」、「`(?:)`」。
2. Quantifiers (量詞字元)：「`*`」、「`+`」、「`?`」、「`{,}`」。
3. Anchors (錨定字元)：「`^`」、「`$`」，包括「`\b`」、「`\B`」 (字詞邊界) 也在這個等級；sequence (序列)，是指串接在一起的表達式，包括字元序列也是 (雖然 sequence 實際上沒有使用任何元字元)。
4. Alternation (多選結構)：「`|`」。

```
<meta-character-escape> ::= "\"  <meta-character>
```

一個 `meta-character-escape` (已轉義元字元)，是由 "`\`" 轉義元字元，緊接著一個 `meta-character` (元字元) 組成。

如 `meta-character` (元字元) 的說明，注意到當要做為普通字元進行匹配時，`"-"`、`"]"` 及 `"}"` 三個字元不需要進行轉義。

```
<character-class-shorthand> ::= "."  |  "\0"  |  "\b"  |  "\B"  |  "\d"  |  "\D"  |  "\f"  |  "\n"  |  "\r"  |  "\s"  |  "\S"  |  "\t"  |  "\v"  |  "\w"  |  "\W"  |  "\c" ["A"-"Z"]
```

一個 `character-class-shorthand` (簡寫字元組)，表示匹配一個字元。

簡寫字元組通常用來表示一些常用的字元組，以縮短表達式的長度。或是用來表現一些不容易顯示、列印的字元，如空白字元、控制字元等。

如原理篇的前言所述，不需要花時間記憶這些簡寫符號。此項目使用灰色淡化處理的目的是特別要強調這一點。所以這裡也刻意不詳列每個簡寫符號的說明。詳細的說明請參考 [Mozila Developer Network: Writing a Regular Expression Pattern][Writing_a_Regular_Expression_Pattern]。

```
<ascii-character-escape> ::= "\x" <HH>
```

一個 `ascii-escape-character` (ASCII 跳脫字元)，是由一個 "`\x`" 符號，加上 2 個 16 進位數字字元組成。

```
<unicode-character-escape> ::= "\u" <HHHH>
```

一個 `unicode-escape-character` (Unicode 跳脫字元)，是由一個 "`\x`" 符號，加上 4 個 16 進位數字字元組成。

```
<character-class> ::= "["  <character-class-character-set>  "]"
```

一個 `character-class` (字元組) 是由一個 `character-class-character-set` (字元組字元集合) 構成。整個字元組前後分別以 "`[`" 及 "`]`" 字元符號包圍。

字元組的意義為，匹配若干字元之一，且僅匹配一個字元，該字元必須為 `character-class-character-set` (字元組字元集合) 所列舉的字元。

```
<negative-character-class> ::= "[^"  <character-class-character-set>  "]"
```

一個 `negative-character-class` (排除型字元組) 是由一個 `character-class-character-set` (字元組字元集合) 構成。整個排除型字元組前後分別以 "`[^`" 及 "`]`" 字元符號包圍。

排除型字元組同樣必須匹配一個字元，且僅匹配一個字元，該字元不可出現在 `character-class-character-set` (字元組字元集合) 所列舉的字元中。 要強調的是，排除型字元組並非不匹配字元，而是匹配一個未列出的字元。

```
<character-class-character-set> ::= <character-class-construct>  |  <character-class-construct>  <character-class-character-set>
```

一個 `character-class-character-set` (字元組字元集合)，是由一個或多個 `character-class-construct` (字元組構成元素) 構成。

```
<character-class-construct> ::= <character-class-raw-character>  |  <character-class-range>  |  <character-class-shorthand>  |  <ascii-character-escape>  |  <unicode-character-escape>  |  <character-classes-meta-character-escape>
```

一個 `character-class-construct` (字元組構成元素)，可以是 `character-class-raw-character`  (字元組普通字元)、`character-class-range` (字元範圍)、`character-class-shorthand` (簡寫字元組)、`ascii-character-escape` (ASCII 跳脫字元)、`unicode-character-escape` (Unicode 跳脫字元) 或 `character-classes-meta-character-escape` (已轉義字元組元字元)。

```
<character-class-raw-character> ::= any character that is not <character-classes-meta-character>
```

一個 `character-class-raw-character` (字元組普通字元)，是除了 `character-classes-meta-character-escape` (已轉義字元組元字元) 之外的任意字元。

```
<character-class-range> ::= <character-class-range-construct>  "-"  <character-class-range-construct>
```

一個 `character-class-range` (字元範圍)，是由兩個 `character-class-range-construct` (字元範圍構成元素) 組成，中間以字元組元字元 "`-`" 連結。

字元範圍所能匹配的字元，是由起始字元所指定的字元碼，至結束字元所指定的字元碼，兩者之間所界定的連續範圍內的字元碼所對應的字元。包含起始字元及結束字元。

```
<character-class-range-construct> ::= <character-class-raw-character>  |  <ascii-character-escape>  |  <unicode-character-escape>
```

一個 `character-class-range-construct` (字元範圍構成元素)，可以是一個 `character-class-raw-character` (字元組普通字元) 、一個 `ascii-character-escape` (ASCII 跳脫字元) 或一個 `unicode-character-escape` (Unicode 跳脫字元)。

```
<character-classes-meta-character-escape> ::=  "\"  <character-class-meta-character>
```

一個 `character-classes-meta-character-escape` (已轉義字元組元字元) ，是由一個 "`\`" 轉義字元，加上一個 `character-classes-meta-character` (字元組元字元) 構成。

```
<character-class-meta-character> ::= "-"  |  "]"  |  "\"  |  "^"
```

一個 `character-classes-meta-character` (字元組元字元)，只能是 `"-"` 、 `"]"` 、 `"\"` 及 `"^"` 四個字元之一。

其中 `"-"` 及 `"^"` 字元，放在特定位置下，可以當作普通字元來匹配而不需要 escape (轉義)：
`"^"` 字元，若不是第一個字元，即在「`[ ... ^ ... ]`」的情形下，可視為普通字元，可以不進行轉義。
`"-"` 字元，在以下兩種狀況，可視為普通字元，可以不進行轉義：

若出現在第一個字元或最後一個字元，即「`[- ... ]`」 、「`[^- ... ]`」、「`[... -]`」或 「`[^ ... -]`」的情況；

緊接在某個字元範圍，或 `character-shorthand` 之後出現，即「`[a-c-def]`」或「`[\w-0-9]`」的情況。

綜合上述，字元組若要匹配包含 `"-"` 或 `"^"` 字元時，

建議永遠將 `"-"` 放在字元組第一個字元，將 `"^"` 放在字元組最後一個字元。

這樣可以減少使用轉義字元，使正則表達式更清晰易懂。

參考:
* [What literal characters should be escaped in a regex?][what-literal-characters-should-be-escaped]
* [How to escape square brackets inside brackets in grep]

注意：上述兩篇參考文章提到 `"]"` 字元，若出現在第一個字元，即「`[] ... ]`」 或 「`[^] ... ]`」 的情況，可視為普通字元，可以不進行轉義。但在 JavaScript 似乎不是這樣，在 Chrome 下測試，並不支援。譬如:

`/[]a-f]/.exec(']')  // null`
`/[]]/.exec(']')  // null`

```
<alternation-expression-group> ::= "(" <alternation-expression> ")"  |  "(?:"  <alternation-expression>  ")"
```

一個 alternation-expression-group (群組多選結構表達式)，可以是捕獲型群組、或非捕獲型群組所包圍的 alternation-expression (多選結構表達式)。

注意，由於 `alternation-expression` (多選結構表達式) 的 "`|`" 元字元的 precedence (優先級別) 較低，也就是說，多選結構表達式本身不是單元表達式，不具「不受侵害」的能力 (參考單元表達式的說明)。所以，基本上，除非整個正則表達式的唯一表達式就是多選結構表達式，在這樣的情況下，多選結構表達式才不需要使用群組加以保護。否則，多選結構表達式都應該要以群組加以保護，表示為 `alternation-expression-group` (群組多選結構表達式)。

注意，由於上述特性，在盡量不增加整個 BNF 的複雜性的原則下，其它表達式的 BNF 都是參照群組多選結構表達式。但記住在前述例外情況下，可以不使用群組，而直接使用多選結構。

```
<alternation-expression> ::= <sub-expression-set>  "|"  <sub-expression-set>  |  <sub-expression-set>  "|"  <alternation-expression>
```

一個 `alternation-expression` (多選結構表達式)，是由兩個以上的 `sub-expression-set`  (子表達式集合) 構成，子表達式集合之間以元字元 "`|`" 分隔。

多選結構表達式表示匹配任意子表達式。在 JavaScript 中，匹配的測試順序，是依照子表達式列舉的順序。

注意，"`|`" 元字元的 precedence (優先級別) 較低，所以多選結構表達式不是單元表達式。請參考  `alternation-expression-group` (群組多選結構表達式) 及 `unit-expression` (單元表達式) 的說明。

```
<quantifier> ::= "?"  |  "+"  |  "*"  |  "{"  <quantifier-lower-bound>  ","  <quantifier-upper-bound>  "}"
```

一個 `quantifier` (量詞)，是由一個 "`?`" 、 "`*`" 或 "`+`" 簡寫元字元構成，或者以 `{ lower, upper }` 的完整形式表示。

量詞的作用類似於英文文法中的副詞。在英語中，副詞用來修飾動詞。

而在正則表達式中，量詞用來描述其所修飾 (作用) 的表達式必須匹配的次數。

每個量詞皆有匹配次數的下限及上限限制，分別如下：

`?` : 表示可有可無。亦即，匹配 0 至 1 次。
`*` : 表示可有可無，且不限定上限。亦即，匹配 0 至無限次。
`+` : 表示一定要存在，但不限定上限。亦即，匹配 1 至無限次。
`{ m, n }` : 表示下限為 m，上限為 n，其中 m、n 為自然數 (或說包含 0 的正整數)。如果只有下限，可以簡寫如: `{ m, }`；如果下限與上限一致，可以簡寫如: `{ m }`。JavaScript 不支援只有上限的縮寫形式: `{ , n }`，必須表達為 `{ 0, n }`。

注意：標準量詞是匹配優先的。

```
<quantifier-lower-bound>, <quantifier-upper-bound> ::= <number>
```

在量詞的完整形式中，上限與下限必須是自然數 (包含 0 的正整數)。

```
<quantifier-modifier> ::= "?"
```

一個 `quantifier-modifier` (量詞修飾子)，是由一個 `"?"` 元字元表示。

當標準量詞附加了量詞修飾子，匹配的行為由匹配優先轉為忽略優先。

注意: 事實上，並沒有量詞修飾子這種說法。JavaScript 中的標準量詞 (匹配優先)，分別為 `?`、`*`、`+`、`{m,n}`。其對應的忽略優先版本，分別為 `??`、`*?`、`+?`、`{m,n}?`。

注意: 量詞有三種：greedy (貪婪) 匹配優先量詞、lazy (懶惰) 忽略優先量詞，以及 possessive (佔有) 佔有優先量詞。JavaScript 不支援佔有優先量詞。多數支援占有優先量詞的流派，使用 `"+"` 字元來表示，即其對應的占有優先版本，分別為 `?+`、`*+`、`++`、`{m,n}+`。佔有優先量詞與匹配優先量詞相同，都是匹配優先，差別在於佔有優先量詞一旦匹配字元，便不再釋放。主要的使用時機是在匹配失敗時，減少不必要的回溯所導致的絕不可能匹配的無謂嘗試，最佳化引擎的匹配速度。

```
<modifier-set> ::= <modifier>  |  <modifier> <modifier-set>
```

一個 `modifier-set` (模式修飾子集合)，是由一個或多個 `modifier` (模式修飾子) 組成。

```
<modifier> ::= "g"  |  "i"  |  "m"  |  "y"
```

一個 `modifier` (模式修飾子)，可以是 `"g"`、`"i"`、`"m"` 或 `"y"` 之一的一個字元。

意義分別如下：

`g` : Global search. 預設情形下，只找出文本中第一個匹配的部分。開啟 global search 模式後，會找出文本中的所有匹配的部份。

`i` : Case-insensitive search. 忽視文本中的字元大小寫。(尚不清楚 JavaScript 是否支援忽視 Unicode 字元的大小寫。)

`m` : Multi-line search. 預設情形下，元字元 `"^"` 及 `"$"` 分別匹配整個文本的開頭與結尾。當文本中含有斷行符號，由斷行符號區隔出多行內容時，為使 `"^"` 及 `"$"` 分別匹配文本中每行的開頭與結尾，可以開啟多行搜尋模式。

`y` : Sticky search. 如果未開啟  global search 模式，也不開啟 sticky search 模式的情況下，每次由 JavaScript 對同一文本啟動正則表達式搜尋時，都只會由文本的開頭開始進行匹配，所以總是找到第一個匹配結果。開啟 sticky search 模式後，每次由 JavaScript 對同一文本啟動正則表達式搜尋時，都會由上一次搜尋的結束位置，也就是所謂目前位置開始進行匹配。

{% cheatsheet 注意 %}
目前只有 Firefox 支援此功能。新版的 ECAMScript 2015 已將 sticky search 納入標準，請參考 [New regular expression features in ECMAScript 6](http://www.2ality.com/2015/07/regexp-es6.html)。
{% endcheatsheet %}

### 參考資料

* [BNF]
* [找到的 regular expression 的 BNF 語法][regexp-plg]
* [PHP: preg_replace - Manual][preg_replace]
* [StackOverflow: Circumvent the sed backreference limit \1 through \9][stackoverflow-circumvent-the-sed-backreference-limit]
* [O'Reilly Learning Perl 3rd Edition, Chapter 8: More About Regular Expressions][orelly_perl3_ch8]
* [Mozila Developer Network: Writing a Regular Expression Pattern][Writing_a_Regular_Expression_Pattern]
* [What literal characters should be escaped in a regex?][what-literal-characters-should-be-escaped]
* [How to escape square brackets inside brackets in grep]
* [New regular expression features in ECMAScript 6]

### 相關文章

* [Regular Expression (JavaScript) 學習筆記 (1) - 原理篇 (上)][regular-expression-javascript-study-notes-1-theory-1] 
* [Regular Expression (JavaScript) 學習筆記 (2) - 原理篇 (下)][regular-expression-javascript-study-notes-2-theory-2]
* [Regular Expression (JavaScript) 學習筆記 (3) - Informal BNF 語法][regular-expression-javascript-study-notes-3-informal-bnf-grammar]
* [Open Sourced my JavaScript Regular Expression Generator - RegexGen.js][open-sourced-my-javascript-regular-expression-generator-regexgenjs]
* [為什麼我要開發 Regular Expression Generator - RegexGen.js][why-i-developed-javascript-regular-expression-generator-regexgenjs]

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[BNF]: http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form
[regexp-plg]: http://www.cs.sfu.ca/%7Ecameron/Teaching/384/99-3/regexp-plg.html "找到的 regular expression 的 BNF 語法"
[preg_replace]: http://php.net/manual/en/function.preg-replace.php "PHP: preg_replace - Manual"
[stackoverflow-circumvent-the-sed-backreference-limit]: http://stackoverflow.com/questions/4318114/circumvent-the-sed-backreference-limit-1-through-9 "StackOverflow: Circumvent the sed backreference limit \1 through \9"
[orelly_perl3_ch8]: http://docstore.mik.ua/orelly/perl3/lperl/ch08_01.htm "O'Reilly Learning Perl 3rd Edition, Chapter 8: More About Regular Expressions"
[Writing_a_Regular_Expression_Pattern]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Writing_a_Regular_Expression_Pattern "Mozila Developer Network: Writing a Regular Expression Pattern"
[what-literal-characters-should-be-escaped]:  http://stackoverflow.com/questions/5484084/what-literal-characters-should-be-escaped-in-a-regex "What literal characters should be escaped in a regex?"
[How to escape square brackets inside brackets in grep]: http://stackoverflow.com/questions/21635126/how-to-escape-square-brackets-inside-brackets-in-grep?rq=1 "How to escape square brackets inside brackets in grep"
[New regular expression features in ECMAScript 6]: http://www.2ality.com/2015/07/regexp-es6.html
[PHP_preg-replace]: http://php.net/manual/en/function.preg-replace.php "PHP: preg_replace - Manual"
[sed-backreference-limit]: http://stackoverflow.com/questions/4318114/circumvent-the-sed-backreference-limit-1-through-9 "StackOverflow: Circumvent the sed backreference limit \1 through \9"
