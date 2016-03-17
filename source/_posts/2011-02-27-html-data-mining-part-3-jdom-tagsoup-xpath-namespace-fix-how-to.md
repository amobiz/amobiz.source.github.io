title: 'HTML 資訊汲取（下篇） - TagSoup 輸出 namespace 問題的解決方案'
date: 2011-02-27 20:24:00
comments: true
categories:
  - Programming
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
### Namespace 問題

在上一篇文章『[HTML 資訊汲取（中篇） - Default namespace 問題][html-data-mining-part-2-jdom-tagsoup-xpath-default-namespace]』中提到：在 XPath 中，沒有所謂 default namespace (預設命名空間)。若 XPath 路徑未使用 prefix (前置字符) 指明 namespace，則其對應的 namespace 為 empty namespace (空命名空間)。因此，若在 XML 文件中定義了 default namespace，則所有的標籤必定都歸屬於某個不為空的 namespace。此時，未指明 namespace 的 XPath 路徑，將對應不到任何元素。

另一方面，TagSoup 處理過的 HTML 文件，有三個與 namespace 有關的問題：

1. TagSoup 處理過的 HTML 文件，一律輸出為 XHTML 格式，並且定義了 `xmlns="http://www.w3.org/1999/xhtml"` 這個 default namespace，以及`xmlns:html="http://www.w3.org/1999/xhtml"` 這個以 `html` 為 prefix 的 namespace。而其餘的 namespace 的定義，都將被移除。
2. 由於 TagSoup 處理過的 HTML 文件，含有 default namespace 的定義，使用 XPath 選取元素時，一定要在路徑的標籤或屬性前，加上 `html` 這個 prefix，才能對應到元素。
3. TagSoup 處理過的 HTML 文件，其元素標籤若含有 prefix 定義，即使 prefix 是 `html`，都會被修改並對應到 `urn:x-prefix:html` 這樣的 URI（參考 TagSoup 原始碼中 Parser 類別的 foreign() 函數、ElementType 類別的 namespace() 函數以及 [change log][2]），因而使該標籤對應不到原本正確的 namespace 的 URI。導致使用了該 prefix 的 XPath 路徑，也對應不到正確的標籤。（原本應該能正確對應的，這一點可以經由使用 JDOM 內建的 XML 解析器的實驗證明。）

### 思考可能的解決方案

內建的 XML 解析器不會有 namespace 的問題，但是無法處理 non-well-formed HTML。顯然此路不通……。

TagSoup 可以處理 non-well-formed HTML，但是會有 namseapce 問題。該是時候放棄 TagSoup，另找一個 HTML 解析器了嗎？還是如果我們可以配合 TagSoup 輸出的 namespace 定義，在 XPath 中一律使用 `html` prefix；或是，相反地，讓 TagSoup 不輸出 namespace 。是否就可以解決問題呢？（雖然邏輯上還存在著一個完美的可能性，就是讓 TagSoup 不輸出 default namespace，也同時能保留外部 namespace 的定義，不過這並不容易達到。這已牽涉到 TagSoup 的設計架構了，除非大幅修改 TagSoup 的架構，讓它正確處理外部 namespace 的定義。但是這已經超出本文的目的了。）

<!-- more -->

試著分析一下這兩種方法的優劣：

|       | 在 XPath 路徑中一律使用 prefix | 關掉 TagSoup 對 namespace 的處理 |
|:-----:|:--------------------------|:-----------------------------|
|致命缺點| <ol><li>由於 TagSoup 不處理外部 namespace 定義，即使使用 prefix 依然不能對應多個 namespace。</li></ol> | <ol><li>可能造成 namespace 衝突。</li></ol> |
|缺點   | <ol><li>手動撰寫 prefix，容易遺漏，既麻煩又容易出錯。</li><li>若 XPath 是開放給使用者輸入，則必須強迫、提醒使用者記得加入 `html` prefix，不友善又麻煩又容易出錯。</li></ol> | <ol><li>需要一些技巧才能關掉或移除 namespace。</li></ol> |
|優點   | <ol><li>可以利用程式自動追加 `html` prefix，避免上述缺點。</li><li>符合 XPath 規範。</li></ol> | <ol><li>XPath 寫法比較不繁瑣。</li></ol> |

