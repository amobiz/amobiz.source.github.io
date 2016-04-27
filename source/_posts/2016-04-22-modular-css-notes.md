title: "Modular CSS"
date: 2016-04-22 22:42:00
comments: true
toc: true
category:
  - Programming
tags:
  - css
  - css-modules
  - modular css
  - Web Components
  - Shadow DOM
  - BEM
  - SUIT
  - Webpack
---
{% credit credit:"Sweet Ice Cream Photography" link:"https://unsplash.com/sweeticecreamphotography"	desc:"意象說明<br><br>模組化 < 封裝 < 與世隔絕 < 受困於小船<br>絕佳搭配 < 天作之合 < 俊男美女" %}
![](https://images.unsplash.com/photo-1460750860062-82a52139a0d6?crop=entropy&fit=crop&fm=jpg&h=975&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1000)
{% endcredit %}

## 前言

這篇文章記錄個人嘗試 css-modules 過程中所遇到的問題，並且順便將目前業界各種對 modular css 的嘗試/進展，做一個相關資訊的摘錄。

還沒有找到適合自己偏好作法的讀者，可以將此文視為簡單的[技術選型](http://www.gegugu.com/2016/01/11/20196.html)指南，從中挑選適合自己的作法。

<!-- more -->

## 模組化的 CSS

學過網頁設計的人都知道，CSS 作用的對象，是整個 html 文件。這在過去網頁都是靜態文件為主的年代，完全是合情合理的設計，不過到現代大量 Web App 為主的 SPA 時代，這樣的特性，反而造成 Web App 開發的困擾。而 CSS 規格的發展，又遠遠落後於 JavaScript / HTML5 的發展，因此，出現了各種不同的模組化嘗試。

### Inline Styles

在這一兩年引起廣泛注目的 ReactJS，其引入的 JSX 語法，倡導在 JavaScript 中撰寫 html markup。更早，甚至於在發表 ReactJS 之前，其團隊就有人介紹 inline styles 的構想 (YouTube 影片找到後補上)：以 JavaScript 撰寫 CSS，從而避開 global scope 的問題。

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
    // or warning styles depending on the value of the kind prop. Since its
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

    // Adding interactive state couldn’t be easier! Add a special key to your
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

雖然解決了 global scope 問題，但似乎引入了更多問題：

1. 難以搭配使用前處理器，

	這應該是致命問題，至少，autoprefixer 應該已經是標準配備了吧。

2. 難以調整、除錯。

	由於 inline style 只對單一元件有效，在 Chrome DevTools 中，一次也只能改一個元件，不像平常只要修改 rule，馬上就可以套用到所有的對應元件上。


### Naming Conventions

使用人為的命名規範方式，來區別模組名稱。

這方面的嘗試堪稱代表的有：[OOCSS](http://oocss.org/), [SMACSS](https://smacss.com/), [BEM](https://en.bem.info/), [SUIT](https://suitcss.github.io/)，其中又以 BEM 及 SUIT 最受到歡迎。許多人認為 SUIT 是 BEM 的改良，而其語法除了 camelCase 較不討喜之外，相對於 BEM 使用 `__` 及 `--` 來區別層級，SUIT 的語法更容易理解。

採用命名規範來處理 css 的模組化問題，最重要的守則，就是：

{% cheatsheet %}

Blocks should only be used inside a component of the same name.

『最上層區塊的命名必須與元件同名，並且其下的子元素，只能用在元件內部。』

---– [Block, Element, Modifying Your JavaScript Components](https://medium.com/seek-ui-engineering/block-element-modifying-your-javascript-components-d7f99fcab52b#.lc19hxlo7)
{% endcheatsheet %}

採用這些方案的好處是，由於是 100% 原生的 CSS 語法，因此有以下優點:

1. 不須要任何前處理器工具，導入、除錯最容易，
2. 可以輕易與既有的前處理器工具搭配，
3. 可以避免使用巢狀的選擇器，提昇效能，並且避免結構依賴問題。

上面第二項，譬如可以使用 [PostCSS](https://github.com/postcss/postcss) 外掛 [postcss-bem](https://github.com/ileri/postcss-bem)，就可以使用巢狀的宣告方式，省卻繁複的名稱重複撰寫問題，輕鬆撰寫符合 SUIT 規範的 CSS：

```less
@namespace app {
  @component SearchForm {
    padding: 0;
    margin: 0;

    // Typically, place modifiers above descendents
    @modifier advanced {
      padding: 1rem;
    }

    @descendent textField {
      border: 1px solid #ccc;

      // This creates a state for the textField descendant
      @when invalid {
        border: 1px solid red;
      }
    }
  }
}
```

輸出：

```css
.app-SearchForm {
  padding: 0;
  margin: 0;
}

.app-SearchForm–advanced {
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
<form name=“search” class=“app-SearchForm”>
  <input name=“name” class=“app-SearchForm-textField” required></input>
</form>
```

缺點：

1. 仍然是 global scope

	雖然稍後會介紹的 css-modules 基本上也是 global scope，不過相較於 css-modules，BEM/SUIT 不小心出現重複命名的機會還是比較高，不過，當然這可以透過下面提到的 linter 來避免。

2. 手動處理容易出錯

	我一直覺得很奇怪，可能是我自己閱讀的還不夠多，好像很少看到有人提到/抱怨，目前還缺乏 markup 處理工具，幫忙將同樣的結果套用到 html 上。雖然有 [postcss-bem](https://github.com/ileri/postcss-bem) 幫忙處理 css 部份，但目前只能手動將最終的名稱套用到 html 上，仍然相當不方便，而且容易出錯。雖然有 [postcss-bem-linter](https://github.com/postcss/postcss-bem-linter) 來幫忙檢查 css 是否符合 BEM/SUIT 規範，卻沒有工具可以用來檢查 html。

3. 名稱太長

	如果認為 class 名稱太長，可以使用 [gulp-selectors](https://github.com/calebthebrewer/gulp-selectors) 這類工具，進一步做處理。不過也有不少反對意見，主要是認為[開啟 GZip 壓縮](http://stackoverflow.com/a/8067603/726650)即可，甚至也有人認為這樣會影響 SEO，但是應該是除非動到 [microformat](http://microformats.org/)，否則[沒有影響](http://webmasters.stackexchange.com/a/25477)。


### Css-modules

[Css-modules](https://github.com/css-modules/css-modules) 基本上只是一個規格，描述使用 `:local` 與 `:global` 關鍵字來區別 scope；使用 `composes` 關鍵字來引用其它規則。

Css-modules 的作者 [Mark Dalgleish](https://github.com/markdalgleish)，在他的 [The End of Global CSS](https://medium.com/seek-ui-engineering/the-end-of-global-css-90d2a4a06284#.muzqdfjs7) 一文中提到，利用 Webpack 在 [2015/04/22 發佈](https://github.com/webpack/css-loader/commit/d2c9c25721a711b0fe041c597b43646e82d9f145)的 [local scope](https://github.com/webpack/css-loader#local-scope) 功能，我們可以透過 `:local(.className)` 的語法，得到轉化之後的 class 名稱：

__MyComponent.css__

```css
:local(.foo) {
  color: red;
}
:local(.bar) {
  color: blue;
}
```

__MyComponent.jsx__

```jsx
import styles from './MyComponent.css';
import React, { Component } from 'react';
export default class MyComponent extends Component {
  render() {
    return (
      <div>
        <div className={styles.foo}>Foo</div>
        <div className={styles.bar}>Bar</div>
      </div>
    );
  }
}
```

上面 import 得到的 `styles`，實際上是一個 JSON 物件，內容是透過 `:local()` 定義的 class 名稱做為鍵值，對應到計算處理過、保證不重複的亂數名稱數值，像這樣：

```json
{
  "foo": "_1rJwx92-gmbvaLiDdzgXiJ",
  "bar": "_13LGdX8RMStbBE9w-t0gZ1"
}
```

然後再利用插入字串的方式，將產出的 class 名稱，注入到 template 中，而達成某種程度隱藏 class 名稱，避免名稱污染問題。不過雖然 class 名稱已經處理過，基本上卻仍然是全域可見。

Mark Dalgleish 認為，一直不斷地重複寫 `:local` 太麻煩了，大多時候他都是使用 local scope，僅有極少數時候，才需要用到 global scope，所以後來 css-loader 就同意預設為 local scope 了：

```css
.root {
}

.primary {
}
```

上面透過 `styles.foo` 的方式，手動以插值的方式注入 class 名稱的作法，還是比較繁瑣。我個人比較傾向於 [react-css-modules](https://github.com/gajus/react-css-modules) 的作法，既然要用到工具來處理，既然已經使用 JSX 語法，就應該一次到位，避免再寫多餘的程式碼來引用 style：

__dialog.css__

```css
.root {
}

.primary {
}
```

__dialog.jsx__

```jsx
import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './dialog.css';

@CSSModules(styles)
export default class Dialog extends React.Component {
  render() {
    return <div styleName='root'>
      <a styleName='primary'>Confirm</a>
    </div>
  }
}
```

注意這裡使用 `styleName` 來引用 class，同時也不再需要寫 `styles.` 部份。另外，react-css-modules 還做了檢查，若引用的 class 不存在，會提出警告。

一切都非常美好。

而我個人碰到的問題則是：

1. 與 PostCSS 搭配的取捨

	原有的專案採用 PostCSS 及 cssnext 外掛，尤其是用到了 [nesting](https://github.com/jonathantneal/postcss-nesting) 功能，在與 css-loader 搭配上，遇到了『雞生蛋、蛋生雞』問題，無法正確設定套用的順序。目前只能先停用遇到問題的語法。

2. 預設 local scope

	我認為 css-loader 衝過頭了，預設不應該是 local scope，__Local scope 只有在撰寫元件的時候需要用到__。整個網頁還是有許多共用元素需要使用 global scope css。Webpack css-loader 預設開啟 local scope，會造成引用其他 framework 的 style 的極大困難。

	譬如，無法使用這樣的語法來引用 global style：

	```
	:global {
 		@import 'normalize.css';
	}
	```

	其實我個人傾向於希望能夠在要使用 local scope 時，才以 `:local` block 的方式啟用：

	```css
	:local {
		.root {
		}

		.primary {
		}
	}
	```

	這樣就不會影響到既有的程式。

	可惜 css-loader 只能透過 `modules` 參數啟動，否則就完全不支援 local scope。因此，目前這個問題只能透過針對不同路徑套用不同的 css-loader 的方式解決：

	__webpack.config.js__

	```js
	module: {
		loaders: [{
			test: /.jsx?$/,
			loader: 'babel'
		}, {
			test: /.css$/,
			exclude: path.resolve(dirname, 'client'),
			loader: 'style!css?modules&localIdentName=[name][local]'
		}, {
			test: /.css$/,
			include: path.resolve(__dirname, 'node_modules'),
			loader: 'style!css'
		}]
	}
	```

3. Webpack + ReactJS 以外的選擇？

由於目前 css-modules 的實作，主要還是基於 Webpack 的 css-loader。而 Webpack 的思維，是以 JavaScript 為核心，透過 `require()` 函數來描述相關資源的關係，剛好與 ReactJS 的 JSX 的作法相同，兩者可說是天作之合。然而，明明要套用 class 的對象是 html/template，卻必須勞動 JavaScript 在__執行期間__來處理，似乎不是那麼經濟。

雖然 [Browserify](https://github.com/substack/node-browserify) 有 [css-modulesify](https://github.com/css-modules/css-modulesify)，但 Browserify 其實是更加以 JavaScript 為中心，因此採用的是與 css-loader 完全相同的作法。

我個人傾向於，工具應該要能夠在前處理期間就做好這些轉換工作，最終的 css 和 html template 都能直接處理好 local class 名稱對應，在 JavaScript 中，只要直接引用 template 即可。

輸入：

__dialog.css__

```css
.root {
}

.primary {
}
```

__dialog.html__

```html
<link href="./dialog.css" rel="stylesheet" type="text/localcss" />

<div class="root">
  <a class="primary">Confirm</a>
</div>
```

輸出：

__dialog.html__

```html
<style type=“text/css”>
.root1rJwx92-gmbvaLiDdzgXiJ {
}

.primary13LGdX8RMStbBE9w-t0gZ1 {
}
</style>

<div class="root1rJwx92-gmbvaLiDdzgXiJ">
  <a class="primary13LGdX8RMStbBE9w-t0gZ1">Confirm</a>
</div>
```

當然，這只是目前實作的問題，css-modules 規範本身，除了預設為 local scope 值得商榷之外，並沒有太大的問題。

[CSS Modules 详解及 React 中实践](http://zhuanlan.zhihu.com/p/20495964) 這篇文章有相當深入精闢的技術解說，想進一步了解 css-modules 的朋友千萬不要錯過。

### Web Components / Shadow DOM

[Shadow DOM](https://www.w3.org/TR/2015/WD-shadow-dom-20151215/) 是 [Web Components](http://webcomponents.org/) 的附屬規格，目前仍在草案階段，瀏覽器的支援也許還不足，但是實際上已經有相當多成熟的實作。最好的例子就是 [Polymer](https://www.polymer-project.org/1.0/)，已經正式發表 1.0 版，而 AngularJS 2.0 也即將正式發佈。即使不使用 framework，也可以直接透過 [polyfill](https://github.com/webcomponents/webcomponentsjs/) 使用。

重點是，在 Shadow DOM 中，不論 markup 或 style，都是私有的，外界只能看到最外層的元件。換句話說，對 Shadow DOM 而言，CSS 就是 local scope 的！

使用 Polymer 定義元件的範例：

__contact-card.html___

```html
<dom-module id="contact-card">
  <link rel="import" type="css" href="contact-card.css">
  <template>
    <content></content>
    <iron-icon icon="star" hidden$="{{!starred}}"></iron-icon>
  </template>
  <script>
    Polymer({
      is: 'contact-card',
      properties: {
        starred: Boolean
      }
    });
  </script>
</dom-module>
```

使用方式：

__index.html__

```html
<contact-card starred>
  <img src="profile.jpg" alt="Eric's photo">
  <span>Eric Bidelman</span>
</contact-card>
```

使用 AngularJS 2.0 定義元件的的範例：

```js
import { Component } from 'angular2/core';

@Component({
  selector: 'contact-card',
  templateUrl: 'components/contact.component.html',
  styleUrls:  ['components/contact.component.css']
})
export default class ConcatCard {
}
```

就是這麼簡單。即使是使用 polyfill，它也會幫忙處理好 CSS scope 問題 (雖然無法真正隱藏)。只是，又回到在執行期間處理轉換的問題。

<p style="color: #fff">這或許是我選擇 AngularJS 2.0，而不是跟流行採用 ReactJS 的原因之一吧。</p>


### Houdini

[Houdini: Maybe The Most Exciting Development In CSS You've Never Heard Of](https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/)， 脫逃大師胡迪尼，將為我們在瀏覽器上面留下隱密的後門、看不見的掛勾，讓我們可以在最千鈞一髮的時刻全身而退。

這方面的資訊雖然還不多，不過，如同上文作者所言，這將發生在不久的將來。屆時一旦 [CSS PARSER API](https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/#css-parser-api) 完成，要添加客製化的 local scope 語法，應該不是難事。

## 結論

若專案選擇使用 ReactJS/JSX，得力於 [react-css-modules](https://github.com/gajus/react-css-modules) 及 [Webpack](https://webpack.github.io/) 的功勞，可以使用直覺的語法，不用放棄慣用的前處理器，就可以享用 css-modules 的好處。

若是喜歡追求業界標準，可以考慮直接採用 Web Components/Shadow DOM，或是架構在此基礎之上的 framework 來實作。

如果不想把專案的建構搞得太複雜，則可以考慮最通用的 BEM/SUIT 命名規範方案。

## 參考資料

* [CSS Modules](https://github.com/css-modules/css-modules)
* [BEM and SMACSS: Advice From Developers Who’ve Been There](http://www.sitepoint.com/bem-smacss-advice-from-developers/)
* [Using PostCSS with BEM and SUIT Methodologies](http://webdesign.tutsplus.com/tutorials/using-postcss-with-bem-and-suit-methodologies--cms-24592)
* [CSSConf 2015 筆記(二) – CSS Modules](https://hsinyu00.wordpress.com/2016/02/21/cssconf-2015-%E7%AD%86%E8%A8%98%E4%BA%8C-css-modules/)
* [谈谈 CSS Modules](https://boke.io/tan-tan-css-modules/)
* [CSS Modules 详解及 React 中实践](http://zhuanlan.zhihu.com/p/20495964)

