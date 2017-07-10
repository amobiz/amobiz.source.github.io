# React Lifecycle Part 1: Introduction and Internal

## 以 state transition diagram (流程圖) 介紹
## 區隔 mounting / updating 的流程

mounting:

constructor() -> componentWillMount() -> render() -> componentDidMount() (client only) -> idle

updating (client only ?)

[props / state change] -> componentWillReceiveProps() -> shouldComponentUpdate()
	yes -> componentWillUpdate() -> render() -> componentDidUpdate() -> idle
	no  -> idle

注意這些都是在 mounted 之後，也就是在 mounting 階段，除了 `render()` 以外，這些 lifecycle 方法都不會被呼叫。

umounting:

idle -> componentWillUnmount() (client only ?) -> destroyed


## 區隔 client side / server side
## 區隔 可否呼叫 setState(), 是否會造成 re-render
## 區隔能否使用 refs
## 區隔是在 children render 之後或之前 (https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/update/postrender_with_componentdidupdate.html)

## 介紹常用的 pattern，及其涉入的 lifecycle method

## 介紹 React Class, React Component 及 React Element

* React Class
* React Component (React Class 的 instance)
* React Element (Virtual DOM)

mounting:

1. 由 `ReactDom.render()` 開始，
2. 先呼叫 createElement() 建立最上層的 React Element,
3. 然後根據該 React Element，建立對應的 React Component，呼叫該 instance 的 constructor() -> componentWillMount() -> render()，取得子 React Element，
4. 然後對每個子 React Element 重複步驟 3，直到所有的元件的 render() 函數回傳的 React Element 不再含有自訂的 React Component (或者說，只含有標準 html tag)，
5. 上述過程，將建立 React Element 樹，根據整個 React Element 樹，為每個 type 為標準 html tag 的 element 建立對應的 DOM，
6. 將整個 DOM 樹，掛載到指定的實體 DOM 上，
7. 依剛剛的呼叫所建立的樹狀結構，以反向順序呼叫每個 React Component 的 componentDidMount() 函數，完成。

updating:



## 強調即使父元件的 `render()` 函數每次都建立新的 ReactElement，但經過 reconciler 比對後，
若判定 ReactElement 實際上沒有變動，則 ReactElement 實際對應的 ReactComponent 並就會直接重複使用。
光只有屬性變化__應該__不會建立新的 ReactComponent。而是呼叫 Updating 相關的 lifecycle 方法，然後決定要不要重新 render。
會重新建立的情況，應該是牽涉到元件的結構變化。

imgur.com

# React Lifecycle Part 2: Common Usage Patterns

## 實例篇

### Mounting / Unmounting