接下來，讓我詳細說明這兩種作法。

### 方法一： 在 XPath 路徑中，一律使用 prefix

首先，若 HTML 中不含其他 namespace 的定義，除了前面提到的，可能會比較麻煩或不友善的問題，這其實是比較好，比較正規的解決方式。但若是 HTML 中另含有其他 namespace 定義（譬如 Google News 中，另外定義了 `data` namespace），則會被 TagSoup 移除，造成錯誤。真可惜，如果 TagSoup 不會移除其他的 namespace 就好了，畢竟這是比較完善的解決方案。

TagSoup 的作者 John Cowan 也推薦這個作法，在 Google Groups 的 tagsoup-friends 討論群組中，John Cowan [這樣][4]回答：

<pre>

Re: Thank you for great product! Workaround for namespace issue:


John Cowan
May 13 2010, 2:03 am
misha680 scripsit:


> I am using tagsoup with XOM. It is working great, however I have run
> into the following namespace issues as described here:
> http://www.supermind.org/blog/613/dom4j-xpath-tagsoup-namespaces-sweet
> Per the post, it looks like there is not an easy solution, but I was
> hoping perhaps that there might be something (new) I am missing?


Well, you could suck it up and use html: prefixes in your XPath expressions,
which is what I would recommend.


There is a long-standing bug in getting TagSoup not to send namespace
information.  When I get a chance I'll work on that.

</pre>

作者也提到 namespace 問題是長久以來的 bug，如果有機會他會設法解決。

如果在你的專案中，可以在 XPath 路徑中使用 prefix，而且要解析的 HTML 文件，也確定都沒有使用 prefix 引用 namespace 的話，這就是標準答案了。如果不是，或是純粹好奇有沒有其他的解法，請繼續往下看。

### 方法二：設法略過 namespace 的處理

設法關掉 TagSoup 對於 namespace 的處理，這個方法是希望讓原本屬於 default namespace 的元素或屬性，歸到 empty namespace 下，讓未指定 prefix 的 XPath 可以對應。不過，一旦關閉 namespaces 的處理，所有的 namespaces 都將失效，都成為 empty namespace 了，這將造成 namespace 衝突，所以一定要確定要處理的 HTML 文件未使用外部 namespace 才行。

事實上，SAX API 提供有標準的作法，可以將 namespace 的處理關掉，透過 [setFeature() 函數][6] 就可以做到：

``` groovy
builder.setFeature( "http://xml.org/sax/features/namespaces", false )
```

其中，參數 `http://xml.org/sax/features/namespaces` 是 SAX API 定義的所謂 **features** (特性或模式)，用來設定 XML 解析器或是文件處理器的行為。更多的 features 可參考 [SAX API 的 features 列表][7]。

可惜的是，這個方法在 JDOM/TagSoup 這個組合行不通。網路上有一堆討論，讀者若有興趣，可以使用 tagsoup namespace 關鍵字自行搜尋。值得注意的是，在這一堆討論中，其中一篇[討論文][8]中提到：

<pre>

How to parse XML document with default namespace with JDOM XPath

TagSoup lets you disable namespaces by setting the standard SAX feature `http://xml.org/sax/features/namespaces`
to false. Unfortunately for you, JDOM will turn it back on before parsing.
You might need to use a standard DOM instead; Java 5 and Java 6 have built-in XPath support.

</pre>

意思大致上是說，TagSoup 是支援 `http://xml.org/sax/features/namespaces` 這個 features 的，但是 JDOM 解析文件前，會再把 namespaces 的處理功能重新打開。

基本上，這個說法是對的：JDOM 會再把 namespace 的處理功能重新打開。不過情況還要再複雜一些，稍後我會詳細說明。

上面的回答中也提到，應該找標準的 DOM 的處理方法。不過，Java 5/6 內建的 JAXP 的 [DocumentBuilderFactory][11]，是透過 `javax.xml.parsers.SAXParserFactory` 這個系統屬性來建立解析器的。依照 [TagSoup 文件][12] 的說明，若要透過 JAXP 使用 TagSoup 作為解析器，則必須透過 System 類別的靜態方法 [setProperty() 函數][13] 設定此屬性：

