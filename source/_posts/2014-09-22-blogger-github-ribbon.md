title: '在 Blogger 上顯示 GitHub Ribbon'
date: 2014-09-22 00:55:48
comments: true
categories: 
tags:
  - Blogger
  - GitHub
  - Howto
---
[
  ![](https://unsplash.imgix.net/3/alejandroescamilla-tenedores.jpg?q=75&fm=jpg&auto=format&s=927ccb71c1941511657cd27823e96129)
](https://unsplash.com/)

{% cheatsheet 異動說明 %}
由於部落格已經改用 [GitHub Pages](https://pages.github.com/) 並搬家到 [這裡](/)。本文提到的 [GitHub Ribbons](https://github.com/blog/273-github-ribbons) 的部份，依然對所有的部落格平台有效，但 __本文提到的 [Google Blogger](http://www.blogger.com/) 的操作部份，僅對於使用 Blogger 的朋友有效__。
{% endcheatsheet %}

首先，到 [GitHub Ribbons] 挑選喜歡的配色，抄下其中 `src` 及 `data-canonical-src` (非必要) 屬性。

在 [Google Blogger][Blogger] 部落格的「版面配置」中，捲動到最後面，找到「新增小工具」，確認它是在「網誌文章」的後面，點選後，選擇「HTML/JavaScript」，然後插入下面程式碼：

<!-- more -->
<!-- forkme https://gist.github.com/amobiz/0c74f9c72bde9afd1780 -->

<!-- github.ribbon -->
<!-- gist inno-v/7b440e836f879e7348a0 -->
{% gist amobiz/0c74f9c72bde9afd1780 %}

{% element id:source class:hidden %}
```
<script>
//<![CDATA[
/* Add GitHub Ribbons */
(function(options) {
  var el, href, pos;

  if (location.pathname==='/') {
    href = options.home;
  }
  else {
    el = document.querySelector('*[data-forkme]');
    if (el) {
      href = el.getAttribute('data-forkme');
    }
  }
  pos = options.position || 'right';
  if (href) {
    el = document.createElement('div');
    el.innerHTML = '<a href="' + href + '"><img style="display: block; position: fixed; top: 0; ' + pos + ': 0; border: 0; background:none; border-radius:0; box-shadow:none; padding:0; z-index: 9999;" src="' + options.src + '" alt="Fork me on GitHub" data-canonical-src="' + options.canonicalSrc + '"></a>';
    el.style.cssText = 'padding:0; margin:0; background-color:none;';
    document.body.appendChild(el);
  }
})({
  home: 'https://github.com/amobiz',
  src: 'https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67',
  canonicalSrc: 'https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png',
  position: 'right'
});
//]]>
</script>
```
{% endelement %}

記得將最後面的 `home` 改為你自己的 GitHub 的個人頁面，並且分別填入剛剛抄下的 `src` 和 `data-canonical-src` 到 `src` 及 `canonicalSrc` 屬性中。彩帶預設放在右邊，如果挑選的彩帶必須放在左邊，則要加上 `position: 'left'` 屬性。

這樣設定之後，在部落格的首頁就會出現「Fork me on GitHub」的彩帶，點擊後會連到你的 GitHub 個人首頁。

預設在文章中不顯示彩帶。若要在文章中連到個人首頁或特定的專案，只要在文章的任意 HTML 標籤中，埋入 `data-forkme` 屬性，即可顯示彩帶：

``` html
<div data-forkme="https://github.com/amobiz/lazy-umd.js"></div>
```

### 參考資料:

* [GitHub Ribbons]
* [Fork me on GitHub CSS ribbon][github-fork-ribbon-css]
* [Pure CSS responsive Fork me on GitHub ribbon][css-fork-on-github-ribbon] 

<!-- cross references -->


<!-- external references -->

[Blogger]: http://www.blogger.com/
[GitHub Pages]: https://pages.github.com/
[GitHub Ribbons]: https://github.com/blog/273-github-ribbons
[github-fork-ribbon-css]: https://github.com/simonwhitaker/github-fork-ribbon-css "Fork me on GitHub CSS ribbon"
[css-fork-on-github-ribbon]: https://codepo8.github.io/css-fork-on-github-ribbon/ "Pure CSS responsive Fork me on GitHub ribbon"