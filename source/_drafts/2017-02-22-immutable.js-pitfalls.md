# immutable.js pitfalls

### `toJS` 與 `fromJS` 不是可逆的操作

```js
const set = OrderedSet([1, 3, 5, 7]);	// note that `set` is an `OrderedSet`,
const newSet = fromJS(set.toJS())  		// now `newSet` becomes a `List`, not `OrderedSet` anymore.

set.remove(3);							// remove the value `3`, returns a new `OrderedSet` with values of [1, 5, 7].

newSet.remove(3);  						// try to remove the value `3`,
  										// but removed the value `7` at index 3, returns a new `List` with values of [1, 3, 5]
```

什麼時候會遇到？ 在 React server rendering 時，要將 store DEHYDRATE 然後 REHYDRATE 時。

以 Dcard 為例，若先進入首頁，然後進入 MyCollectionPage，此時取消收藏文章，`createPaginationReducer` 的 destroyHandler 可以使用 `data.get('index').remove(action.payload.id)` 正確地刪除對應的 id。

這是因為 pagination 還需要指定 pagination key，所以若不先進入 MyCollectionPage，則 server rendering 時，對應的 pagination key 的資料完全不存在，所以不會受到 DEHYDRATE 及 REHYDRATE 的影響。

但若是先進入 MyCollectionPage 頁面，注意此時 MyCollectionPage 的資料是 server rendering 好的，所以資料需經過 DEHYDRATE 及 REHYDRATE，此時 `OrderedSet` 就被轉換為 List 了，因此取消收藏文章會失敗。這是因為 post id 數值很大，而 `List` 將該數值視為是 index，所以無法正確刪除。

解決方式：利用 `toJS` 的 `reviver` 參數，自行控制轉換機制：

原本：

```js
    [ActionTypes.REHYDRATE]: state => ({
      ...state,
      store: fromJS(state.store)
    }),

```

改進：

    [ActionTypes.REHYDRATE]: state => ({
      ...state,
      store: fromJS(state.store,
        (key, value) => (key === 'index' ? value.toOrderedSet() : value.toMap()))
    }),

```


另外，Dcard 常見的寫法：

```js
  [ActionTypes.REHYDRATE]: state => ({
    ...state,
    store: new OrderedMap().withMutations(map => {
      state.store.forEach(item => {
        map.set(item.id, fromJS(item));
      });
    })
  }),
```

可以改為：

```js
  [ActionTypes.REHYDRATE]: state => ({
    ...state,
    store: Immutable.Seq(state.store).toOrderedMap()
  }),
```

#### 參考資料：

[Converting from JS objects](https://github.com/facebook/immutable-js/wiki/Converting-from-JS-objects#custom-conversion)
[fromJS()](https://facebook.github.io/immutable-js/docs/#/fromJS)



