flexbox 學習筆記

#### flex-grow

首先，container 必須先計算每個 item 需要的大小，這會根據每個 item 指定的 `flex-basis` 來決定。
如果未指定的話，就由傳統的 width/height, min-width/min-height 或內容大小...等來計算。

決定好基本大小需求之後，當 container 有多餘的空間時，再依照 items 的 `flex-grow` 值，決定如何將『多餘空間』按比例分配給 items。

計算方式：

1. 當 item 的 `flex-grow` 為 0 的時候，此 item 不參與分贓。
2. 然後 container 將其餘的 item 指定的 `flex-grow` 加總，再按比例配給。
  假設有 n 個 item 的 `flex-grow` 不為 0，則每個 item 分配到的大小為： 『多餘空間』* flex-grow(i) / sum(flex-grow(n))。

#### flex-shrink

相反地，若 container 擁有的空間不足以滿足基本需求之時，則依照 items 的 `flex-shrink` 值，決定如何將『不足空間』按比例由 items 榨取。

計算方式：

1. 當 item 的 `flex-shrink` 為 0 的時候，此 item 維持其要求的最小大小。
2. 然後 container 將其餘的 item 指定的 `flex-shrink` 加總，再按比例榨取。
  假設有 n 個 item 的 `flex-shrink` 不為 0，則每個 item 被奪走的大小為： 『不足空間』 * flex-shrink(i) / sum(flex-shrink(n))。

參考資料：

