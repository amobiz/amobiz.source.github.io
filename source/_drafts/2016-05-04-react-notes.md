title: "ReactJS 15 學習筆記"
date: 2016-05-04 20:03:00
comments: true
category:
  - Programming
tags:
  - notes
  - ReactJS
---

### 安裝

{% condition %}
最新版已經是 react 15 了，建議由官方的 [Getting Started](https://facebook.github.io/react/docs/getting-started.html) 文件或 [React 入门教程](https://hulufei.gitbooks.io/react-tutorial/content/) 開始學習。

至於另外在 Google 搜尋結果第二項的 [React 學習手冊](https://cswleocsw.gitbooks.io/react-guide-learing/content/index.html)，由於仍是針對 react 舊版，不建議用來學習。尤其是 Babel 6 已經大幅改版，若照著舊版教學執行，安裝的將是 Babel 6，但 Babel 6 基本安裝並不具備任何功能，需要另外安裝 preset 及設定 `.babelrc` 檔案。
{% endcondition %}

建立專案並安裝相關程式庫及工具：

```bash
mkdir react-tut
cd react-tut
npm init -y
npm i -D webpack webpack-dev-server babel-loader babel-preset-es2015 babel-preset-react
npm i -S react react-dom
touch .babelrc
```

編輯 .babelrc 內容如下：

__.babelrc__
```json
{
	"presets": ["es2015", "react"]
}
```

幫 package.json 加上兩個 scripts 指令，方便執行 webpack：

__package.json__
```json
	"scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --content-base build/ --hot"
	},
```

### 撰寫第一個 React 元件

import `react` 及 `react-dom` 模組：

{% condition %}
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

注意到這裡的 render 是呼叫 `render()` 函數，所以沒有 `return` 指令。另外，JSX 語法中，要在元素標籤中使用 JavaScript 運算式時，可以使用 `{}` 包圍，就像上面的 `date={new Date()}` 的作法一樣。注意不要再使用 `'` 或 `"` 字元包圍，否則就變成普通字串常數了。

{% condition %}
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

{% condition %}

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

注意到這裡的 render 是定義元件的 `render()` 函數，在這裡我們必須使用 `return` 指令回傳 markup 內容。

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

### Data Binding

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

這是因為 React 強調資料單向流動，由 state 往 view 移動，而這裡我們指定給 `value` 的值，是固定的字串常數 `"guest"`，所以顯示值當然就永遠不變。

{% condition when:advanced %}

如果打開瀏覽器的 console，你會看到下面的訊息：

"bundle.js:1749 Warning: Failed form propType: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."


React 把這種元件稱為 [Controlled Components](https://facebook.github.io/react/docs/forms.html#controlled-components)。

{% endcondition %}

解決方式其實很直覺：要反應表單元件上的資料變動，就必須更新到 state 上，最後才能夠 render 到 view 上。

因此，要讓 view 顯示出我們指定的 state，首先我們必須先設定好 state 初始值：

```js
constructor() {
    super();
    this.state = {
        name: 'guest'
    };
}
```

這裡的 `super()` 指令是必要的，因為我們是繼承自 `Component`，一旦指定了 constructor，ES6 語法就會強制我們必須指定 `super()` 呼叫。

設定好 state 之後，再透過 {} 語法將值指定給 `value` 屬性，這樣 input 元件就可以反映 state 的值：

```jsx
render () {
    return (
        <p>
            Hello, <input type="text" placeholder="Your name here" value="{this.state.name}" />!
            It is {this.props.date.toTimeString()}
        </p>
    );
}
```

這到這裡，input 元件顯示的內容已經是由 state 輸出。但是 input 元件還是無法接受輸入。所以我們必須自行處理使用者的輸入，並將輸入設定給 state；

```js
handleChange(event) {
    this.setState({ name: event.target.value });
}
```

`handleChange()` 是 HelloWorld 元件的普通方法，我們透過 React 的事件處理機制，在這裡處理 `onChange` 事件。與普通 html 的 `onchange` 事件一樣，這裡會傳入 `event` 參數。我們透過 `event` 參數取得 `onChange` 事件的值，然後呼叫 ReactElement 的 `setState()` 函數，設定新的 name 值。

要處理 `onChange` 事件，只要在 input 元件上指定 `onChange` 屬性，並指定要處理的方法。

```jsx
render () {
    return (
        <p>
            Hello, <input type="text" placeholder="Your name here" value={this.state.name} onChange={this.handleChange.bind(this)} />!
            It is {this.props.date.toTimeString()}
        </p>
    );
}
```

注意到 `onChange` 必須為駝峰式命名，而對應的方法，一樣使用 `{}` 包圍，再強調一次，注意不要使用 `'` 或 `"` 包圍，否則就變成普通字串常數而不是運算式了。另外，React 不會幫我們處理 context 的問題，因此如同上面的 `handleChange()` 函數，若我們必須在函數中使用 this 的話，就必須自行處理 context 的問題，這裡就是使用 `bind()` 函數來綁定。

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
                Hello, <input type="text" placeholder="Your name here" value={this.state.name} onChange={this.handleChange.bind(this)} />!
                It is {this.props.date.toTimeString()}
            </p>
        );
    }
};
```

