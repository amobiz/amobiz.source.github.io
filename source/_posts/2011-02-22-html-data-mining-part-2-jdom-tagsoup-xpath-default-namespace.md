title: 'HTML 資訊汲取（中篇） - Default namespace 問題'
date: 2011-02-22 02:46:00
comments: true
categories: 
tags:
  - Groovy
  - HTML
  - JDOM
  - Namespace
  - TagSoup
  - XML
  - XPath
  - pitfalls
---
在上一篇文章『[HTML 資訊汲取（上篇） - 使用 JDOM 、 TagSoup 及 XPath][html-data-mining-part-1-jdom-tagsoup-xpath]』裡，我提到了如何利用 [JDOM][2] 搭配 [TagSoup][3]，並使用 XPath 簡單地汲取資訊。其實，在上一篇的範例裡，我刻意避開了兩個困擾許多人的問題：**namespace (命名空間) 問題**以及 **TagSoup 的輸出問題**。

<!-- more -->

### Namespace 問題

再看一下上一篇出現的新聞標題：

``` html
<span class="titletext">曾雅妮的魔幻數字與粉紅色</span>
```

假設，除了 `span` 之外，還有其他標籤，譬如 `h4`，也具有 `titletext` 類別，但是只有 `span` 是我們要的新聞標題。在這樣的情況下，為了僅選擇 `sapn` 標籤，我們應該將原來的 XPath：

``` xpath
//*[contains(@class,'titletext')]
```

改成這樣：

``` xpath
//span[contains(@class,'titletext')]
```

將此 XPath 套用到上一篇的程式中，執行看看。

``` groovy
def xpath = XPath.newInstance( "//span[contains(@class,'titletext')]" )
def result = xpath.selectNodes( doc )
result.each { println it.text }
```

看看輸出結果。看到了嗎？沒有任何輸出！

<!-- more -->

### TagSoup 的 namespace 輸出問題

為什麼會這樣呢？

這是因為 TagSoup 解析 HTML 時，不論原始網頁是否是 XHTML、是否含有 namespace 的定義，都一律會將網頁輸出成 XHTML 格式，**並（只）**含有下列 namespace 的定義︰

``` html
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:html="http://www.w3.org/1999/xhtml"> 
```

其中 `xmlns="http://www.w3.org/1999/xhtml"` 是『default namespace (預設命名空間)』。所謂 default namespace，是指若 XML 標籤未明確指明其 namespace，則自動歸屬於該 namespace。

而 `xmlns:html="http://www.w3.org/1999/xhtml"` 則是一般的 namespace，該 namespace 使用 `html` 當作 **prefix (前置字符) **作為別名，所有含有該 prefix 的標籤，歸屬於該 namespace。Prefix 可由 XML 文件（網頁）設計者自行指定。

這裡的重要觀念是，namespace 並非由 prefix 決定，而是由引號中的 URI 指定。上面兩個 namespace，不論是 default namespace 或是以 html 作為 prefix 指定的一般 namespace，由於他們的 URI 皆為 `http://www.w3.org/1999/xhtml`，所以其實是同一個 namespace。也就是說，在這個例子裡，`span` 跟 `html:span` 兩種寫法是等價的，指的都是 `http://www.w3.org/1999/xhtml` 這個 namespace。

上面『（只）含有』的意思是，如果網頁同時含有其他 namespace 的定義，都會被 TagSoup 移除，並且在實際用到該 prefix 的標籤處，換成類似下面這樣的宣告： 

``` html
<html:span xmlns:html="urn:x-prefix:html">prefix:html</html:span>
```

如上所示，連使用 html 為 prefix 的標籤，都慘遭毒手。別忘了，這可是 TagSoup 在 `html` 標籤中強制輸出的 prefix。經過 TagSoup 這樣的修改，所有加上 prefix 的標籤，反而都對應不到正確的 namespace 了。等於是把 namespace 給廢了。（這似乎是刻意的，請參考 TagSoup 的 [change log][5]: Changes from 0.9.7 to 0.10.1 (there is no 0.10.0)）

### 動手實驗證明

可以作個簡單的實驗證明：

<!-- jdom-tagsoup-xpath-namespace.groovy -->
<!-- gist inno-v/5650478 -->
{% gist amobiz/4f3a493fbbabd54b7cc2 %}

執行結果如下：

