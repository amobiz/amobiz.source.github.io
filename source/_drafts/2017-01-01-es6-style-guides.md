## ES6 Style Guides

## Arrow function

### 最好不要省略括弧

雖然省略 `()` 可以少打兩個字，但是反而不易辨識出函數。不信？去看看數學教科書，哪一個函數會省略括號的？

至少，如果 arrow function 未直接返回值，建議使用 `()` 包圍參數，以表現出函數呼叫的形式。


不好：

```js
handleClick = e => {

};
```

```js
createClickHandler = params => e => {

};
```

好：

```js
handleClick = (e) => {

};
```

```js
createClickHandler = (params) => (e) => {

};
```

由於使用簡寫形式時，在直接返回物件實字 (object literal) 時，必須以 `()` 加以包圍，以避免與函數區塊混淆。
因此，當使用簡寫形式直接返回值時，建議一律使用 `()` 包圍返回值，以便與返回物件的形式一致，也方便記憶。

```js
getPostCount = post => (post.get('count'));
```

