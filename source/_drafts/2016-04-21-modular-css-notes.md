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

### Inline Styles

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

### BEM / SUIT



### css-modules

```jsx
import styles from './component.css';

class Component {
  render: () => {
    return {
      <div className=${styles.comp}>
      </div>
    };
  }
}
```



### 參考資料

* [CSS Modules](https://github.com/css-modules/css-modules)
* [CSSConf 2015 筆記(二) – CSS Modules](https://hsinyu00.wordpress.com/2016/02/21/cssconf-2015-%E7%AD%86%E8%A8%98%E4%BA%8C-css-modules/)
* [谈谈 CSS Modules](https://boke.io/tan-tan-css-modules/)
