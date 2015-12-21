title: 'How to get the redirected URL using HttpURLConnection - 如何取得 HttpURLConnection 轉址後的 URL'
date: 2011-03-11 15:00:00
comments: true
categories:
  - Programming
tags: 
  - HTTP
  - Java
  - URL
  - howto
---

Java 的 [HttpURLConnection] 可以自動處理 [轉址 (redirect)][URL_redirection] 動作（但不會處理跨通信協定 (protocol) 的轉址， 請參考相關文章），這樣確實很方便。但是有時候我們需要知道轉址之後的網址，才能進一步處理網頁內容。

<!-- more -->  

### 透過 setInstanceFollowRedirects() 函數自行處理轉址

透過 HttpURLConnection 的 [setInstanceFollowRedirects() 函數][setInstanceFollowRedirects]（針對單一物件），或是 [setFollowRedirects() 函數][setFollowRedirects]（針對所有的 HttpURLConnection），我們可以決定不要讓 HttpURLConnection 自動處理轉址，然後透過 [getResponseCode() 函數][getResponseCode] 自行根據 response code，判斷是否發生轉址（回傳 3xx），若有轉址行為，則透過 [getHeaderField() 函數][getHeaderField] 取得 `Location` 欄位，取出轉址位址。一般的做法如下：
```java
HttpURLConnection con = (HttpURLConnection)(new URL( url ).openConnection());
con.setInstanceFollowRedirects( false );
con.connect();
int responseCode = con.getResponseCode();
System.out.println( responseCode );
String location = con.getHeaderField( "Location" );
System.out.println( location );
```

### 透過 getURL() 函數取得轉址結果

如果我們不需要針對轉址這個行為進一步處理，只是想要知道取得的內容的真實網址，其實有個簡單的方法，就是透過 [URLConnection] 的 [getURL() 函數][getURL]。在呼叫 URLConnection 的 [getInputStream() 函數][getInputStream] 或 `getResponseCode()` 函數（回傳 `2xx`）之後，`getURL()` 函數傳回的，就是轉址後的 URL：
```java
URLConnection con = new URL( url ).openConnection();
System.out.println( "orignal url: " + con.getURL() );
con.connect();
System.out.println( "connected url: " + con.getURL() );
InputStream is = con.getInputStream();
System.out.println( "redirected url: " + con.getURL() );
is.close();
```

歡迎大家的回饋與心得分享。

### 相關文章

* [Stackoverflow - Java - How to find the redirected url of a url?][stackoverflow-java-find-redirected-url]
* [Stackoverflow - Java doesn't follow redirect in URLConnection][stackoverflow-java-follow-redirect]

<!-- cross references -->

<!-- external references -->

[URL_redirection]: http://en.wikipedia.org/wiki/URL_redirection

[HttpURLConnection]: http://download.oracle.com/javase/6/docs/api/java/net/HttpURLConnection.html
[URLConnection]: http://download.oracle.com/javase/6/docs/api/java/net/URLConnection.html
[setInstanceFollowRedirects]: http://download.oracle.com/javase/6/docs/api/java/net/HttpURLConnection.html#setInstanceFollowRedirects(boolean)
[setFollowRedirects]: http://download.oracle.com/javase/6/docs/api/java/net/HttpURLConnection.html#setFollowRedirects(boolean)
[getResponseCode]: http://download.oracle.com/javase/6/docs/api/java/net/HttpURLConnection.html#getResponseCode()
[getHeaderField]: http://download.oracle.com/javase/6/docs/api/java/net/URLConnection.html#getHeaderField(java.lang.String)
[getURL]: http://download.oracle.com/javase/6/docs/api/java/net/URLConnection.html#getURL()
[getInputStream]: http://download.oracle.com/javase/6/docs/api/java/net/URLConnection.html#getInputStream()
[stackoverflow-java-find-redirected-url]: http://stackoverflow.com/questions/2659000/java-how-to-find-the-redirected-url-of-a-url/5270162#5270162
[stackoverflow-java-follow-redirect]: http://stackoverflow.com/questions/1884230/java-doesnt-follow-redirect-in-urlconnection