``` groovy
System.setProperty( "javax.xml.parsers.SAXParserFactory", "org.ccil.cowan.tagsoup.jaxp.SAXFactoryImpl" )
```

這等於是使用了 global variable！太邪惡了！在大型專案中，這可是會讓其他需要處理 XML 的模組，都受到影響的！絕對要避免使用。

其實，前面提到的 TagSoup 的作者回覆的問題中，提問者指出的參考文章：

> [Dom4j + XPath + TagSoup - Namespaces = sweet!][14]

就是在這樣絕望的情況下，自行針對解析完畢的 DOM 物件，尋訪其全部的元素，再一一移除每個元素的 namespace 定義。不過，文章中介紹的是針對 dom4j 的作法，在 JDOM 下，要怎麼做呢？其實也不難，我的作法如下：

``` groovy
def removeNamespace( element ) {
    def additional = element.additionalNamespaces
    if ( additional.size() == 0 && element.namespace == Namespace.NO_NAMESPACE ) {
        return
    }

    element.namespace = Namespace.NO_NAMESPACE
    if ( additional.size() > 0 ) {
        for ( int i = additional.size(); --i >= 0; ) {
            element.removeNamespaceDeclaration( additional.get( i ) )
        }
    }

    def children = element.children
    for ( int i = children.size(); --i >= 0; ) {
        def child = children.get( i )
        removeNamespace( child )
    }
}
```

上面這個函數負責移除指定的元素以及其所有子元素的所有的 namespace 定義。如果只要移除特定的 namespace，則需要判斷 URI，不過由於 TagSoup 會修改使用 prefix 的標籤的 URI 的定義，這樣做並沒有意義。另外，上面的函數並未處理屬性的 namespace，需要的話，請讀者自行嘗試加上屬性的處理。

有了上面的函數，要移除整個文件的 namespace 定義，只要將 JDOM 的 Document 物件傳入即可：

``` groovy
def builder = new SAXBuilder( "org.ccil.cowan.tagsoup.Parser" )
def is = new InputSource( "http://news.google.com.tw/" )
is.setEncoding( "UTF-8" )
def doc = builder.build( is )
removeNamespace( doc )
```

### 從源頭下手

透過事後的處理，將 JDOM/TagSoup 產生的 namespace 移除，確實可以達到效果，不過這樣做並不是很有效率。

為甚麼不直接從源頭修正呢？

如果前面提到的『JDOM 會再把 namespace 的處理重新打開』是正確的，我們是不是可以在實際解析之前，再把 namespace 的處理關掉呢？

查看 JDOM 的原始碼，可以在 `SAXBuilder` 類別中看到，XML 解析器是在 `createParser()` 函數中建立的：

``` java
protected XMLReader createParser() throws JDOMException {
    XMLReader parser = null;
    if (saxDriverClass != null) {
        // The user knows that they want to use a particular class
        try {
            parser = XMLReaderFactory.createXMLReader(saxDriverClass);
            // Configure parser
            setFeaturesAndProperties(parser, true);
        }
        catch (SAXException e) {
            throw new JDOMException("Could not load " + saxDriverClass, e);
        }
    }
    else {
        // ...
    }
}
```

建立 XML 解析器之後，會呼叫 `setFeaturesAndProperties()` 函數，設定解析器：

``` java
setFeaturesAndProperties(parser, true);
```

注意到這裡的第二個參數是 `true`。再來查看 `setFeaturesAndProperties()` 函數：

``` java
private void setFeaturesAndProperties(XMLReader parser, boolean coreFeatures)
        throws JDOMException {
    // ...
    if (coreFeatures) {
        // ...
        // Setup some namespace
        features.internalSetFeature(parser, "http://xml.org/sax/features/namespaces", true, "Namespaces");
        internalSetFeature(parser, "http://xml.org/sax/features/namespace-prefixes", true, "Namespace prefixes");
    }
}
```

因為 `coreFeatures` 參數值是 `true`，所以進入 `if` 區塊，呼叫 `internalSetFeature()` 函數。這裡可以看到，設定的是 `namespaces` 及 `namespace-prefixes` 這兩個 features，而傳入的參數值是 `true`。

其實看到這邊心裡就有數了。不過，我們還是看看 `internalSetFeature()` 函數，確認一下：

