title: "ReactJS 15 學習筆記"
date: 2016-05-04 20:03:00
comments: true
category:
  - Programming
tags:
  - notes
  - ReactJS
---

本文假設讀者已經了解基本的繼承、箭號運算式等 ES6 語法，不過即使不熟悉，只要有基本的物件導向觀念，就不會妨礙到對範例的理解。

<!-- more -->

{% toggle when:advanced on:"詳細說明：開啟" off:"詳細說明：關閉" default:off %}

{% condition when:advanced %}
### 關於其他資源

React 最新版本已經是 15 了，建議由官方的 [Getting Started](https://facebook.github.io/react/docs/getting-started.html) 文件或 [React 入门教程](https://hulufei.gitbooks.io/react-tutorial/content/) 開始學習。

至於另外在 Google 搜尋結果前面的 [React 學習手冊](https://cswleocsw.gitbooks.io/react-guide-learing/content/index.html)，由於仍是針對 react 舊版，不建議用來學習。尤其若照著舊版教學執行，安裝的將是 Babel 6，但是 Babel 6 已經大幅改版，基本安裝並不具備任何功能，需要另外安裝 preset 及設定 `.babelrc` 檔案，否則完全無法執行範例程式。
{% endcondition %}

### 安裝

建立專案並安裝相關程式庫及工具：

```bash
mkdir react-tut
cd react-tut
npm init -y
npm i -D webpack webpack-dev-server babel-loader babel-preset-es2015 babel-preset-react
npm i -S react react-dom
```

建立 .babelrc 檔案：

```bash
touch .babelrc
```

編輯 .babelrc 檔案內容如下：

__.babelrc__
```json
{
	"presets": ["es2015", "react"]
}
```

在 package.json 中加上兩個 scripts 指令，方便執行 webpack：

__package.json__
```json
	"scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --content-base build/ --hot"
	},
```

### 撰寫第一個 React 元件

首先要 import react 模組。

{% condition when:advanced %}
舊版使用 `React.createClass()` 函數來建立元件：

__helloworld.js__
```jsx
import React from 'react';

export default React.createClass({
    render: function () {
        return (
            <p>
                Hello, <input type="text" placeholder="Your name here" />!
                It is {this.props.date.toTimeString()}
            </p>
        );
    }
});
```

{% endcondition %}

React 15 偏好使用 ES6 語法，透過繼承 `React.Component` 類別來定義元件：

{% condition when:advanced %}

__helloworld.js__
```jsx
import React from 'react';

export default class HelloWorld extends React.Component {
    render () {
        return (
            <p>
                Hello, <input type="text" placeholder="Your name here" />!
                It is {this.props.date.toTimeString()}
            </p>
        );
    }
};
```

由於實際上我們只需要用到 `Component` 類別，所以__理論上__我們可以直接這樣寫：

__這樣不行__
```jsx
import {Component} from 'react';

export default class HelloWorld extends Component {
    ...
}
```

但是，很不幸地，由於與前面完全相同的原因，我們還是必須在 import 的時候，保留 `React` 變數。於是，必須寫成這樣：

{% endcondition %}

__helloworld.js__
```jsx
import React, {Component} from 'react';

export default class HelloWorld extends Component {
    render () {
        return (
            <p>
                Hello, <input type="text" placeholder="Your name here" />!
                It is {this.props.date.toTimeString()}
            </p>
        );
    }
};
```

注意到這裡的 render 是定義元件自己的 `render()` 函數，所以在這裡我們必須使用 `return` 指令回傳 markup 內容 (可以跟後面繪製元件的作法比較一下)。這裡最好養成習慣，永遠在 `return` 指令回傳的 JSX 外面，使用 `(`, `)` 加以包圍，以避免 JSX 語法解析時發生錯誤。

#### JSX 語法簡介

簡單介紹一下 JSX 語法。

在使用 JSX 語法時，由於目的是把 html 標籤嵌入到 JavaScript 程式中，所以我們還是像平常一樣寫 JavaScript 程式。只有在定義元件的 `render()` 函數，或是呼叫 ReactDOM 的 `render()` 函數時，JSX 才會接手。在元件的 `render()` 函數定義內部，或是呼叫 `ReactDOM.render()` 的參數中出現 `<`, `>` 或 `/>` 這些標籤時，JSX 明白這是 html 元素標籤，就會進行轉換，將它們轉換為對 `React.createElement()` 之類的函數呼叫。而要在 JSX 中使用 JavaScript 運算式時，可以使用 `{expression}` 語法，以 `{`, `}` 包圍運算式 (注意不要再使用 `'` 或 `"` 字元包圍，否則就會變成普通字串常數)。

只要遵循上面的語法，就可以像洋蔥一樣，一層一層包裹，混合搭配 JavaScript 程式與 html 元素標籤 (不過通常會適當地分解為更小的元件)。

#### 屬性 (property)

由外部傳給元件的值，在元件中可以透過 `props` 屬性 (property) 取得，而且這些屬性是唯讀的，元件不應該對 `props` 屬性進行變更。除了透過 html 元素的屬性 (attribute) 明確指定要傳入的屬性之外，還有一些 React 定義的內部屬性，譬如 `children` 屬性 (property)，也會透過 `props` 屬性 (property) 傳遞。

這裡的 HelloWorld 元件，期望由外部傳入一個 `date` 屬性。所以我們在元件內透過 `this.props.date` 的方式讀取該值。並且由於這是混合在 JSX 中，所以需要將運算式包圍在 `{}` 中。

### 使用元件

首先要 import `react` 及 `react-dom` 模組：

{% condition when:advanced %}
React 新版已將 `render()` 函數獨立，因此需要另外 import `react-dom` 模組。但是由於 `render()` 函數接受的是經由 `React.createElement()` 函數所建立的 `ReactElement` 虛擬元件，即使是透過 JSX 語法看不到相關的函數呼叫，實際上最後還是轉換為對 `React.createElement()` 函數的呼叫，因此還是必須要 import `react` 模組為 `React` 變數 (可以簡單視為 `react-dom` 模組依賴於全域的 `React` 變數)：

__main.js__
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import HelloWorld from './helloworld.js'

setInterval(() => {
    ReactDOM.render(
        <HelloWorld date={new Date()} />,
        document.getElementById('example')
    );
}, 500);
```

由於 import `react-dom` 通常只為了 `render()` 函數，所以也可以直接利用 object destruction 指令直接取出：
{% endcondition %}

__main.js__
```jsx
import React from 'react';
import {render} from 'react-dom';
import HelloWorld from './helloworld.js'

setInterval(() => {
	render(
        <HelloWorld date={new Date()} />,
        document.getElementById('example')
    );
}, 500);
```

在這裡的 `date={new Date()}` 中，我們透過 `{}` 語法以 JavaScript 建立一個 Date 物件，然後指定給 HelloWorld 元素的 `date` 屬性 (attribute)。

最後，注意到這裡的 render 是呼叫 `render()` 函數，所以沒有 `return` 指令 (可以跟前面定義元件的方式比較一下)。

#### 整合在一起

下面的 `webpack-dev-server.js` 是為了提供即時預覽功能，而 `bundle.js` 則是透過 webpack 打包之後的程式。

__index.html__
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Hello React</title>
</head>
<body>
<div id="example"></div>
<script src="//localhost:8080/webpack-dev-server.js"></script>
<script src="bundle.js"></script>
</body>
</html>
```

Webpack 的設定如下：

__webpack.config.js__
```js
var path = require('path');

module.exports = {
    entry: [
        "webpack/hot/dev-server",
        path.resolve(__dirname, 'app/main.js')
    ],

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },

    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['babel']
        }]
    }
};
```

這樣就可以執行了。在命令列下，執行 `npm run dev` 就可以打開 `localhost:8080` 看執行的結果。

### 狀態 (State)

在 React 中，跟輸出入有關的 html 元素比較特別，這跟 React 的 render 特性有關，譬如，下面範例中，試圖要在 input 元素上設定內容：

```jsx
import React, {Component} from 'react';

export default class HelloWorld extends Component {
    render () {
        return (
            <p>
                Hello, <input type="text" placeholder="Your name here" value="guest" />!
                It is {this.props.date.toTimeString()}
            </p>
        );
    }
};
```

你會發現到，雖然 `"guest"` 值正確顯示了，但是 input 元件對於按鍵沒有回應，無論打什麼字，顯示值永遠為 `"guest"`。

{% condition when:advanced %}

注意跟上一個例子比較，這裡的修改唯一的改變只增加了 `value` 屬性的設定。

如果打開瀏覽器的 console，你會看到下面的訊息：

"bundle.js:1749 Warning: Failed form propType: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."

React 把 html 內建具有 `checked` (如 checkbox 及 radio), `selected` (如 options) 或 `value` (如 input) 這些屬性的元件稱為受控元件 ([Controlled Components](https://facebook.github.io/react/docs/forms.html#controlled-components))。這些元件只要該屬性指定了除了 `null` 及 `undefined` 以外的常數值，就會表現出上面的行為：對使用者的輸入沒有反應。

{% endcondition %}

這其實是很容易理解的，因為 React 元件總是要忠實反映它被指定的屬性及狀態，而這裡我們指定給 `value` 的值，是固定的字串常數 `"guest"`，所以顯示值當然就永遠不變。

解決方式也很簡單：要反應表單元件上的資料變動，就必須要將改變更新到 state 上，最後才能夠在 view 上呈現出來。

因此，要讓 view 顯示出我們指定的 state，首先我們必須先設定好 state 初始值：

```js
constructor() {
    super();
    this.state = {
        name: 'guest'
    };
}
```

注意這裡的 state 變數名稱是固定的，且必須為物件型態。稍後提到的 `setState()` 方法，會用新的狀態取代該變數。

{% condition when:advanced %}
其實這是 React 針對使用 ES6 語法定義元件的使用情境所設定的預設行為。事實上 React 內部是透過 `getInitialState()` 方法取得初始狀態，而使用 ES6 繼承方式時，預設的實作就是回傳我們在 constructor 中指定的 `state` 變數。

另外，這裡的 `super()` 指令是必要的，因為我們是繼承自 `Component`，一旦指定了 constructor，ES6 語法就會強制我們必須指定對 `super()` 呼叫。
{% endcondition %}

設定好 state 之後，再透過 `{expression}` 語法將值指定給 `value` 屬性，這樣 input 元件就可以反映 state 的值：

```jsx
render () {
    return (
        <p>
            Hello, <input type="text" placeholder="Your name here"
                value="{this.state.name}" />!
            It is {this.props.date.toTimeString()}
        </p>
    );
}
```

這到這裡，input 元件顯示的內容已經是由 state 輸出。但是 input 元件還是無法接受輸入。所以我們必須自行處理使用者的輸入，並將輸入設定給 state：

```js
handleChange(event) {
    this.setState({ name: event.target.value });
}
```

`handleChange()` 是 HelloWorld 元件的普通方法，我們透過 React 的事件處理機制，在這裡處理 `onChange` 事件。React 會傳入 `event` 參數，我們透過 `event` 參數取得 `onChange` 事件的值，然後呼叫 ReactElement 的 `setState()` 函數，設定新的 `name` 值。

要處理 `onChange` 事件，只要在 input 元件上指定 `onChange` 屬性，並指定要處理的方法：

```jsx
render () {
    return (
        <p>
            Hello, <input type="text" placeholder="Your name here"
                value={this.state.name} onChange={this.handleChange.bind(this)} />!
            It is {this.props.date.toTimeString()}
        </p>
    );
}
```

注意到 `onChange` 必須為駝峰式命名，而對應的方法，一樣使用 `{expression}` 包圍，再強調一次，注意不要使用 `'` 或 `"` 包圍，否則就變成普通字串常數而不是運算式了。另外，React 不會幫我們處理執行環境 (context) 的問題，因此如同上面的 `handleChange()` 函數，若我們必須在函數中使用 `this` 的話，就必須自行處理 context 的問題，譬如這裡就是使用 `bind()` 函數來綁定。

最終的結果如下：

```jsx
import React, {Component} from 'react';

export default class HelloWorld extends Component {
    constructor() {
        super();
        this.state = {
            name: 'guest'
        }
    }

    handleChange(event) {
        this.setState({ name: event.target.value });
    }

    render () {
        return (
            <p>
                Hello, <input type="text" placeholder="Your name here"
                    value={this.state.name} onChange={this.handleChange.bind(this)} />!
                It is {this.props.date.toTimeString()}
            </p>
        );
    }
};
```

