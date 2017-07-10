# Firebase

Firebase 有許多 api 的設計並不是非常嚴謹，譬如 `once`。

> This is equivalent to calling `on()`, and then calling `off()` inside the callback function.

`once` 只監聽指定的事件一次，譬如用在 `value` 事件：

> This event will trigger once with the initial data stored at this location, and then trigger again each time the data changes.

```js
// Basic usage of .once() to read the data located at ref.
var ref = firebase.database.ref();
ref.once('value')
  .then(function(dataSnapshot) {
    console.log(dataSnapshot.key);
  });
```

由於在監聽 `value` 事件時，會立即觸發事件，而不是實際上資料改變 (包含所有的 child 的變動) 時才觸發。
因此，透過 `once` 監聽 `value` 事件時，獲得的是目前已知的值，而不會是遠端同步更新的值。
所以，這跟直接透過 ref 取得資料並沒有不同：

```js
var ref = firebase.database.ref();
console.log(ref.key);
```

又如果監聽的是 `child_added` 事件，

> This event will be triggered once for each initial child at this location, and it will be triggered again every time a new child is added.

由於在監聽 `child_added` 事件時，會立即觸發事件，而不是實際上 child 被加入時才觸發，因此，`once` 監聽到的事件，是原本就存在的 child (initial child)。
然後，由於透過 `once` 只會監聽一次事件，因此只會獲得第一個 child，其餘的 child 都不會被通知。而真正有 child 被加入時，當然也不會被通知。

可以這麼說，`once` 只有在監聽 `child_changed`, `child_removed` 及 `child_moved` 事件時有意義。
但 API 文件上，在說明上面的規格時，範例又偏偏是以上面的例子做說明。

### 參考資料

* [firebase.database.Reference](https://firebase.google.com/docs/reference/js/firebase.database.Reference)