``` java
private void internalSetFeature(XMLReader parser, String feature, boolean value, String displayName)
        throws JDOMException {
    try {
        parser.setFeature(feature, value);
    }
    catch (SAXNotSupportedException e) {
        throw new JDOMException( displayName
            + " feature not supported for SAX driver "
            + parser.getClass().getName());
    }
    catch (SAXNotRecognizedException e) {
        throw new JDOMException( displayName
            + " feature not recognized for SAX driver "
            + parser.getClass().getName());
    }
}
```

顯然，JDOM 的確是把 namespaces 這個 feature 又打開了。

在動手修改 JDOM 之前，先做個簡單的實驗確認一下：

``` java
static class ParserHack extends org.ccil.cowan.tagsoup.Parser {
    @Override
    public void setFeature (String name, boolean value) {
        System.out.println( "ParserHack: setting feature: " + name + " to " + value )
        if ( name.equals( "http://xml.org/sax/features/namespaces" ) ) {
            super.setFeature( name, false );
        }
        else {
            super.setFeature( name, value );
        }
    }
}
```

我建立了一個假的 XML 解析器 `ParserHack`，讓它繼承 TagSoup 的 `org.ccil.cowan.tagsoup.Parser`，然後覆寫(override) `setFeature()` 函數，在這個函數中，比對 feature 名稱，若為 `namespaces`，則強迫設定為 `false`。然後，將這個 class 的名稱傳入 `SAXBuilder` 的 constructor，用來取代 TagSoup 的解析器：

``` groovy
def builder = new SAXBuilder( ParserHack.class.canonicalName )
```

將上面的程式碼套入上一篇的實驗程式中，執行結果如下：
```
Caught: org.jdom.IllegalNameException: The name "" is not legal for JDOM/XML element: XML names cannot be null or empty.
```
發生錯誤了。這表示，即使 JDOM 並未強制將 `namespaces` 這個 feature 打開，TagSoup 還是會出錯。看來，問題並不光是修改 JDOM 的原始碼這麼簡單。

讓我們看看 TagSoup 的原始碼，看看問題到底在哪邊？

既然問題是在呼叫 `setFeature()` 函數，設定 `http://xml.org/sax/features/namespaces` 這個 feature 之後才發生的，我們就找找看在程式中有哪些地方用到它：

首先，`http://xml.org/sax/features/namespaces` 這個 feature ，在 src/java/org/ccol/cowan/tagsoup/Parser.java 中，被定義為 `namespacesFeature` 這個常數：

``` java
public final static String namespacesFeature = "http://xml.org/sax/features/namespaces";
```

然後，在 `setFeature()` 函數中，判定若參數 `name` 值等於 `namespacesFeature`，則將 namespace 這個變數設定為指定的值，在上面的實驗裡，這個值是 `false`：

``` java
public void setFeature (String name, boolean value)
        throws SAXNotRecognizedException, SAXNotSupportedException {
    // . . .
    if (name.equals(namespacesFeature))
        namespaces = value;
    // . . .
}
```

最後，真正使用 `namespaces` 這個變數的地方，在 `push()` 和 `pop()` 函數中，我們看 `pop()` 函數就好：

``` java
private void pop() throws SAXException {
    if (theStack == null) return; // empty stack
    String name = theStack.name();
    String localName = theStack.localName();
    String namespace = theStack.namespace();
    String prefix = prefixOf(name);
    if (!namespaces) namespace = localName = "";
    theContentHandler.endElement(namespace, localName, name);
    // . . .
}
```

注意到上面對 `ContentHandler` 的 `endElement()` 函數的呼叫，傳入的三個參數分別是 `namespace`, `localName`, `name`。但是，在前一行中：

``` java
if (!namespaces) namespace = localName = "";
```

若 `namespaces` 變數值為 `false`，則會將 `namespace` 及 `localName` 兩個要傳給 endElement() 函數的參數都設定為空字串！所以，JDOM 就抱怨 `localName` 是空字串。這就是我們看到的錯誤訊息的元兇！...是嗎？

本來我也以為，當 [`http://xml.org/sax/features/namespaces`][15] 這個 feature 設定為 `false` 時，TagSoup 呼叫 `startElement()` 及 `endElement()` 函數時將 `localName` 設定為空字串，這樣的處理是錯誤的。但是 [SAX 的 startElement() 函數的說明文件][16] 卻是這麼寫的：

