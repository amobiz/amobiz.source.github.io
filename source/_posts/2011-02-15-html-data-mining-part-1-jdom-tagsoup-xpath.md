title: 'HTML 資訊汲取（上篇） - 使用 JDOM 、 TagSoup 及 XPath'
date: 2011-02-15 00:00:00
comments: true
categories: 
tags:
  - Groovy
  - HTML
  - JDOM
  - TagSoup
  - XML
  - XPath
---

### 簡介

本文將以實際範例介紹如何以 JDOM 搭配 TagSoup ，將 HTML 解析為 DOM 文件物件模型，並使用 XPath 汲取資訊，或者將文件輸出為 XHTML 格式。

### 資訊汲取

Internet 上蘊藏著豐富的內容，供人們分享訊息、傳承知識。但是在 [Semantic Web][1] 普及之前，除非資料來源網站主動提供資料存取 API，否則，要擷取既有 Internet 上的資訊，還是只能從解析 HTML 著手。

### 雜亂無章的 HTML (Malformed and faulty HTML)

但是眾所週知，即使存在著如 XHTML 標準規範，網路上還是充斥著各種不合乎標準的 HTML 網頁。這個現象，甚至還有個專用名詞，叫做 [Tag soup][2]。

 
<!-- more -->


而業界一致看好、制訂中的 [HTML5][4] ，面對這樣的現況，並非選擇像 [XHTML 2.0][5] 一樣，以放棄向後相容的方式，以激烈的手段加以抵制。而是，相反地，對這樣的現況加以包容。因此，可以預見，要想解析 HTML，程式設計師必然無法逃避與 tag soup 的纏鬥。

回過頭來想，XHTML 的設計思維，是以方便程式化處理為首要考量；而 HTML5 則以最大相容性為出發，要兼容現實中的實際使用需求。有沒有辦法能夠兩者兼得，既可以方便人們撰寫網頁，又可以讓程式方便解析呢？ 

答案其實就在眼前。瀏覽器，這個當年 Internet 標準大戰的主角，雖然對於 tag soup 的存在，也有不小的貢獻，但是，從另一方面來看，瀏覽器其實也是 tag soup 的解藥：瀏覽器能夠將網路上充斥的各式各樣不合標準的內容，呈現給使用者觀看，其實是瀏覽器的設計者，竭盡所能，猜測網頁設計者可能的意圖，設法將雜亂不合規格的 HTML 文件，轉換成瀏覽器能夠解讀的格式。

在 [RIA][6] 盛行、Javascript 大行其道的今天，client side 的程式設計師，可以很容易地透過 Javascript，利用 jQuery 等 famework 很方便地存取瀏覽器解析完畢的 DOM 文件物件模型，取得需要的資訊。

但是 server side 呢？除了嵌入 [Mozilla][7] 或 [Webkit][8] 瀏覽器核心之外，有沒有更簡單的方法呢？

為了簡化 HTML 網頁的資訊汲取作業，若能像瀏覽器將 HTML 轉換成 DOM 一樣，將 HTML 網頁（不論是否符合標準格式），轉換成標準的 well-formed XML 文件，或是 XHTML。那麼，不就可以使用諸如 XPath、XPointer 等標準，利用現成的 API 或工具，隨意存取資訊了嗎？

### HTML 解析器 (HTML Parser)

是的，老早就有人想到這樣做了。以下是幾個熱門的 HTML 解析器：

* [Cyberneko HTML Parser][9] 
* [HTML Parser][10] 
* [JTidy][11] 
* [TagSoup][12] 

其中，TagSoup 是架構在 XML 解析器 [SAX2][13] 標準 [XMLReader][14] 介面之上，所以具有良好的可攜性，可以與 [JAXP][15]、[JDOM][16]、[XOM][17]、[dom4j][18] 等主流工具搭配使用。

### 使用 JDOM + TagSoup 解析 HTML

