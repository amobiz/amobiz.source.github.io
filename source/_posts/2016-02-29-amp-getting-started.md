title: "AMP - Getting Started"
date: 2016-02-29 04:45:55
comments: true
category:
  - Web Design
tags:
	- AMP
	- Tutorial
	- Google
---
[
![](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&fit=crop&fm=jpg&h=975&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1900)
](https://unsplash.com/helloquence)

## 創建符合 AMP 規範的頁面

前文提到，AMP HTML 及 AMP JS 對 HTML 的可用元素做了部份限制及加強，在實際開發 AMP 頁面之前，就讓我們先來看看有哪些限制。

## AMP HTML 及 AMP JS 規範

1. style
	1. 必須以 `<style amp-custom></style>` 標籤直接內含在 html `<head>` 中，且只能有一個。
	2. 不可連接外部檔案 (除了 custom font 之外)。
	3. 不允許 inline style (在元素中的 style)(因為 inline style 相較於 selector style 有較高的優先權，這會妨害到 layout 的計算)。
	4. 禁用多數的動畫效果。目前僅允許 `opacity`, `transform`。
	5. 禁用捲軸： `overflow` 屬性 (及附屬的 `overflow-y`, `overflow-x`) 不可使用 `“auto”` 或 `“scroll”`。
	6. 禁用 !important 修飾字。
	7. 禁用 * selector。
	8. 禁用 :not() selector。
	9. Pseudo-selectors, pseudo-classes, 及 pseudo-elements 只能用在標籤 (tag) 元素上，且不能是 AMP 元件 (amp-*)。
	10. 不可使用 -amp- class 及 i-amp- 標籤 (tag) 元素。
	11. 不可使用 behavior, -moz-binding 屬性 (安全考量)。
	12. 不可使用 filter 屬性 (效能考量)。
   
2. img
	1. 必須使用 `<amp-img></amp-img>` 標籤引用。
	2. 必須固定大小，即需要指定 `width` 及 `height` 屬性。

3. iframe
	1. 必須使用 `<amp-iframe>` 引用,  
	2. 須加入 `<script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"></script>` )
	3. 必須固定大小，即需要指定 `width` 及 `height` 屬性。
	4. 必須距離首頁的頂點(top) 600px 或 75% 以上。
	5. 必須使用 HTTPS 引用網頁，除非禁用 `allow-same-origin`，否則該網頁不可與原始網頁位於相同 domain。