<pre>
localName - the local name (without prefix),
    or the empty string if Namespace processing is not being performed
</pre>

意思大致是說，當不處理 namespace 時（也就是 `http://xml.org/sax/features/namespaces` 設定為 `false` 時），`localName` 這個參數是**空字串**。

另外，這一篇 [SAX 的 namespace 的說明文章][17]，也詳細說明了`http://xml.org/sax/features/namespaces` 和 `http://xml.org/sax/features/namespace-prefixes` 這個兩個 feature 開啟與關閉時，`startElement()` 及 `endElement()` 函數的相關行為。

所以，是 JDOM 的處理方式不正確，才發生 `IllegalNameException` 這個錯誤的。不過，也不難想像這個結果：JDOM 就是不允許關閉 namespace 的處理，否則它何必非要將 `http://xml.org/sax/features/namespaces` 這個 feature 定義為 `coreFeatures`，還強制將它打開呢？

既然問題都在 JDOM，就動手來改吧（還稱不算是修正，頂多算是 hack 吧）：

首先，要先解除封印︰允許 `namespaces` 及 `namespace-prefixes` 兩個 features 的設定（其實 TagSoup 不支援 `namespace-prefixes`。可以參考 Parser.java 中 `namespacePrefixesFeature` 變數的註解）。打開 SAXBuilder.java，找到 `setFeaturesAndProperties()` 函數，將下列兩個 `internalSetFeature()` 函數的呼叫註解掉：

``` java
// Setup some namespace features.
/*
internalSetFeature(parser, "http://xml.org/sax/features/namespaces", true, "Namespaces");
internalSetFeature(parser, "http://xml.org/sax/features/namespace-prefixes", true, "Namespace prefixes");
*/
```

再來，要處理 `localName` 為空字串的狀況。同時，除了元素名稱之外，屬性名稱也有類似的問題：打開 SAXHandler.java，找到 `startElement()` 函數，加上下面 `hack start` 到 `hack end` 部份的程式碼，為避免說明太過繁瑣造成誤解，完整函數修改如下：

``` java
public void startElement(String namespaceURI, String localName, String qName, Attributes atts)
        throws SAXException {
    if (suppress) return;

    Element element = null;

    if ((namespaceURI != null) && (!namespaceURI.equals(""))) {
        String prefix = "";

        // Determine any prefix on the Element
        if (!qName.equals(localName)) {
            int split = qName.indexOf(":");
            prefix = qName.substring(0, split);
        }
        Namespace elementNamespace = Namespace.getNamespace(prefix, namespaceURI);
        element = factory.element(localName, elementNamespace);
    }
    else {
        // hack start
        int split = qName.indexOf(":");
        localName = qName.substring(split+1);
        // hack end
        element = factory.element(localName);
    }

    // Take leftover declared namespaces and add them to this element's
    // map of namespaces
    if (declaredNamespaces.size() > 0) {
        transferNamespaces(element);
    }

    // Handle attributes
    for (int i=0, len=atts.getLength(); i<len; i++) {
        Attribute attribute = null;

        String attLocalName = atts.getLocalName(i);
        String attQName = atts.getQName(i);
        int attType = getAttributeType(atts.getType(i));
        System.out.println( "attLocalName:" + attLocalName + ",attQName:" + attQName + ",uri=" + atts.getURI(i));

        // Bypass any xmlns attributes which might appear, as we got
        // them already in startPrefixMapping().
        // This is sometimes necessary when SAXHandler is used with
        // another source than SAXBuilder, as with JDOMResult.
        if (attQName.startsWith("xmlns:") || attQName.equals("xmlns")) {
            continue;
        }

        // First clause per http://markmail.org/message/2p245ggcjst27xe6
        // patch from Mattias Jiderhamn
        if ("".equals(attLocalName) && attQName.indexOf(":") == -1) {
            attribute = factory.attribute(attQName, atts.getValue(i), attType);
        // hack start
        } else if ( "".equals(atts.getURI(i)) ) {
            int split = attQName.indexOf( ":" );
            attLocalName = attQName.substring(split + 1);
            attribute = factory.attribute(attLocalName, atts.getValue(i), attType);
        // hack end
        }
        else if (!attQName.equals(attLocalName)) {
            String attPrefix = attQName.substring(0, attQName.indexOf(":"));
            Namespace attNs = Namespace.getNamespace(attPrefix, atts.getURI(i));

            attribute = factory.attribute(attLocalName, atts.getValue(i), attType, attNs);
        }
        else {
            attribute = factory.attribute(attLocalName, atts.getValue(i), attType);
        }
        factory.setAttribute(element, attribute);
    }

    flushCharacters();

    if (atRoot) {
        document.setRootElement(element);   // XXX should we use a factory call?
        atRoot = false;
    }
    else {
        factory.addContent(getCurrentElement(), element);
    }
    currentElement = element;
}
```

