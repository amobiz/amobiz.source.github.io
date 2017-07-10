# React Ideas

## StateRoute

```js
<Router>
	<Route path='/'>
		<IndexRoute component=Home>
		<StateRoute state='login' component=Login>
	<Route>
</Router>
```

根據 react-router 的 location.state 自訂 component 屬性，
此 component 指定 child component，以此來決定 render 哪一個 component。
