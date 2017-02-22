Redux Stack

### react-redux

@connect

Annotation 其實只是一個普通的函數，實際運作上是將被 annotate 的物件傳給該函數。
所以：

```js
@connect(
	mapStateToProps(state, [ownProps]) {},
	mapDispatchToProps
)
class MyComponent extends React.Component {

}
```

實際上等於：

```js
class MyComponent extends React.Component {

}

connect(mapStateToProps(state, [ownProps]) {}, mapDispatchToProps)(MyComponent);
```


### [redial](https://github.com/markdalgleish/redial)

redail 讓我們對元件埋入一些 hook 函數，以便在需要的時候手動觸發。

實際做法是，將我們傳給 provideHooks() 的參數，透過一個特殊名稱的 property，設定給元件。
(其實跟 HOC 也沒什麼不同，不太了解為什麼要用不同的方式處理。)

通常是在 router handler, 或是最上層物件，手動觸發必要的 hook，以擷取必要的資料。

@provideHooks

provideHooks() 函數接受一個物件，該物件可以有各種自訂的 hook 函數屬性，譬如 fetch, defer, done。每個屬性是一個函數，在各種不同時機下，由應用程式自行觸發呼叫。

？ hook 函數在元件被 render 前先被呼叫，可以在此時去準備好必要的資料，然後再丟給元件。
hook 函數接收的物件，是我們在呼叫 redial 的 trigger() 函數時提供的 locals 參數。

譬如，我們可以，為物件提供以下資料：

由 react-router 提供的 params
由 redux 提供的 dispatch, getState

由於此唯一參數是一個物件，通常我們會在 hook 函數參數列中，以 object destructing 語法，取出我們真正關注的資料。

hook 函數可以回傳 promise，而 trigger() 函數會返回一個 promise，該 promise 將在所有傳入的元件的 hook 的 promise 都 fulfill 或 reject 後，才完成。

如果是跟 react-router 的 match() 函數綁定，match() 函數會回傳該路徑上的所有 component，因此，所有路徑上的元件都可以進行必要的額外 hook 處理。

不過這裡的問題是，每個 hook 執行的內容，都各自 dispatch，將造成 state 不斷 update，每次 update，就觸發一次 render。
因此，雖然可以在路徑上的每個元件都埋 hook，卻不建議這麼做。應該只在最上層元件埋 hook，待所有的資料收集完畢，才一次呼叫 setState() 或是 redux



？ 注意，由於實際上被 annotate 的物件是包裹在 annotation 函數內部，所以



### redux-form

redux form 的問題

由於將資料儲存在 store 中，如果在定義 form 時指定 form 要儲存的 state 的 key，則同時間只能有一個 form 存在，
若建立兩個相同的 form，由於資料的儲存位置相同，將導致資料複寫問題。

要同時有多個相同的 form，必須動態傳入 form 的名稱：

```js
render (
  <MyForm form={`myform-${formId}`}/>
);
```

redux-form 會將相關的 props 都傳給元件，元件可以由 `props.form` 取得 form 的真實名字。
通常需要知道 form 的名稱的場合，是為了要由 form 取資料，這時候可以用官方的 `formValueSelector` 取出，
`@connect` 的第二個參數，就是傳入的 `props`：

```js
@reduxForm({})
@connect((state, {form}) => {
  const selector = formValueSelector(form);
  return {
	field1: selector(state, 'field1')
  };
})
export default class MyForm extends React.PureComponent {

}
```

如果不用 `formValueSelector`，則必須這樣寫：

```js
@reduxForm({})
@connect((state, {form}) => {
  return {
	field1: state.form[form] && state.form[form].values.field1
  };
})
export default class MyForm extends React.PureComponent {

}
```

### immutable.js

immutable.js 的缺點：https://kknews.cc/tech/xaz3j9.html

最大的問題就是不容易區分哪裡是 immutable, 哪裡是 plain JavaScript object，
且取得 immutable 物件時，不清楚到底是哪一個資料型別，有哪些方法可以呼叫。
雖然以上兩點都可以使用 TypeScript 或 Flow 來協助型別檢查。

可慮使用 react-addon-update 取代 immutable.js

關於 immutable.js 的優缺點，[Immutable 详解及 React 中实践](https://zhuanlan.zhihu.com/p/20295971?columnSlug=purerender) 這一篇文章寫的很清楚，值得參考。

### react-router

如果使用 (建議) `browserHistory`，要注意必須使用 `Link` 取代 `a`，否則點擊連結時，會造成整個頁面 refresh。
(這一點似乎沒有在任何文件上特別提醒過，包括阮一峰的[React Router 使用教程](http://www.ruanyifeng.com/blog/2016/05/react_router.html))

這是因為 `Link` 透過 `browserHistory`，呼叫 History API，進行 location 的置換，
若不使用 `Link`，則瀏覽器會直接進行一般的頁面跳轉，導致正個頁面重新載入。
至於使用 `hashHistory` 時，不會有頁面重新載入的問題，這是因為對瀏覽器而言，其實網址從來沒有更動過，改變的只是 `#` 部分，
而對瀏覽器而言，這 `#` 只不過是用來指向頁面中具有 `id` 屬性的元素，將畫面捲動到元素所在位置，不牽涉到頁面的切換問題。



onEnter 是只有路徑確實吻合時才會呼叫，而不是子路徑吻合時也會呼叫