使用 ant 建置專案，然後將 build/jdom.jar 放到 CLASSPATH 中（記得先備份原有的 jdom.jar）。

最後，修正實驗用的程式：

<!-- jdom-tagsoup-xpath-namespace.v2.groovy -->
<!-- gist inno-v/5650647 -->
{% gist amobiz/8520ab1594aacc6be7dc %}

執行結果如下：

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
<html xmlns:html="http://www.w3.org/1999/xhtml">
  <head>
    <title>Namespace Prefix Test</title>
  </head>
  <body>
    <span>prefix:default</span>
    <span>prefix:html</span>
    <span>prefix:myns</span>
  </body>
</html>

result:

namespace prefix: ""; xpath: "//span"
    <span>prefix:default</span>
    <span>prefix:html</span>
    <span>prefix:myns</span>
namespace prefix: "html"; xpath: "//html:span"
namespace prefix: "myns"; xpath: "//myns:span"
```

雖然 `html` 標籤中，仍留有 `xmlns:html` 的定義，但是已經沒有 default namespace 的定義了。同時，輸出的 `span` 標籤元素，已不再含有任何 namespace 宣告，也不含 prefix。而 XPath 選擇的結果，只有未指定 prefix 的 XPath 路徑：`//span`，可以篩選出 `span` 元素。

雖然大部分情況下，這樣的修改就夠了，不過細心的讀者可能已經發現，我的實驗程式中的 HTML 文件內容，元素都未包含有屬性。所以，可能會有這樣的疑問：修改後的 JDOM 可以正確處理屬性標籤的 prefix 嗎？答案是：JDOM 已經可以了，但是 TagSoup 還要一點小修改。因為 TagSoup 在 `namespaces` 這個 features 設定為 `false` 時，仍然會呼叫 `ContentHandler` 的 `startPrefixMapping()` 及 `endPrefixMapping()` 函數，這會導致帶有 prefix 的屬性的元素，輸出時會含有類似 `xmlns:xxx="urn:x-prefix:xxx"` 的定義。

要編譯 TagSoup 之前，需要先做一些準備工作。我的環境使用的是 JDK 1.6.x，根據 TagSoup 網站的[說明][18]，若要在 Java 5.x+ 以上編譯，必須使用 [Saxon 6.5.5][19]：

<pre>

**Warning: TagSoup will not build on stock Java 5.x or 6.x!** Due to a bug
in the versions of Xalan shipped with Java 5.x and 6.x, TagSoup will not build
out of the box. You need to retrieve [Saxon 6.5.5][19], which does not have
the bug. Unpack the zipfile in an empty directory and copy the saxon.jar and
saxon-xml-apis.jar files to $ANT_HOME/lib. The Ant build process for TagSoup
will then notice that Saxon is available and use it instead.

</pre>

所以請先下載 [Saxon 6.5.5][19]，解開後，將 saxon.jar 及 saxon-xml-apis.jar 放到 ant 安裝目錄的 lib 目錄下。

然後請打開 Parser.java，我們要將所有使用到 `startPrefixMapping()` 及 `endPrefixMapping()` 函數的地方，都加上是否啟用 `namespaces` 的判斷。同樣地，要修改的地方都放在 `hack start` 到 `hack end` 註解中間，為了避免說明不清造成誤解，修改後的函數的完整列表如下：

