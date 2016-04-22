title: "Modular CSS"
date: 2016-04-22
comments: true
category:
  - Programming
tags:
  - notes
  - css
  - modular css
  - css-modules
---
### 前言

學過網頁設計的人都知道，CSS 作用的對象，是整個 html 文件。這在過去網頁都是靜態文件為主的年代，完全是合情合理的設計，不過到現代大量 Web App 為主的 SPA 時代，這樣的特性，反而造成 Web App 開發的困擾。

這篇文章記錄個人嘗試 css-modules 過程中所遇到的問題，並且順便將各種對 modular css 的嘗試，做一個相關資訊的摘錄。

<!-- more -->

### 模組化的 CSS


#### Inline Styles

在這一兩年引起廣泛注目的 ReactJS，其引入的 JSX 語法，倡導在 JavaScript 中撰寫 html markup。更早，甚至於在發表 ReactJS 之前，其團隊就有人介紹 inline styles 的構想 (YouTube 影片找到後補上)：以 JavaScript 撰寫 CSS，從而避開 global css 的問題。

原理就是使用 JSON 語法取代 css rule，然後使用程式轉換為 css inline style，再設定給元件。譬如：

```js
head.style.cssText = 'width:200px;height:70px;display:bolck';
```

現在最受歡迎的 [radium](https://github.com/FormidableLabs/radium)，引用其 readme 介紹，用法像這樣：

```js
var Radium = require('radium');
var React = require('react');
var color = require('color');

@Radium
class Button extends React.Component {
  static propTypes = {
    kind: React.PropTypes.oneOf(['primary', 'warning']).isRequired
  };

  render() {
    // Radium extends the style attribute to accept an array. It will merge
    // the styles in order. We use this feature here to apply the primary
    // or warning styles depending on the value of the `kind` prop. Since its
    // all just JavaScript, you can use whatever logic you want to decide which
    // styles are applied (props, state, context, etc).
    return (
      <button
        style={[
          styles.base,
          styles[this.props.kind]
        ]}>
        {this.props.children}
      </button>
    );
  }
}

// You can create your style objects dynamically or share them for
// every instance of the component.
var styles = {
  base: {
    color: '#fff',

    // Adding interactive state couldn't be easier! Add a special key to your
    // style object (:hover, :focus, :active, or @media) with the additional rules.
    ':hover': {
      background: color('#0074d9').lighten(0.2).hexString()
    }
  },

  primary: {
    background: '#0074D9'
  },

  warning: {
    background: '#FF4136'
  }
};
```

雖然解決了 global css 問題，但似乎引入了更多問題：

1. 難以搭配使用前處理器，
  這應該是致命問題，至少，autoprefixer 應該已經是標準配備了吧。
2. 難以調整、除錯。
  由於 inline style 只對單一元件有效，在 Chrome DevTools 中，一次也只能改一個元件，不像平常只要修改 rule，馬上就可以套用到所有的對應元件上。

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

另外，如果認為 class 名稱太長，可以使用 [gulp-selectors](https://github.com/calebthebrewer/gulp-selectors) 這類工具，進一步做處理。不過也有不少反對意見，主要是認為[開啟 GZip 壓縮](http://stackoverflow.com/a/8067603/726650)即可，甚至也有人認為這樣會影響 SEO，但是應該是除非動到 [microformat](http://microformats.org/)，否則[沒有影響](http://webmasters.stackexchange.com/a/25477)。

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

我個人比較傾向於 [react-css-modules](https://github.com/gajus/react-css-modules) 的作法:

1. 不要衝過頭了，預設不應該是 local css

  Local css 只有在撰寫元件的時候需要用到，整個網頁還是有一些共用元素需要使用 global css。Webpack css-loader 預設開啟 local scope，會造成引用其他 framework 的 style 的極大困難。

2. 既然要用到工具來處理，既然已使用 JSX 語法，就應該一次到位，避免再寫多餘的程式碼來引用 style

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
      return <div styleName='root'>
        <a styleName='primary'>Confirm</a>
      </div>
    }
  }
  ```

注意這裡使用 `styleName` 來引用 class，同時也不再需要寫 `styles.` 部份。


#### Shadow DOM


#### Houdini


### 參考資料

* [CSS Modules](https://github.com/css-modules/css-modules)
* [BEM and SMACSS: Advice From Developers Who’ve Been There](http://www.sitepoint.com/bem-smacss-advice-from-developers/)
* [Using PostCSS with BEM and SUIT Methodologies](http://webdesign.tutsplus.com/tutorials/using-postcss-with-bem-and-suit-methodologies--cms-24592)
* [CSSConf 2015 筆記(二) – CSS Modules](https://hsinyu00.wordpress.com/2016/02/21/cssconf-2015-%E7%AD%86%E8%A8%98%E4%BA%8C-css-modules/)
* [谈谈 CSS Modules](https://boke.io/tan-tan-css-modules/)