* [`constructor(props, context)`](https://facebook.github.io/react/docs/react-component.html#constructor)
* [`componentWillMount()`](https://facebook.github.io/react/docs/react-component.html#componentwillmount)
* [`render()`](https://facebook.github.io/react/docs/react-component.html#render)
* [`componentDidMount()`](https://facebook.github.io/react/docs/react-component.html#componentdidmount)
* [`componentWillUnmount()`](https://facebook.github.io/react/docs/react-component.html#componentwillunmount)

####

#### 與實體 DOM 互動 (純 client 端)

`componentDidMount()`
`componentWillUnmount()`

##### set initial focus

##### listen on global event

##### listen on component event

### Updating (資料的取得與觸發更新)

* [`constructor(props, context)`](https://facebook.github.io/react/docs/react-component.html#constructor)
* [`componentWillReceiveProps(nextProps)`](https://facebook.github.io/react/docs/react-component.html#componentwillreceiveprops)
* [`shouldComponentUpdate(nextProps, nextState)`](https://facebook.github.io/react/docs/react-component.html#shouldcomponentupdate)
* [`componentWillUpdate(nextProps, nextState)`](https://facebook.github.io/react/docs/react-component.html#componentwillupdate)
** setState(): no
** refs: yes。注意此時由於元件尚未重新 render，所以 `refs` 指向舊的 DOM，應該避免使用。
** [What is the exact usage of componentWillUpdate in ReactJS?](http://stackoverflow.com/questions/33075063/what-is-the-exact-usage-of-componentwillupdate-in-reactjs/33075514#33075514)

* [`render()`](https://facebook.github.io/react/docs/react-component.html#render)
* [`componentDidUpdate(prevProps, prevState)`](https://facebook.github.io/react/docs/react-component.html#componentdidupdate)
** [setState() inside of componentDidUpdate()](http://stackoverflow.com/questions/30528348/setstate-inside-of-componentdidupdate)


### 根據 `props` 提供的值，進行複雜的運算，然後暫存於 `state`

`constructor(props)`
`componentWillReceiveProps(nextProps)`

### 元件更新後，進行附加處理

* [`constructor()`](https://facebook.github.io/react/docs/react-component.html#constructor)

注意 1：

如果元件需要設定 state，但不需要參考 `props`，那麼其實不需要向官方範例一樣，在 constructor 中設定：

```js
class MyComponent extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			myState: 0
		};
	}
}
```

其實只需要這樣寫：

```js
class MyComponent extends PureComponent {
	state = {
		myState: 0
	};
}
```

另外，如果初始化 state 的程式碼很複雜，需要另外獨立一個函數的話，雖然可以像下面這樣寫，但是看起來很奇怪：

```js
class MyComponent extends PureComponent {
	state = this.initComplexState();
}
```

這時候還是放在 constructor 中比較順眼：

```js
class MyComponent extends PureComponent {
	constructor(props) {
		super(props);
		this.state = this.initComplexState();
	}
}
```

這麼做有個附加的好處，就是當 `state` 的設定，需要參考 `props` 時，除了必須在 `constructor` 設定 `state`，還應該在 `componentWillReceiveProps()` 函數中做相同的處理，這時候，獨立的 `state` 初始化函數就可以共用了：

```js
class MyComponent extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			myState: 0,
			...this.calcStateFromProps(props)
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.value !== this.props.value) {
			this.setState(this.calcStateFromProps(nextProps));
		}
	}

	calcStateFromProps(props) {
		return {
			myStateFromProps: props.value
		};
	}
}
```

注意到這裡用來從 `props` 計算出 `state` 的 `calcStateFromProps(props)` 函數會回傳一個新的 `state` (部分) 物件，因此我們可以用來:
1. 在 constructor 中初始化 state，
2. 也可以在 `componentWillReceiveProps()` 函數中用來傳遞給 `setState()`。

順便提一下，呼叫 `setState()` 函數時，並不需要傳遞全部的 `state` 屬性，只需要傳遞需要更改的部分即可。在上面的例子中，`myState` 是一個不需要依賴 `props` 的狀態，並不會隨著 `props` 的改變而發生變化，因此只需要在 `constructor` 中初始化一次即可，並不需要在 `componentWillReceiveProps()` 函數中重新設定；而 `myStateFromProps` 則是由 `props` 推導出來的，因此必須在 `constructor` 和 `componentWillReceiveProps()` 函數中分別進行初始化以及重新設定。

如果將 `calcStateFromProps(props)` 函數改寫成在函數中直接呼叫 `setState()` 的話，有個小細節要注意一下：

```js
class MyComponent extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {    // 注意這裡就算沒有必要設定 state 屬性，
		  myState: 0      // 也必需先初始化 state，譬如，至少需要 `this.state = {};`，
		};                // 否則後續的 setState() 呼叫都會失敗，
										  // 丟出 can not call `get` function of undefined 錯誤。
		this.calcStateFromProps(props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.value !== this.props.value) {
		  this.calcStateFromProps(nextProps);
		}
	}

	calcStateFromProps(props) {
		this.setState({
			myStateFromProps: props.value
		});
	}
}
```


* [`componentWillMount()`](https://facebook.github.io/react/docs/react-component.html#componentwillmount)
在元件掛載前呼叫，此時呼叫 `setState()` 不會觸發 re-render。是唯一會在 server rendering 時呼叫的 lifecycle 函數。官方建議使用 `constructor()` 即可。

* [`componentDidUpdate()`](https://facebook.github.io/react/docs/react-component.html#componentdidupdate)

* [When to use React `componentDidUpdate` method?](http://stackoverflow.com/questions/38759703/when-to-use-react-componentdidupdate-method)
* [Post-Render with componentDidUpdate()](https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/update/postrender_with_componentdidupdate.html)

#### 驅動 3rd party 元件

TODO: 確認 d3.js, three.js 與 react 的整合方式

#### auto save

```js
import React, {PropTypes} from 'react';
import debounce from 'lodash/debounce';

export default class AutoSaveInput extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      content: this.load()
    };
  }

  clear() {
  	if (typeof localStorage !== 'undefined') {
  	  localStorage.deleteItem('draft');
  	}
  }

  load() {
  	if (typeof localStorage !== 'undefined') {
  	  return localStorage.getItem('draft');
  	}
  	return '';
  }

  save(value) {
    if (typeof localStorabe !== 'undefined') {
	  localStorabe.setItem('draft', value);
	}
  }

  autoSave = debounce(save, 2000);

  componentDidUpdate() {
  	const {content} = this.state;
    this.autoSave(content);
  }

  render() {
  	return (
  	  <form onSubmit={this.handleSubmit}>
  	    <input value={content} onChange={this.handleChange}/>
  	    <button type='submit'>Submit</button>
  	  </form>
  	);
  }

  handleChange = (e) => {
    const content = e.target.value;
	this.setState({content});
  };

  handleSubmit = (e) => {
    const {content} = this.state;

	fetch({
	  url: 'https:///posts'
	  method: 'post',
	  content
	}).then(() => {
	  this.clear();
	});
	e.preventDefault();
  };
}
```