``` java
public void parse (InputSource input) throws IOException, SAXException {
    setup();
    Reader r = getReader(input);
    theContentHandler.startDocument();
    theScanner.resetDocumentLocator(input.getPublicId(), input.getSystemId());
    if (theScanner instanceof Locator) {
        theContentHandler.setDocumentLocator((Locator)theScanner);
    }
    // hack start
    if (namespaces)
    // hack end
    if (!(theSchema.getURI().equals("")))
        theContentHandler.startPrefixMapping(theSchema.getPrefix(), theSchema.getURI());
    theScanner.scan(r, this);
}

public void eof(char[] buff, int offset, int length) throws SAXException {
    if (virginStack)
        rectify(thePCDATA);
    while (theStack.next() != null) {
        pop();
    }
    // hack start
    if (namespaces)
    // hack end
    if (!(theSchema.getURI().equals("")))
        theContentHandler.endPrefixMapping(theSchema.getPrefix());
    theContentHandler.endDocument();
}

private void pop() throws SAXException {
    if (theStack == null) return;   // empty stack
    String name = theStack.name();
    String localName = theStack.localName();
    String namespace = theStack.namespace();
    String prefix = prefixOf(name);

    // System.err.println("%% Popping " + name);
    if (!namespaces) namespace = localName = "";
    theContentHandler.endElement(namespace, localName, name);

    // hack start
    if (namespaces) {
    // hack end

    if (foreign(prefix, namespace)) {
        theContentHandler.endPrefixMapping(prefix);
        // System.err.println("%% Unmapping [" + prefix + "] for elements to " + namespace);
    }
    Attributes atts = theStack.atts();
    for (int i = atts.getLength() - 1; i >= 0; i--) {
        String attNamespace = atts.getURI(i);
        String attPrefix = prefixOf(atts.getQName(i));
        if (foreign(attPrefix, attNamespace)) {
            theContentHandler.endPrefixMapping(attPrefix);
            // System.err.println("%% Unmapping [" + attPrefix + "] for attributes to " + attNamespace);
        }
    }

    // hack start
    }
    // hack end

    theStack = theStack.next();
}

private void push(Element e) throws SAXException {
    String name = e.name();
    String localName = e.localName();
    String namespace = e.namespace();
    String prefix = prefixOf(name);

    // System.err.println("%% Pushing " + name);
    e.clean();
    if (!namespaces) namespace = localName = "";
    if (virginStack && localName.equalsIgnoreCase(theDoctypeName)) {
        try {
            theEntityResolver.resolveEntity(theDoctypePublicId, theDoctypeSystemId);
        }
        catch (IOException ew) {}   // Can't be thrown for root I believe.
    }

    // hack start
    if (!namespaces)
    // hack end

    if (foreign(prefix, namespace)) {
        theContentHandler.startPrefixMapping(prefix, namespace);
        // System.err.println("%% Mapping [" + prefix + "] for elements to " + namespace);
    }
    Attributes atts = e.atts();
    int len = atts.getLength();
    for (int i = 0; i < len; i++) {
        String attNamespace = atts.getURI(i);
        String attPrefix = prefixOf(atts.getQName(i));

        // hack start
        if (!namespaces) {
            ((AttributesImpl)atts).setURI( i, "" );
            ((AttributesImpl)atts).setLocalName( i, "" );
        }
        else
        // hack end
        if (foreign(attPrefix, attNamespace)) {
            theContentHandler.startPrefixMapping(attPrefix, attNamespace);
            // System.err.println("%% Mapping [" + attPrefix + "] for attributes to " + attNamespace);
        }
    }
    theContentHandler.startElement(namespace, localName, name, e.atts());
    e.setNext(theStack);
    theStack = e;
    virginStack = false;
    if (CDATAElements && (theStack.flags() & Schema.F_CDATA) != 0) {
        theScanner.startCDATA();
    }
}
```

修改後，同樣使用 ant 建置專案，完成後，將 build/lib/tagsoup-1.2.jar 放到 CLASSPATH 下即可（記得先備份原有的 tagsoup-1.2.jar）。

為了確認能否正確處理屬性，還要將實驗程式加上屬性：

<!-- jdom-tagsoup-xpath-namespace.v3.groovy -->
<!-- gist inno-v/5650651 -->
{% gist amobiz/083024d4241f3324321a %}