```
input:

<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:html="http://www.w3.org/1999/xhtml"
      xmlns:myns="http://www.w3.org/1999/xhtml" >
  <head>
    <title>Namespace Prefix Test</title>
  </head>
  <body>
    <span>prefix:default</span>
    <html:span>prefix:html</html:span>
    <myns:span>prefix:myns</myns:span>
  </body>
</html>

output:

<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:html="http://www.w3.org/1999/xhtml">
  <head>
    <title>Namespace Prefix Test</title>
  </head>
  <body>
    <span>prefix:default</span>
    <html:span xmlns:html="urn:x-prefix:html">prefix:html</html:span>
    <myns:span xmlns:myns="urn:x-prefix:myns">prefix:myns</myns:span>
  </body>
</html>
		
result:
	
namespace prefix: ""; xpath: "//span"
namespace prefix: "html"; xpath: "//html:span"
	<span xmlns="http://www.w3.org/1999/xhtml">prefix:default</span>
namespace prefix: "myns"; xpath: "//myns:span"
	<span xmlns="http://www.w3.org/1999/xhtml">prefix:default</span>
```

首先，可以看到在 `html` 標籤元素裡，在輸入部份我分別用了三個 prefix： 無(default), `html` 和 `myns` ，其 URI 都對應到 `http://www.w3.org/1999/xhtml`。不過，TagSoup 輸出時，卻移除了 `myns` 的定義，只留下：

``` html
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" 
      xmlns:html="http://www.w3.org/1999/xhtml">
```

同時，使用了 prefix 指定 namespace 的 `span` 標籤元素，原本是這樣子：
``` html
<span>prefix:default</span>
<html:span>prefix:html</html:span>
<myns:span>prefix:myns</myns:span> 
```

TagSoup 輸出後，卻變成這樣：

``` html
<span>prefix:default</span>
<html:span xmlns:html="urn:x-prefix:html">prefix:html</html:span> 
<myns:span xmlns:myns="urn:x-prefix:myns">prefix:myns</myns:span>
```

注意到使用 `html` 和 `myns` 兩個 prefix 所定義的標籤都被改掉了。

此時，XPath 選擇的結果，未指定 namespace，也就是不加上 prefix 的 `//span` XPath 路徑，完全找不到對應標籤元素；而使用了 prefix 的 `//html:span` 和 `//myns:span` XPath 路徑，卻只找到使用 default namespace 定義的 `span` 標籤元素：

``` html
<span xmlns="http://www.w3.org/1999/xhtml">prefix:default</span>
```

注意到程式碼中的這一行：

``` groovy
xpath.addNamespace( prefix, "http://www.w3.org/1999/xhtml" )
```

這是告訴 XPath 如何將 prefix 對應到 URI。

當 XPath 進行比對時，除了會由 XML 文件的 namespace 定義中，建立 namespace 的 prefix / URI 對應表，還會查找我們提供的 prefix / URI 對應關係。這是因為文件撰寫者與 XPath 使用者通常不會是同一人，由於 prefix 是可以自訂的，所以 namespace 被設計成使用 URI 作為識別，prefix 則只是當作該 URI 的別名使用。由於嚴格的 XML 須使用 DTD 定義，因此所有的合法標籤，都應該已被定義在適當的 namespace 之中，也就是說，對應到特定的 URI。所以，XPath 只需提供方法，讓 XPath 使用者使用任意自訂的 prefix，再提供方法，讓該 prefix 能指向正確的 URI，即可對應到正確的 namespace 了。

但由於 TagSoup 輸出的 XHTML 中，將我們定義的 `myns` 移除了，JDOM 無法從 XHTML 中建立 `myns` 的對應關係，此時如果將呼叫 `addNamespace()` 函數的這一行程式碼移除，JDOM 將找不到 `myns` 對應的 URI 定義，於是在解析 XPath 時，將會丟出這樣的錯誤訊息： 

```
Caught: org.jdom.JDOMException: XPath error while evaluating "//myns:span": 
XPath expression uese unbound namespace prefix myns: XPath expression uses 
unbound namespace prefix myns
```

### 內建 XML 解析器沒有 TagSoup 的輸出問題

另一方面，由於我提供的輸入，雖然不是標準的 XHTML，卻是符合 well-formed XML 格式的，所以 JDOM 內建（正確的講，應該是 JAXP 內建）的 XML 解析器其實是可以正確解讀的。把程式碼裡面，配置 SAXBuilder 的那一行：

``` groovy
def builder = new SAXBuilder( "org.ccil.cowan.tagsoup.Parser" )
```

