# angular-material 遇到雷

本文記錄 angular material 的程式錯誤，不定期更新。

我將整合了 [angular-material](https://github.com/angular/material) 的 [NG6-starter](https://github.com/AngularClass/NG6-starter) 專案的核心部份整理在這裡：[NG6-starter fork](https://github.com/amobiz/NG6-starter)，請自取。

該專案所做的變動如下：

* 將 [stylus](https://github.com/stylus/stylus) 取代為 [PostCSS](https://github.com/postcss/postcss)，
* 整合 [angular-material](https://github.com/angular/material)，
* 套用 [Angular Material-Start (ES6 Tutorials)](https://github.com/angular/material-start/tree/es6) 的主架構。

<!-- more -->

## 觀察

1. 程式碼竟然沒有一致的 coding style，顯然沒有強制做 lint/jscs。
  (確認。在 gulp 的 [`buildJs()`](https://github.com/angular/material/blob/master/gulp/util.js) 函數中沒有執行 jshint task。)
2. 專案的雷真的很多，竟然有 1475 個 issue (2016/03/04)、(1512 - 2016/03/13)。

## 問題

### (2016/xx/xx) ()

#### 問題描述
#### 問題原因
#### 解決方式
#### 參考資訊

### (2016/05/13) ($mdThemingProvider)

#### 問題描述

Angular-material 的 $mdThemingProvider 會在執行期間動態插入許多 style 標籤，該標籤具有 `md-theme-style` 屬性。

#### 問題原因

(經過友人的提醒我才知道有這個問題。之前很少點開 head 部份檢視，頂多是查看 Webpack 產生出來的靜態檔案，所以一直沒有發現。以後一定要全盤檢視所有的部份才行。)

[src/core/services/theming/theming.js#generateTheme()](https://github.com/angular/material/blob/61b742ef353f355e30e014114e7b22c9986d149b/src/core/services/theming/theming.js#L624) 這段程式碼動態插入 style 標籤。

#### 解決方式

官方有考慮未來改為只插入一個 tag。目前除了直接修改 material 的 source 外 (恐怕是大工程)，似乎還無解。

#### 參考資訊

* [WP - Performance issue (found something)](https://github.com/angular/material/issues/8218#issuecomment-214717578)

### (2016/04/22) ($mdIconProvider, md-svg-icon)

#### 問題描述

使用 `md-svg-icon` 透過 $mdIconProvider 以 id 引用的 icon，若實際為 Data URL 在 Safari 下不顯示。

#### 問題原因

程式錯誤。在 [src/components/icon/js/iconService.js](https://github.com/angular/material/blob/master/src/components/icon/js/iconService.js) 中未正確區分 data url 與真正的 url，導致 ajax 失敗，而未能正確注入 svg icon。(蠻奇怪的是似乎只有 Safari 瀏覽器有這個問題。一度以為是 Safari [不支援 inline svg](https://techxplorer.com/2015/05/on-safari-with-inline-svg/) 的問題。)

#### 解決方式

官方已修正： [fix(icon): Allow using data URLs](https://github.com/angular/material/commit/bebd07c505fd78e01335916d603f0afebc82e61d)，升級到 v1.0.7 版以上即可。

### (2016/03/12) (md-sidenav)

#### 問題描述

Sidenav 開啟時，畫面捲動；點擊 Sidenav 上的 button 時，focus 行為異常，有時候 focus 會停留在上次的 focus 元件，有時候會成為 sidenav 本身，多數時候會造成畫面捲動。

#### 問題原因

問題在於 sidenav 對 isOpen 的偵測：在 `updateIsOpen(isOpen)` 函數中，使用 `＄watch()` 的方式，偵測 sidenav 是否開啟，並且利用 promise，異步設定 focus() 到由 `md-autofocus` 或 `md-sidenav-focus` 指定的元件，或 sidenav 本身。

理論上應該 `isOpen` 有變動的時候才會執行對應行為，但實際上每個 `$digest` 週期都會檢查；特別是在 focus 變動的時候，由於使用異步設定 focus()，造成已經取得 focus 的元件又失去 focus，並且由於 focus 的移轉，browser 試圖將取得  focus 的元件，捲動到 viewport 可視區，而造成畫面捲動。

#### 解決方式

關閉 sidenav 對 isOpen 的偵測：

在 angular-meterial/angular-material, line 15349, (或者 angular-meterial/angular-material/modules/js/sidenav.js, [line 267](https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js#L261))，在 `postLink(isOpen)` 函數中，註解掉這一行：

```js
scope.$watch('isOpen', updateIsOpen);
```

缺點是 sidenav 打開之後，將不會自動取得 focus。

#### 參考資訊

* [mdSelect causes pages to jump #7273](https://github.com/angular/material/issues/7273)
* [element.focus() in $mdSidenav causes page jump #1891](https://github.com/angular/material/issues/1891)


### (2016/03/04) (md-menu)

#### 問題描述

Console 出現 "Cannot read property 'setAttribute' of null" 錯誤訊息。

#### 問題原因

如我在該 issue 的 comment 所言，我遇到的問題是 `md-menu` 內部沒有任何元件具有 `ng-click` 或 `ng-mouseenter` 屬性，
所以在  [material/src/components/menu/js/menuController.js](https://github.com/angular/material/blob/b58343c20ac4bd3418629c29abddfe3ac3840eb5/src/components/menu/js/menuController.js#L26-L27) Lines 26-27:

```js
triggerElement = $element[0].querySelector('[ng-click],[ng-mouseenter]');
triggerElement.setAttribute('aria-expanded', 'false');
```
在第 26 行 `querySelector()` 失敗，導致第 27 行 `triggerElement` 為 null。應該要檢查 `querySelector()` 的結果才對。

##### 後記

這個問題，我在 2016/03/04 在既有的 issue 上留言，3/16 終於被 material team 注意到，標示為 `P0 - Critical Fixes`，並指定 owner 之後，到 4/8 為止，仍然沒有修正。
雖然其實可以很簡單避開這個問題，所以影響不大。但是，這麼簡單的問題，還被標示為 `P0 - Critical Fixes`，卻可以拖這麼久還不能解決，不禁讓人為 angular/material 感到憂心。

#### 解決方式

確認在 `md-menu` 元件內部，至少有一個元件具有 `ng-click` 或 `ng-mouseenter` 屬性。

#### 參考資訊

* [Cannot read property 'setAttribute' of null when clicking on 'menu' when using `data-ng-click="$mdOpenMenu()"`](https://github.com/angular/material/issues/3258#issuecomment-191914766)

### (2016/03/04) (md-menu)

#### 問題描述

Menu 開啟後 (dropdown)，整個程式沒有反應。

#### 問題原因

這其實是 cssnano 的問題，因為 angular-material 開啟的 menu 元件為 `.md-open-menu-container`，設定的 `z-index` 是 100，
而為了能在點擊 menu 外部時關閉 menu，所以底下會有一個覆蓋整個 viewport 的 `.md-scroll-mask` 元件，其 `z-index` 為 50，不過這是直接設定在元件上，而不是使用 css stylesheet 控制。
cssnano 最佳化時，會將程式用到的所有的 `z-index` 排序，然後重新設定較小的值。因此， `.md-open-menu-container` 的 `z-index` 就變成小於 `.md-scroll-mask` 的 50，於是 `.md-scroll-mask` 截收了所有的 mouse click 事件，導致整個應用程式無法回應。

如果  angular-material 將 `.md-scroll-mask` 的 `z-index` 也定義在 css stylesheet 中，而不是直接寫入元件 inline style 中，就不會有這個問題。如果 cssnano 預設不啟用 `z-index` 最佳化，也不會有這個問題。

#### 解決方式

由於 cssnano 要到 [4.0 版才會修正這個問題](https://github.com/ben-eb/gulp-cssnano/issues/8#issuecomment-191239110)，目前只能先關閉 cssnano 的 `z-index` 最佳化：

```js
postcss([
    require('cssnano')({ zindex: false });
])
```

#### 參考資訊

* [This plugin change z-index!](https://github.com/ben-eb/gulp-cssnano/issues/8)
* [Disable unsafe rules by default](https://github.com/ben-eb/cssnano/issues/28)

## 結論

基本上還算穩定，但是要使用的話，要有自己解決問題的心理準備，因此不建議 angularjs 及 css 初學者使用。


