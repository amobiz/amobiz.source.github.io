# redial

## TL;DR:

應該處理 `location.action` 為 `POP` 的情形：

```js
history.listen(location => {
  match({
    routes,
    location
  }, (err, redirectLocation, renderProps) => {
    if (err || !renderProps) return;

    const {components} = renderProps;

    const locals = {
      path: location.pathname,
      query: location.query || {},
      params: renderProps.params || {},
      location: location,
      dispatch: store.dispatch,
      getState: store.getState
    };

    if (window.$STATE) {
      delete window.$STATE;
    } else if (location.action === 'POP') {
      trigger('pop', components, locals);
    } else {
      trigger('fetch', components, locals);
    }

    trigger('defer', components, locals);
  });
});
```

## 說明

原本的 mobile.js / desktop.js 處理 route matching 的方式：

```js
history.listen(location => {
  if (location.action === 'POP' && !window.$STATE) return;

  match({
    routes,
    location
  }, (err, redirectLocation, renderProps) => {
    if (err || !renderProps) return;

    const {components} = renderProps;

    const locals = {
      path: location.pathname,
      query: location.query || {},
      params: renderProps.params || {},
      location: location,
      dispatch: store.dispatch,
      getState: store.getState
    };

    if (window.$STATE) {
      delete window.$STATE;
    } else {
      trigger('fetch', components, locals);
    }

    trigger('defer', components, locals);
  });
});
```

注意函數中的第一行，除了 `window.$STATE` 存在的的狀況外，`location.action === 'POP'` 的情況都會被排除。

這會導致 PostListPage 在 `POP` 的情況下無法正確 fetch 資料。

## 操作步驟：

	1. 進入 PostListPage
	2. 點擊任意 post, 進入 PostPage
	3. refresh 該 page
	4. back, back 兩次， console 出現下列錯誤訊息，PostListPage 不再有回應：

```
Uncaught TypeError: Cannot read property 'size' of undefined
    at e.value (PostListPage.jsx:76)
    at f._renderValidatedComponentWithoutOwnerOrContext (ReactCompositeComponent.js:799)
    at f._renderValidatedComponent (ReactCompositeComponent.js:822)
    at f.performInitialMount (ReactCompositeComponent.js:362)
    at f.mountComponent (ReactCompositeComponent.js:258)
    at Object.mountComponent (ReactReconciler.js:46)
    at f.performInitialMount (ReactCompositeComponent.js:371)
    at f.mountComponent (ReactCompositeComponent.js:258)
    at Object.mountComponent (ReactReconciler.js:46)
    at Object.updateChildren (ReactChildReconciler.js:121)
```

修正 `posts.size` 的存取錯誤後，重複上面步驟，PostListPage 無法取得 pagination 及 posts，因此 render 無內容。

## 追查及修正方式

判斷是 react-router-redux 在 PostPage 經過 refresh 之後，原本 postPagination dehydrate 的 state 遺失。

但是 desktop 版卻不會有此問題。發現 desktop 多了 `componentWillReceiveProps()` 函數，在沒有 `posts` 的情況下，會重新 fetch：

```js
  componentWillReceiveProps(nextProps) {
    const {updatePreviousPostPaginationLocationAndParams} = this.props;
    const {location, params, posts, listPost} = nextProps;

    if (!posts) {
      listPost({
        forum: params.alias === 'all' ? '' : params.alias,
        popular: !(location.query && location.query.latest)
      }, true);
    }

    if ((JSON.stringify(this.props.location) !== JSON.stringify(location)) || (JSON.stringify(this.props.params) !== JSON.stringify(params))) {
      updatePreviousPostPaginationLocationAndParams({location, params});
    }
  }
```

但是 mobile 版即使比照辦理，`componentWillReceiveProps()` 函數並沒有被呼叫，因此還是沒有獲得 `posts`。

後來想通了，因為 desktop 版一直有重複 render 多次的問題，也就是 `props` 會一直變化，所以 `componentWillReceiveProps()` 函數會被呼叫許多次，因此有機會檢查 `posts`。但是 mobile 版比較沒有重複 render 的問題，所以 `componentWillReceiveProps()` 函數就恰巧沒有被呼叫。

由於在瀏覽器回上一頁的 react-router 的 `action` 是 `POP`，因此想到是在 mobile.js / desktop.js 中被排除了，所以 `@provideHooks` 無法做對應的處理。解法就是在 `POP` action 時，觸發新的處理機制，暫時命名為 `pop`，如最前面的程式碼。