改成不指定解析器類別，像這樣：

``` groovy
def builder = new SAXBuilder()
```

就可以使用 JDOM 內建的 XML 解析器。執行結果如下：

```
input:

<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:html="http://www.w3.org/1999/xhtml"
      xmlns:myns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Namespace Prefix Test</title>
    </head>
    <body>
        <span>prefix:default</span>
        <html:span>prefix:html</html:span>
        <myns:span>prefix:myns</myns:span>
    </body>
</html>
		
output:

<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:html="http://www.w3.org/1999/xhtml"
      xmlns:myns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Namespace Prefix Test</title>
    </head>
    <body>
        <span>prefix:default</span>
        <html:span>prefix:html</html:span>
        <myns:span>prefix:myns</myns:span>
    </body>
</html>
		
result:
		
namespace prefix: ""; xpath: "//span"
namespace prefix: "html"; xpath: "//html:span"
	<span xmlns="http://www.w3.org/1999/xhtml">prefix:default</span>
	<html:span xmlns:html="http://www.w3.org/1999/xhtml">prefix:html</html:span>
	<myns:span xmlns:myns="http://www.w3.org/1999/xhtml">prefix:myns</myns:span>
namespace prefix: "myns"; xpath: "//myns:span"
	<span xmlns="http://www.w3.org/1999/xhtml">prefix:default</span>
	<html:span xmlns:html="http://www.w3.org/1999/xhtml">prefix:html</html:span>
	<myns:span xmlns:myns="http://www.w3.org/1999/xhtml">prefix:myns</myns:span>
```

注意到，輸出的部份，保留了我原本的 namespace 定義：

``` html
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:html="http://www.w3.org/1999/xhtml"
      xmlns:myns="http://www.w3.org/1999/xhtml">
```

標籤的 prefix 也正確保留了：

``` html
<span>prefix:default</span>
<html:span>prefix:html</html:span>
<myns:span>prefix:myns</myns:span>
```

而 XPath 選取的結果，除了未指定 namespace 的 `//span` XPath 路徑仍然對應不到任何元素外，兩個使用了 prefix 指定命名空間的 XPath 路徑，現在都能選到三個 `span` 標籤元素：

``` html
<span xmlns="http://www.w3.org/1999/xhtml">prefix:default</span>
<html:span xmlns:html="http://www.w3.org/1999/xhtml">prefix:html</html:span>
<myns:span xmlns:myns="http://www.w3.org/1999/xhtml">prefix:myns</myns:span>
```

注意，上面這三個 `span` 標籤分別使用了不同的 prefix 定義。證明命名空間相同與否，並非由 prefix 決定，而是由 URI 決定。只要 URI 相同，不論 prefix 如何定義，都將被視為相同的命名空間。

另外，此時即使移除程式碼中的這一行：

``` groovy
xpath.addNamespace( prefix, "http://www.w3.org/1999/xhtml" )
```

XPath 選擇的結果也完全相同。可見得 JDOM 可以透過 `html` 標籤中的 `xmlns 的`namespace 定義，正確的對應 prefix。 

若進一步實驗：將 `html` 標籤中的 default namespace 定義移除，而保留另外兩個具 prefix 的 namespace 的定義：

<!-- jdom-tagsoup-xpath-namespace-no-default.groovy -->
<!-- gist inno-v/5650523 -->
{% gist amobiz/93e367f1b3b2f005739d %}

就會發現，原本未使用 prefix 指定 namespace 的 XPath 路徑：`//span` 也可以對應到元素了：

```
namespace prefix: ""; xpath: "//span" <span>prefix:default</span>
```

而使用了 prefix 的 XPath 路徑，此時已對應不到未指定 prefix 的元素了：

```
namespace prefix: "html"; xpath: "//html:span"
	<html:span xmlns:html="http://www.w3.org/1999/xhtml">prefix:html</html:span>
	<myns:span xmlns:myns="http://www.w3.org/1999/xhtml">prefix:myns</myns:span>
namespace prefix: "myns"; xpath: "//myns:span"
	<html:span xmlns:html="http://www.w3.org/1999/xhtml">prefix:html</html:span>
	<myns:span xmlns:myns="http://www.w3.org/1999/xhtml">prefix:myns</myns:span>
```		

查看 JDOM 的 XPath 類別的 addNamespace() 函數的[說明文件][6]，發現了這一段說明：