執行結果如下︰

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
    <html:span html:id="html">prefix:html</html:span>
    <myns:span myns:id="myns">prefix:myns</myns:span>
  </body>
</html>

output:

<?xml version="1.0" encoding="UTF-8"?>
<html>
  <head>
    <title>Namespace Prefix Test</title>
  </head>
  <body>
    <span>prefix:default</span>
    <span id="html">prefix:html</span>
    <span id="myns">prefix:myns</span>
  </body>
</html>

result:

namespace prefix: ""; xpath: "//span"
    <span>prefix:default</span>
    <span id="html">prefix:html</span>
    <span id="myns">prefix:myns</span>
namespace prefix: "html"; xpath: "//html:span"
namespace prefix: "myns"; xpath: "//myns:span"
```

不但 `id` 屬性可以正確處理，連 `html` 標籤上的 `xmlns:html` 定義都移除了。帥啊！

最後，套用到 gnews.groovy 看看：

<!-- jdom-tagsoup-xpath-namespace-gnews.v2.groovy -->
<!-- gist inno-v/5650668 -->
{% gist amobiz/087487e174646289afd1 %}

輸出結果，就請讀者自行動手試試看吧。

### 結論

若讀者的專案可以於 XPath 中使用 prefix，則推薦於專案中使用完整路徑來選取元素。相反地，若不適合在專案中使用含 prefix 的 XPath 路徑，則可依照本文提供的兩種方法，將 default namespace 移除。

另外，由於 TagSoup 完全不處理 `http://www.w3.org/1999/xhtml` 以外的 namespace，並直接將外部 namespace 都對應為 `xmlns:xxx="urn:x-prefix:xxx"` 的形式。所以，當處理含有外部 namespace 定義的文件時，應考慮使用標準 XML 解析器進行解析。若使用 TagSoup 解析，將會遇到許多困難。

歡迎大家的回饋與心得分享。

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [HTML 資訊汲取（上篇） - 使用 JDOM 、 TagSoup 及 XPath][html-data-mining-part-1-jdom-tagsoup-xpath]
* [HTML 資訊汲取（中篇） - Default namespace 問題][html-data-mining-part-2-jdom-tagsoup-xpath-default-namespace]
* [HTML 資訊汲取（下篇） - TagSoup 輸出 namespace 問題的解決方案][html-data-mining-part-3-jdom-tagsoup-xpath-namespace-fix-how-to]
{% endpostrefs %}

<!-- external references -->

[2]: http://home.ccil.org/%7Ecowan/XML/tagsoup/CHANGES
[4]: http://groups.google.com/group/tagsoup-friends/browse_thread/thread/11513422d7f012b2/4a48a15f89200bbb?pli=1
[5]: http://www.google.com/url?sa=D&q=http://www.supermind.org/blog/613/dom4j-xpath-tagsoup-namespaces-sweet
[6]: http://www.jdom.org/docs/apidocs/org/jdom/input/SAXBuilder.html#setFeature%28java.lang.String,%20boolean%29
[7]: http://www.saxproject.org/apidoc/org/xml/sax/package-summary.html
[8]: http://www.coderanch.com/t/420122/XML/parse-XML-document-default-namespace
[9]: http://java.sun.com/javase/6/docs/api/javax/xml/xpath/package-summary.html
[10]: http://download.oracle.com/javase/6/docs/api/javax/xml/xpath/XPath.html
[11]: http://download.oracle.com/javase/6/docs/api/javax/xml/parsers/DocumentBuilderFactory.html
[12]: http://ccil.org/~cowan/XML/tagsoup/#1.1
[13]: http://download.oracle.com/javase/6/docs/api/java/lang/System.html#setProperty%28java.lang.String,%20java.lang.String%29
[14]: http://www.supermind.org/blog/613/dom4j-xpath-tagsoup-namespaces-sweet/trackback
[15]: http://xml.org/sax/features/namespaces
[16]: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html#startElement%28java.lang.String,%20java.lang.String,%20java.lang.String,%20org.xml.sax.Attributes%29
[17]: http://sax.sourceforge.net/namespaces.html
[18]: http://ccil.org/~cowan/XML/tagsoup/#warning
[19]: http://prdownloads.sourceforge.net/saxon/saxon6-5-5.zip
