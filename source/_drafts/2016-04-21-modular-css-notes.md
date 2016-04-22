title: "Modular CSS 學習筆記"
date: 2016-04-21
comments: true
category:
  - Programming
tags:
  - notes
  - css
  - css-modules
---
### 前言

學過網頁設計的人都知道，CSS 作用的對象，是整個 html 文件。這在過去網頁都是靜態文件為主的年代，完全是合情合理的設計，不過現代以 Web App 為主的 SPA 時代，這樣的特性，反而造成 Web App 開發的困擾。

這篇文章只是記錄嘗試 css-modules 過程中所遇到的未解問題。

<!-- more -->

### 模組化的 CSS

css-modules 基本上是一個

#### Inline Styles

在這一兩年引起廣泛的注目 ReactJS，其引入的 JSX 語法，倡導在 JavaScript 中撰寫 html markup。更早，甚至於在發表 React 之前，其團隊就有人介紹 inline styles 的構想：以 JavaScript 撰寫 CSS，從而避開 global css 的問題。

基本作法像這樣：

```js
var styles = {
  display: 'block',
  color: '#333',
  margin: '2pt 0',
  padding: '0 2pt'
};

var el = document.querySelector('.component');
setCssStyle(el.style, styles);
```

#### OOCSS, SMACSS, BEM, SUIT

使用人為的命名方式，來區別模組名稱。

這方面的嘗試堪稱代表的有：OOCSS, SMACSS, BEM, SUIT，其中又以 BEM 及 SUIT 最受到歡迎。許多人認為 SUIT 是 BEM 的改良，而其語法除了 camel case 較不討喜之外，相對於 BEM 使用 `__` 及 `--` 來區別層級更容易理解。

採用命名規範來處理 css 的模組化問題，最重要的守則，就是：

{% blockquote https://medium.com/seek-ui-engineering/block-element-modifying-your-javascript-components-d7f99fcab52b#.lc19hxlo7 Block, Element, Modifying Your JavaScript Components %}
Blocks should only be used inside a component of the same name.
{% endblockquote %}

『最上層區塊的命名必須與元件同名，並且其下的子元素，只能用在元件內部。』

採用這些方案的好處是，由於是 100% 原生的 CSS 語法，因此有以下優點:

1. 不須要任何前處理器工具，導入、除錯最容易，
2. 可以輕易與既有的前處理器工具搭配，
3. 可以避免使用巢狀的選擇器，提昇效能，並且避免結構依賴問題。

上面第二項，譬如可以使用 PostCSS 外掛 [`postcss-bem`](https://github.com/ileri/postcss-bem)，就可以使用巢狀的宣告方式，省卻繁複的名稱重複撰寫問題，輕鬆撰寫符合 SUIT 規範的 CSS：

```css
@namespace app {
  @component SearchForm {
    padding: 0;
    margin: 0;

    /* Typically, place modifiers above descendents */
    @modifier advanced {
      padding: 1rem;
    }

    @descendent textField {
      border: 1px solid #ccc;

      /* This creates a state for the textField descendant */
      @when invalid {
        border: 1px solid red;
      }
    }
  }
}
```

可以輸出：

```css
.app-SearchForm {
  padding: 0;
  margin: 0;
}

.app-SearchForm--advanced {
  padding: 1rem;
}

.app-SearchForm-textField {
  border: 1px solid #ccc;
}

.app-SearchForm-textField.is-invalid {
  border: 1px solid red;
}
```

每個輸出的 class，都將直接對應到目標元件上，從而避免使用巢狀的選擇器：

```html
<form name="search" class="app-SearchForm">
  <input name="name" class="app-SearchForm-textField" required></input>
</form>
```

不過，我覺得很奇怪，可能是我自己閱讀的還不夠多，好像很少看到有人提到/抱怨，目前還缺乏 markup 處理工具，幫忙將同樣的結果套用到 html 上。目前只能手動將最終的名稱寫到 html 上，仍然相當不方便，而且容易出錯。雖然有 [postcss-bem-linter](https://github.com/postcss/postcss-bem-linter) 來幫忙檢查 css 是否符合 BEM/SUIT 規範，卻沒有工具可以用來檢查 html。

#### css-modules

Css-modules 的作者 [Mark Dalgleish](https://github.com/markdalgleish)，在他的 [The End of Global CSS](https://medium.com/seek-ui-engineering/the-end-of-global-css-90d2a4a06284#.muzqdfjs7) 一文中提到，利用 Webpack 的 localscope 功能，實作出
基本的使用方式如下：

```css
.root {
}

.primary {
}
```

```jsx
import styles from './dialog.css';

export default class Dialog extends React.Component {
  render() {
    return <div className={styles.root}>
      <a className={styles.primary}>Confirm</a>
    </div>
  }
}
```

#### Shadow DOM

### 參考資料

* [CSS Modules](https://github.com/css-modules/css-modules)
* [BEM and SMACSS: Advice From Developers Who’ve Been There](http://www.sitepoint.com/bem-smacss-advice-from-developers/)
* [Using PostCSS with BEM and SUIT Methodologies](http://webdesign.tutsplus.com/tutorials/using-postcss-with-bem-and-suit-methodologies--cms-24592)
* [CSSConf 2015 筆記(二) – CSS Modules](https://hsinyu00.wordpress.com/2016/02/21/cssconf-2015-%E7%AD%86%E8%A8%98%E4%BA%8C-css-modules/)
* [谈谈 CSS Modules](https://boke.io/tan-tan-css-modules/)
