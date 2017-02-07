title: "React Tricks"
date: 2016-09-01 01:02:00
comments: true
toc: true
category:
  - Programming
tags:
  - React
---
# React 心得與小技巧

### 單純修 static markup / style 時

#### 直接在 route 上掛上要測試的 component

```js
/* routes.js */

  {
    path: '/test',
    component: require('./components/posts/Post').default
  },
```

#### 如果需要傳遞 props，可以考慮以 pure component 的形式包裝:

```js
/* routes.js */

  {
    path: '/test',
    component: () => {
      const Component = require('./components/posts/Post').default;
      const props = {...};
      return (<Component ...props/>);
    }
  },
```

盡量將元件寫成 dumb component，會比較容易測試及修改。


### State 初始化

由於 React 官方的教學文件這樣寫，幾乎所有的人都跟著這樣寫：

```js
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...
    };
  }
}
```

其實，如果沒有要進行其它處理，純粹只是要初始化 state，則可以直接寫成 member 的形式即可：

```js
class Component extends React.Component {
  state = {
    ...
  };
}
```


### 避免不必要的 DOM 更新

#### 盡量將靜態的元素移到 constructor 或預先以 member 的形式做好必要的處理

將

```js
class Component extends React.Component {
  static propTypes = {
    date: PropTypes.string.isRequired
  };

  render() {
    return (
      <div style={{background: '#fafafa', color: '#3c3c3c'}} onClick={this.handleClick.bind(this)}>
        {`today is ${this.props.date}`}
      </div>
    );
  }

  handleClick(e) {
  }
}
```

改成

```js
class Component extends React.Component {
  static propTypes = {
    date: PropTypes.string.isRequired
  };

  style = {
    background: '#fafafa',
    color: '#3c3c3c'
  };

  render() {
    return (
      <div style={this.style} onClick={this.handleClick}>
        {`today is ${this.props.date}`}
      </div>
    );
  }

  handleClick = (e) => {
  };
}
```

但是，為什麼不把 ``` {`today is ${this.props.date}`} ``` 這一段也拉出來？像這樣：

```js
componentWillReceiveProps(nextProps) {
  this.dateText = `today is ${this.props.date}`;
}

render() {
  return (
    <div style={this.style} onClick={this.handleClick}>
      {this.dateText}
    </div>
  );
}
```