> **Note**: In XPath, there is no such thing as a 'default namespace'. The empty 
> prefix **always** resolves to the empty namespace URI. 

意思是說：在 XPath 中，並沒有所謂『預設命名空間』。所以，若 prefix 為空字串 ""，則永遠對應到『空』命名空間。

原來，移除了 default namespace 的定義，使得原本未使用 prefix 指定 namespace 的 `span` 標籤，由原來的 default namespace，轉變成為所謂的 empty namespace，也就是不屬於任何 namespace。因此，指定了 prefix 的 XPath 路徑，如：`//html:span`，因為其 namespace 為 `http://www.w3.org/1999/xhtml`，所以就對應不到屬於 empty namespace 的這個標籤元素；而此時，未指定 prefix 的 XPath 路徑：`//span`，反而就能對應到此 empty namespace 上的 `span` 標籤元素了。

稍微喘口氣，整理一下。經由上面的實驗結果，我們有了下面兩個結論：

1. 命名空間的識別，是由命名空間定義中的 URI 部份決定，任何 prefix 其實都只是該 namespace 的別名。
2. 若 `html` 標籤中含有 **default namespace** 的定義，則文件中所有未指定 prefix 的標籤，都將屬於該 namespace。另一方面，未指定 prefix 的 XPath 路徑，並非對應到 **default namespace**，而是對應到 **empty namespace**，因此，使用未指定 prefix 的 XPath 路徑進行選取時，不論是使用 TagSoup 或是 JDOM 內建的 XML 解析器，都對應不到任何標籤。這其實是 XPath 的規範（雖然我覺得這樣很不合理，因為這與 XML 對 namespace 的處理方式並不一致：在 XML 文件中，未指明 prefix 的標籤（或屬性）就歸屬於 default namespace。）

另一方面，我們還遇到了 TagSoup 輸出 namespace 的問題：

1. TagSoup 處理過的 HTML 文件，一律輸出為 XHTML 格式，並且定義了 `xmlns="http://www.w3.org/1999/xhtml"` 這個 default namespace，以及`xmlns:html="http://www.w3.org/1999/xhtml"` 這個以 `html` 為 prefix 的 namespace。而其餘的 namespace 的定義，都將被移除。
2. 由於 TagSoup 處理過的 HTML 文件，含有 default namespace 的定義，使用 XPath 選取元素時，一定要在路徑的標籤或屬性前，加上 `html` 這個 prefix，才能對應到元素。
3. TagSoup 處理過的 HTML 文件，其元素標籤若含有 prefix 定義，即使 prefix 是 `html`，都會被修改並對應到 `urn:x-prefix:html` 這樣的 URI（參考 TagSoup 原始碼中 Parser 類別的 foreign() 函數、ElementType 類別的 namespace() 函數以及 [change log][7]），因而使該標籤對應不到原本正確的 namespace 的 URI。導致使用了該 prefix 的 XPath 路徑，也對應不到正確的標籤。（原本應該能正確對應的，這一點可以經由使用 JDOM 內建的 XML 解析器的實驗證明。）

在下一篇文章『[HTML 資訊汲取（下篇） - TagSoup 輸出 namespace 問題的解決方案][html-data-mining-part-3-jdom-tagsoup-xpath-namespace-fix-how-to]』裡，我將介紹 TagSoup 輸出 namespace 問題的解決方法。

### 相關文章：

* [HTML 資訊汲取（上篇） - 使用 JDOM 、 TagSoup 及 XPath][html-data-mining-part-1-jdom-tagsoup-xpath]
* [HTML 資訊汲取（中篇） - Default namespace 問題][html-data-mining-part-2-jdom-tagsoup-xpath-default-namespace] 
* [HTML 資訊汲取（下篇） - TagSoup 輸出 namespace 問題的解決方案][html-data-mining-part-3-jdom-tagsoup-xpath-namespace-fix-how-to] 

歡迎大家的回饋與心得分享。 

<!-- cross references -->

<!-- post_references -->

<!-- external references -->


[2]: http://www.jdom.org/
[3]: http://home.ccil.org/~cowan/XML/tagsoup/
[5]: http://home.ccil.org/~cowan/XML/tagsoup/CHANGES
[6]: http://www.jdom.org/docs/apidocs/org/jdom/xpath/XPath.html#addNamespace%28java.lang.String,%20java.lang.String%29
[7]: http://home.ccil.org/%7Ecowan/XML/tagsoup/CHANGES