[flex-shrink](https://css-tricks.com/almanac/properties/f/flex-shrink/)

線上測試：

http://codepen.io/amobiz/pen/eZRYzd

```jade
.ruler
  - for (var i = 0; i <= 2000; i += 100)
    label #{i}

ul.flex-container
  li.flex-item.flex1 1
  li.flex-item.flex2 2
```

```css
/* ruler */

.ruler {
  background-color: #ffffff;
  background-image:
    linear-gradient(90deg,
      rgba(73, 73, 73, 0.5) 0,
      rgba(73, 73, 73, 0.5) 2%,
      transparent 2%
    ),
    linear-gradient(180deg,
      #ffffff 50%,
      transparent 50%
    ),
    linear-gradient(90deg,
      transparent 50%,
      rgba(73, 73, 73, 0.5) 50%,
      rgba(73, 73, 73, 0.5) 52%,
      transparent 52%
    ),
    linear-gradient(180deg,
      #ffffff 70%,
      transparent 70%
    ),
    linear-gradient(90deg,
      transparent 10%,
      rgba(73, 73, 73, 0.4) 10%,
      rgba(73, 73, 73, 0.4) 12%,
      transparent 12%,

      transparent 20%,
      rgba(73, 73, 73, 0.4) 20%,
      rgba(73, 73, 73, 0.4) 22%,
      transparent 22%,

      transparent 30%,
      rgba(73, 73, 73, 0.4) 30%,
      rgba(73, 73, 73, 0.4) 32%,
      transparent 32%,

      transparent 40%,
      rgba(73, 73, 73, 0.4) 40%,
      rgba(73, 73, 73, 0.4) 42%,
      transparent 42%,

      transparent 60%,
      rgba(73, 73, 73, 0.4) 60%,
      rgba(73, 73, 73, 0.4) 62%,
      transparent 62%,

      transparent 70%,
      rgba(73, 73, 73, 0.4) 70%,
      rgba(73, 73, 73, 0.4) 72%,
      transparent 72%,

      transparent 80%,
      rgba(73, 73, 73, 0.4) 80%,
      rgba(73, 73, 73, 0.4) 82%,
      transparent 82%,

      transparent 90%,
      rgba(73, 73, 73, 0.4) 90%,
      rgba(73, 73, 73, 0.4) 92%,
      transparent 92%
    );
  background-size: 50px 20px;
  background-repeat: repeat-x;
  min-height: 20px;

  /* only needed for labels */
  white-space:nowrap;
  font-size:0;
  margin:0;
  padding:0;
}

label {
  font-size:9px;
  padding-top:2px;
  display:inline-block;
  width:100px;
  text-indent:3px;
}

/* flex test */

.flex-container {
  padding: 0;
  margin: 0;
  list-style: none;

  display: flex;
}

.flex-item {
  background: tomato;
  padding: 10px;
  border: 5px solid red;

  color: white;
  font-weight: bold;
  font-size: 2em;
  text-align: center;
}

.flex1 { flex: 1 1 400px; }
.flex2 { flex: 2 2 400px; }
```

```js
/*
  A ruler pattern using CSS background gradients.
  + HTML for labels on every 100px

  Browser-support: IE10+ and no Opera Mini.
  (Because of CSS Gradients and CSS Repeating Gradients)

*/
var $ = require('jquery');
var $1 = $('.flex1');
var $2 = $('.flex2');

print();
$(window).resize(print);

function print() {
  _print('1: ', $1);
  _print('2: ', $2);

  function _print(label, $el) {
    var w = $el.width();
    var d = w - 400;
    d = d > 0 ? ('+ ' + d) : ('- ' + (-d));
    $el.text(label + w + ' = 400 ' + d);
  }
}
```

### 關於 flexbox container 元素內部元素的 display type

子元素的 display type 會影響到後面介紹的 `text-overflow: ellipsis` 的有效對象。

測試：

http://codepen.io/amobiz/pen/MypYdN

結論：

flexbox container 元素的直接子元素，除非它本身是 `display: flex`，否則其 `display` type 一律是 `block`。
間接子元素則完全由子元素本身決定。


### 其他問題

與 `text-overflow: ellipsis` 的配合需要注意：

#### 對於 flex 元素

1. 當 flex 元素本身指定 `text-overflow: ellipsis` 屬性時，有效對象為：
	1. flex 元素本身，
	2. 具有 `display: inline` 屬性的直接子元素，以及它們所有具有 `display: inline` 屬性的直接子元素。
 		(由於 inline 元素忽略 width 屬性，因此不論是否設定固定寬度皆同。)
2. 將 `text-overflow: ellipsis` 屬性指定給子元素，或孫元素時，有效對象為：
	1. 只有指定了 `text-overflow: ellipsis` 屬性的子元素，其具有 `inline-block` 或 `block`屬性，並且為固定寬度時有效，不論祖宗元素的 display 屬性為何。

#### 對於普通元素 (非  flex 元素)

1. 當對目標元素的直接父元素指定 `text-overflow: ellipsis` 屬性時：
	1. 只有當目標元素的 display 屬性為 `inline`，同時其直接父元素的 display 屬性為 `block` 時有效。(也就是當父元素的寬度固定時。) 與 flex 的 1.2 相同。
2. 當對目標元素指定 `text-overflow: ellipsis` 屬性時：
	1. 當目標元素的 display 屬性為 `block`，且它的直接父元素的 display 屬性為 `block` 或 `inline` (驚！為何不是 `inline-block`?) 時有效。
	2. 當目標元素的 display 屬性為 `block` 或 `inline-block，且固定寬度時有效，不論祖宗元素的 display 屬性為何。(跟 flex 的 2.1 完全相同。)

#### 結論

1. 如果要充分利用 flex 的彈性布局能力，就應該指定給 flex 元素，目標對象最好就是 flex 元素本身，如果是子元素，要確保整個 tree 都是 inline display。
2. 否則就應該直接指定給目標元素，此時不論 flex 或一般元素，規則相同：該元素必須是終點元素，具有確定的大小，同時 display 屬性必須為  `inline-block` 或 `block`。

寫了一個測試確認：

* https://jsfiddle.net/gfhca3n3/13/
<script async src="//jsfiddle.net/gfhca3n3/13/embed/html,css,result/"></script>

參考資料：

* [Bug 972664 - element with display flex box doesn't respect text-overflow ellipsis](https://bugzilla.mozilla.org/show_bug.cgi?id=972664)
* [text-overflow](https://developer.mozilla.org/zh-TW/docs/Web/CSS/text-overflow)

