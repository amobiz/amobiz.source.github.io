# angular-material 遇到雷

感覺是 Google 的二軍負責開發，竟然有 1475 個 issue (2016/03/04)。

### console 出現 "Cannot read property 'setAttribute' of null" 錯誤訊息

如我的 comment 所言，我遇到的問題是 md-menu 內部沒有任何元件具有 `ng-click` 或 `ng-mouseenter` 屬性，
所以在  [material/src/components/menu/js/menuController.js](https://github.com/angular/material/blob/b58343c20ac4bd3418629c29abddfe3ac3840eb5/src/components/menu/js/menuController.js#L26-L27) Lines 26-27:

```js
triggerElement = $element[0].querySelector('[ng-click],[ng-mouseenter]');
triggerElement.setAttribute('aria-expanded', 'false');
```
在第 26 行 querySelector() 失敗，導致第 27 行 `triggerElement` 為 null。angular-material 應該要檢查 querySelector() 的結果才對。

參考資訊：
[Cannot read property 'setAttribute' of null when clicking on 'menu' when using `data-ng-click="$mdOpenMenu()"`](https://github.com/angular/material/issues/3258#issuecomment-191914766)

### md-menu 開啟後沒有反應

這其實是 cssnano 的問題，因為 angular-material 開啟的 menu 元件為 `.md-open-menu-container`，設定的 z-index 是 100，
而為了能在點擊 menu 外部時關閉 menu，所以底下會有一個覆蓋整個 viewport 的 `.md-scroll-mask` 元件，其 z-index 為 50，不過這是直接設定在元件上，而不是使用 css stylesheet 控制。
cssnano 最佳化時，會將程式用到的所有的 z-index 排序，然後重新設定較小的值。因此， `.md-open-menu-container` 的 z-index 就變成小於 `.md-scroll-mask` 的 50，於是 `.md-scroll-mask` 截收了所有的 mouse click 事件，導致整個應用程式無法回應。

如果  angular-material 將 `.md-scroll-mask` 的 z-index 也定義在 css stylesheet 中，而不是直接寫入元件 inline style 中，就不會有這個問題。如果 cssnano 預設不啟用 z-index 最佳化，也不會有這個問題。

解決方式，關閉 z-index 最佳化：

```js
postcss([
    require('cssnano')({ zindex: false });
])
```