首先，透過 `props` 傳入的屬性，基本上是動態的，父元件隨時可以傳入不同的內容。因此，一旦屬性有變動，我們就必須在適當的時候更新對應的值。
再者，看似比較適合用來更新對應值的 [`componentWillReceiveProps()`](https://facebook.github.io/react/docs/component-specs.html#updating-componentwillreceiveprops)
 函數，在 `render()` 函數第一次執行之前，並不會被呼叫。只有在第一次 render 之後，且 `props` 有更新的前提下，`componentWillReceiveProps()` 函數才會被呼叫 (這樣說其實有些過度簡化，因為實際上若父元件未做好這裡說明的最佳化，就有可能會有多餘的 render，而導致 `componentWillReceiveProps()` 函數被呼叫)。

像上面的寫法，第一次 render 時，`div` 元素內部將不會有內容。而且如果 `date` 屬性從來沒有更新過，那麼 `div` 元素內部將永遠不會有內容。

不過還好，我們還有 `constructor()` 可用，`constructor()` 接受 `props` 參數，我們可以在這裡做第一次的計算，然後在 `componentWillReceiveProps()` 函數中進行 `props` 改變時的計算：

```js
class Component extends React.Component {
  static propTypes = {
    date: PropTypes.string.isRequired
  };

  constructor(props) {
    this.dateText = this.renderDateText(props);
    this.style = {
      background: '#fafafa',
      color: '#3c3c3c'
    };
  }

  componentWillReceiveProps(nextProps) {
    this.dateText = this.renderDateText(props);
  }

  render() {
    return (
      <div style={this.style} onClick={this.handleClick}>
        {this.dateText}
      </div>
    );
  }

  renderDateText(props) {
    return `today is ${props.date}`;
  }

  handleClick = (e) => {
  };
}
```

但是話說回來，這樣做真的是有點小題大做了。除非要計算的東西真的很複雜，否則要解決這種在 render 時必須對動態傳入的 `props` 進行加工處理，而導致每次 render 時都會產生新的文字內容的問題，最好的方法，還是要依賴後面將會介紹的 `shouldComponentUpdate()` 函數。或者，React 15.3.0 版新增了 `PureComponent` 元件，只要我們的元件是 pure 的，也就是元件的輸出完全依賴於 `props` 與 `state`，而不會有任何副作用，那麼就可以直接繼承 `PureComponent` 元件，而省略  `shouldComponentUpdate()` 函數。

#### 使用 Factory Method 時，應該預先呼叫以建立 member

這其實就是上一個原則。不過經常看到這樣的寫法，所以特別提出來。

將

```js
class Component extends React.Component {
  handleClick = (text) => (e) => {
    console.log(`Item ${text} clicked`);
  }

  render() {
    return (
      <div>
        <div onClick={this.handleClick('on')}>on</div>
        <div onClick={this.handleClick('off')}>off</div>
      </div>
    );
  }
}
```

改成

```js
class Component extends React.Component {
  createClickHandler = (text) => (e) => {
    console.log(`Item ${text} clicked`);
  }

  handleClickOn = createClickHandler('on');
  handleClickOff = createClickHandler('off');

  render() {
    return (
      <div>
        <div onClick={this.handleClickOn}>on</div>
        <div onClick={this.handleClickOff}>off</div>
      </div>
    );
  }
}
```

注意這裡將原本的 `handleClick()` 函數重新命名為 `createClickHandler()`，以反映它實際上是一個 factory method，避免被當做 event handler function 誤用。


#### 預先建立 Static Children Component (持保留態度)

上面的例子，每個 JSX tag component 實際上都會被轉譯為 `React.createElement()` 的呼叫，
因此，每次 `render()` 被呼叫時，都會回傳新的 virtual DOM (記得善用好朋友 [Babel REPL](https://babeljs.io/repl/#?babili=false&evaluate=true&lineWrap=false&presets=es2015%2Creact%2Cstage-2&code=)，
檢視 JSX 轉譯之後的 JavaScript 程式碼)：

```js
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = function (_React$Component) {
  _inherits(Component, _React$Component);

  function Component() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Component);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Component.__proto__ || Object.getPrototypeOf(Component)).call.apply(_ref, [this].concat(args))), _this), _this.createClickHandler = function (text) {
      return function (e) {
        console.log('Item ' + text + ' clicked');
      };
    }, _this.handleClickOn = createClickHandler('on'), _this.handleClickOff = createClickHandler('off'), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Component, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { onClick: this.handleClickOn },
          'on'
        ),
        React.createElement(
          'div',
          { onClick: this.handleClickOff },
          'off'
        )
      );
    }
  }]);

  return Component;
}(React.Component);
```

可以考慮改成：

```js
class Component extends React.Component {
  createClickHandler = (text) => (e) => {
    console.log(`Item ${text} clicked`);
  }

  handleClickOn = createClickHandler('on');
  handleClickOff = createClickHandler('off');

  refOn = (<div onClick={this.handleClickOn}>on</div>);
  refOff = (<div onClick={this.handleClickOff}>off</div>);

  render() {
    return (
      <div>
        {refOn}
        {refOff}
      </div>
    );
  }
}
```

這個例子裡，`refOn`, `refOff` 拉出來之後，就只會被建立一次，所以原本的 `handleClick()` 又可以拉回來，在 JSX 中直接建立：


```js
class Component extends React.Component {
  createClickHandler = (text) => (e) => {
    console.log(`Item ${text} clicked`);
  }

  refOn = (<div onClick={this.createClickHandler('on')}>on</div>);
  refOff = (<div onClick={this.createClickHandler('off')}>off</div>);

  render() {
    return (
      <div>
        {refOn}
        {refOff}
      </div>
    );
  }
}
```


#### 利用 `shouldComponentUpdate()` 函數以避免不必要的 `render()` 函數呼叫

上一個例子，元件根本不接受 `props`，所以其實可以將元件本身整個拉出來：

```js
class Component extends React.Component {
  _ref = (
    <div>
      <div onClick={this.createClickHandler('on')}>on</div>
      <div onClick={this.createClickHandler('off')}>off</div>
    </div>
  );

  render() {
    return _ref;
  }

  createClickHandler = (text) => (e) => {
    console.log(`Item ${text} clicked`);
  }
}
```

好啦，其實上面所有的例子，都是在沒有覆寫 [`shouldComponentUpdate()`](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) 函數的前提下，才會發生的狀況。
由於 `shouldComponentUpdate()` 函數預設回傳 `true`，才會導致 `render()` 函數在 `props` 沒有變動 (或是像這裡根本沒有用到 `props`) 的情況下也被呼叫。

上面的情況，由於根本沒有 `props`，其實可以直接在 `shouldComponentUpdate()` 函數回傳 `false` 即可：

```js
class Component extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div>
        <div onClick={this.createClickHandler('on')}>on</div>
        <div onClick={this.createClickHandler('off')}>off</div>
      </div>
    );
  }

  createClickHandler = (text) => (e) => {
    console.log(`Item ${text} clicked`);
  }
}
```

有人可能會問，如果 `shouldComponentUpdate()` 函數永遠回傳 `false`，那麼元件是不是就完全不會 render 了呢？

事實上第一次呼叫 `render()` 前，React 不會呼叫 `shouldComponentUpdate()` 函數，這樣才能建立最初的 virtual DOM。
後續要 render 時，才會呼叫 `shouldComponentUpdate()` 函數，以決定是否呼叫 `render()` 函數。
而若 `shouldComponentUpdate()` 函數回傳 `true`，且 `render()` 函數回傳的新的 virtual DOM 也有所變動，
React 才會更新對應的實體 DOM。

不過這個例子是極少數的特例，絕大多數的元件都需要 `props`，以提供更多彈性。這時候就可以利用 `shouldComponentUpdate()` 函數來針對 `props` 的改變來決定是否重新 render：

```js
class Component extends React.Component {
  static propTypes = {
    status: PropTypes.bool,
    onToggle = PropTypes.func.isRequired
  }

  handleClick = (e) => {
    console.log(this.statusText());
    this.props.onToggle();
  }

  statusText() {
    return this.props.status ? 'on' : 'off';
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.status !== this.props.status;
  }

  render() {
    return (<div onClick={this.handleClick}>{this.statusText()}</div>);
  }
}
```

在這裡，我們判斷傳給 `shouldComponentUpdate()` 函數的 `nextProps` 參數，此參數代表新的 `props` 值，我們可以拿來跟舊的 `props` 比較，以判斷 `props` 是否有更新。
如果沒有更新，則令 `shouldComponentUpdate()` 函數回傳 `false`，那麼 React 就不會呼叫 `render()` 函數，也就不會有不必要的 DOM 更新問題。

不過，`shouldComponentUpdate()` 函數只解決了元件本身的 `props` 變動的判斷問題，一旦判定 `props` 變動發生，就會呼叫 `render()` 函數。
如果在 `render()` 函數中，沒有預先將靜態元素拉出，轉譯後的程式碼就會呼叫 `createElement()` 等函數，為包含靜態元件的所有的子元件，個別建立新的 `ReactElement` 元件。
因此還是應該盡量將靜態元素拉出，以避免無謂的 DOM 更新：

```js
class Component extends React.Component {
  static propTypes = {
    status: PropTypes.bool,
    onToggle = PropTypes.func.isRequired
  }

  handleClick = (e) => {
    console.log(this.statusText());
    this.props.onToggle();
  }

  heavyStaticChildComponent = (<HeavyComponent/>);

  statusText() {
    return this.props.status ? 'on' : 'off';
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.status !== nextState.status;
  }

  render() {
    return (
      <div>
        <div onClick={this.handleClick}>{this.statusText()}</div>
        {this.heavyStaticChildComponent}
      </div>
    );
  }
}
```

這邊還有一個細節，`shouldComponentUpdate()` 函數能夠發揮作用的前提，是該元件在其父元件中被重複使用，`shouldComponentUpdate()` 函數才有機會被呼叫。
如果父元件並沒有預先建立好子元件並加以重複使用，而是每次都建立新的子元件，記得前面已經說明，在第一次 render 時，`shouldComponentUpdate()` 函數不會被呼叫，
而下次要 render 時，原有的子元件卻被捨棄了，每次都是重新建立新的子元件。在這樣的情況下，即使子元件正確實作 `shouldComponentUpdate()` 函數，也是無用武之地。

詳細說明可以參考 [React 巢狀 Component 效能優化](https://blog.wuct.me/react-%E5%B7%A2%E7%8B%80-component-%E6%95%88%E8%83%BD%E5%84%AA%E5%8C%96-b01d8a0d3eff#.1tfs3gt40) 這篇文章。

#### 使用 3rd party library 幫忙處理 `shouldComponentUpdate()` 函數

毫不意外地，以上的 pure render 問題當然已經有人幫忙處理好了，我們只需要站在巨人的肩膀上即可：

* Babel 的 [transform-react-constant-elements](https://babeljs.io/docs/plugins/transform-react-constant-elements/) plugin

  可以在 build 階段自動把子元件拉出。

* [recompose#pure](https://github.com/acdlite/recompose/blob/master/docs/API.md#pure)

  透過它提供的 `pure()` 函數，可以手動處理深層元件疊套時的更新判斷問題。

* [react-immutable-render-mixin](https://github.com/jurassix/react-immutable-render-mixin)

  如果是使用 [Immutable.js](https://facebook.github.io/immutable-js/)，可以用這個 mixin 來處理 `props` 及 `state` 變動的判斷。

#### React 官方的解決方案

* [PureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html)

  [Mixins Considered Harmful](https://facebook.github.io/react/blog/2016/07/13/mixins-considered-harmful.html)

* [React.PureComponent](https://github.com/facebook/react/pull/7195)

### 與實體 DOM 互動

[`componentDidMount()`](https://facebook.github.io/react/docs/component-specs.html#mounting-componentdidmount)

[`componentWillUnmount()`](https://facebook.github.io/react/docs/component-specs.html#unmounting-componentwillunmount)

[componentWillUnmount not called server side]()https://github.com/facebook/react/issues/3714

這兩個生命週期函數，都不會在 server render 時呼叫，只會在 client 端呼叫，因此可以放心使用 `window` 等 browser object。

### 參考資料

* [React 巢狀 Component 效能優化](https://blog.wuct.me/react-%E5%B7%A2%E7%8B%80-component-%E6%95%88%E8%83%BD%E5%84%AA%E5%8C%96-b01d8a0d3eff#.1tfs3gt40)
* [React.js pure render performance anti-pattern](https://blog.wuct.me/react-%E5%B7%A2%E7%8B%80-component-%E6%95%88%E8%83%BD%E5%84%AA%E5%8C%96-b01d8a0d3eff#.1tfs3gt40)
* [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.3un9jkv65)
* [Smart and Dumb Components in React](http://jaketrent.com/post/smart-dumb-components-react/)