接下來，我將介紹如何以 JDOM 搭配 TagSoup ，將 HTML 解析為 DOM 文件物件模型，並使用 XPath 汲取資訊，或者將文件輸出為 XHTML 格式。（日後我再找機會介紹 Groovy 內建的 [XmlSlurper][19] 搭配 TagSoup 的用法。）

#### 準備工作

* 首先，請下載並安裝 JDOM:

下載 [jdom-1.1.1.zip][20]，解開後，將 jdom.jar (JDOM 的實作) 及 jaxen.jar (XPath 的實作)，加到 CLASSPATH 下；或是放到 JDK 安裝目錄的 jre\lib\ext 目錄下；或是放到 Groovy 安裝目錄的 lib 目錄下即可。

* 接著，請下載及安裝 TagSoup：

下載 [tagsoup-1.2.jar][21]，如同上一步驟，將檔案直接加到 CLASSPATH 下即可。

#### 使用 SAXBuilder 建立 DOM 文件

首先，建立 JDOM 的 SAXBuilder，SAXBuilder 可以在 constructor 指定解析器的類別名稱，我們只要傳入 TagSoup 的解析器類別全名：org.ccil.cowan.tagsoup.Parser，即可使用 TagSoup 進行解析：

``` groovy
def builder = new SAXBuilder( "org.ccil.cowan.tagsoup.Parser" )
```

建立好 SAXBuilder，就可以準備呼叫 build() 方法進行 HTML 解析，並建立 DOM 物件。

雖然 SAXBuilder 提供了多個不同參數的 build() 方法，其中也有以 `String systemId` 為參數，可以直接傳入 uri 的版本，但是實際解析時，該方法卻是以系統預設編碼進行解析，而不會自動依據 HTML 文件指定的編碼格式自動解析。在台灣，這表示將以 BIG5 編碼解析文件，倘若對象文件並非以 BIG5 編碼（這裡將以 [`http://news.google.com.tw/`][22] 為例，該網頁是以 UTF-8 編碼。別誤會，這裡使用 Google News 首頁，並不表示該網站不符合 HTML 規範，而是因為 Google 的服務具有良好的反應速度與穩定性，相信它能夠承受得起我們這些程式設計師的胡亂測試，…這應該算是對 Google 的推崇吧！），解析結果將是一堆亂碼。因此，我們必須使用 [`build(org.xml.sax.InputSource in)`][23] 這個版本，建立好 InputSouce 之後，設定正確的編碼方式，再傳入 SAXBuilder 的 build() 方法進行解析：

```
def is = new InputSource( "http://news.google.com.tw/" )
is.setEncoding( “UTF-8” )
def doc = builder.build( is )
```

這樣子，就得到了 DOM 物件。不過，這裡需注意的是，SAXBuilder 的 build() 方法，建立的 DOM 物件，是 [`org.jdom.Document`][24]，若需要轉換為 [`org.w3c.dom.Document`][25] （譬如想要進一步使用 Java 標準 API 對該 DOM 文件進行處理時），則必須另外使用 [`org.jdom.output.DOMOutputter`][26] 進行轉換：

``` groovy
org.w3c.dom.Document w3cdoc = new DOMOutputter().build( doc )
```

同樣地，若是要將 JDOM 的 Document 輸出成 XML/XHTML ，則使用 [`org.jdom.output.XMLOutputter`][27] 進行轉換：

``` groovy
String xhtml = new org.jdom.output.XMLOutputter().outputString( doc )
```

或是直接輸出成檔案：

``` groovy
new org.jdom.output.XMLOutputter().output( doc, new FileWriter( "output.html" ) )
```

##### 使用 XPath 汲取資訊

取得 DOM 物件後，就可以使用 XPath 汲取資訊。XPath 的基本語法相當簡單，但是內容也相當多，這裡就略過 XPath 的語法介紹，詳細語法介紹請讀者自行搜尋 XPath 教學。

這裡將示範如何取出 Google News 主頁上的所有新聞標題。查看 [`http://news.google.com.tw/`][22] ，可以看到每則新聞標題是以如下的格式呈現，譬如『[曾雅妮的魔幻數字與粉紅色][28]』這一則新聞︰

``` html
<span class="titletext">曾雅妮的魔幻數字與粉紅色</span>
```

簡單起見，假設要選取所有 class 含有 titletext 內容的 HTML 標籤，則 XPath 如下：

``` xpath
//*[contains(@class,’titletext’)]
```

決定了 XPath 路徑，就可以用來取得新聞標題，並列印出來了：

``` groovy
def xpath = XPath.newInstance( "//*[contains(@class,'titletext')]" )
def result = xpath.selectNodes( doc )
result.each { println it.text }
```

完整的程式列表如下：

__gnews.groovy__

``` groovy
import org.jdom.*
import org.jdom.input.*
import org.jdom.xpath.*
import org.jdom.output.*
import org.xml.sax.*

def builder = new SAXBuilder( "org.ccil.cowan.tagsoup.Parser" )
def xpath = XPath.newInstance( "//*[contains(@class,'titletext')]" )
def is = new InputSource( "http://news.google.com.tw/" )
is.setEncoding( "UTF-8" )
def doc = builder.build( is )
def result = xpath.selectNodes( doc )
result.each { println it.text }
```

要執行上面的 groovy 程式，請在命令列下，執行：

``` bash
groovy gnews
```

即會在螢幕上輸出最新 Google News 上面的新聞標題。

就是這樣！是不是很簡單？ 

 歡迎大家的回饋與心得分享。 

### 相關文章：

* [HTML 資訊汲取（上篇） - 使用 JDOM 、 TagSoup 及 XPath][html-data-mining-part-1-jdom-tagsoup-xpath]
* [HTML 資訊汲取（中篇） - Default namespace 問題][html-data-mining-part-2-jdom-tagsoup-xpath-default-namespace] 
* [HTML 資訊汲取（下篇） - TagSoup 輸出 namespace 問題的解決方案][html-data-mining-part-3-jdom-tagsoup-xpath-namespace-fix-how-to] 

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[1]: http://en.wikipedia.org/wiki/Semantic_Web
[2]: http://en.wikipedia.org/wiki/Tag_soup
[4]: http://en.wikipedia.org/wiki/Html5
[5]: http://en.wikipedia.org/wiki/XHTML_2.0#XHTML_2.0
[6]: http://en.wikipedia.org/wiki/RIA
[7]: https://developer.mozilla.org/en/Viewing_and_searching_Mozilla_source_code_online
[8]: http://webkit.org/
[9]: http://nekohtml.sourceforge.net/
[10]: http://htmlparser.sourceforge.net/
[11]: http://jtidy.sourceforge.net/
[12]: http://home.ccil.org/~cowan/XML/tagsoup/
[13]: http://sax.sourceforge.net/
[14]: http://www.saxproject.org/apidoc/org/xml/sax/XMLReader.html
[15]: http://jaxp.java.net/
[16]: http://www.jdom.org/
[17]: http://www.xom.nu/
[18]: http://www.dom4j.org/
[19]: http://groovy.codehaus.org/Reading+XML+using+Groovy%27s+XmlSlurper
[20]: http://www.jdom.org/dist/binary/jdom-1.1.1.zip (jdom-1.1.1.zip)
[21]: http://home.ccil.org/~cowan/XML/tagsoup/tagsoup-1.2.jar (tagsoup-1.2.jar)
[22]: http://news.google.com.tw/
[23]: http://www.jdom.org/docs/apidocs/org/jdom/input/SAXBuilder.html#build%28org.xml.sax.InputSource%29
[24]: http://www.jdom.org/docs/apidocs/org/jdom/Document.html
[25]: http://download.oracle.com/javase/6/docs/api/org/w3c/dom/Document.html
[26]: http://www.jdom.org/docs/apidocs/org/jdom/output/DOMOutputter.html
[27]: http://www.jdom.org/docs/apidocs/org/jdom/output/XMLOutputter.html
[28]: http://iservice.libertytimes.com.tw/liveNews/news.php?no=462864&type=%E9%AB%94%E8%82%B2

