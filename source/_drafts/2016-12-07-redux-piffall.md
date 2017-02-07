Redux piffall

在 `@connect` 裡，應該盡量避免回傳新建立的物件。
正常情況下這麼做是沒有問題的，
但是若 `componentWillReceiveProps()` 等 lifecycle 函數也會更動到 state，將會造成無窮迴圈。

```
ReactDebugTool.js:29 Uncaught RangeError: Maximum call stack size exceeded(…)
```

然後會出現一堆：

```
warning.js:36 Warning: performUpdateIfNecessary: Unexpected batch number (current 1757, pending 1752)
```

這則訊息在 React 有一則相關的 issue:

https://github.com/facebook/react/issues/6895

不過，其實應該都是程式本身的問題，而不是 React 的問題。


```js
@connect(state => ({
  me: state.app.me,
  configs: state.configs.store,
  tags: state.trending.tags,
  forums: state.forums && state.forums.store.filter(forum => !forum.get('invisible')),	// filter 之後建立新物件，被判定為 props 已改變
  forumGroupStatus: state.forumGroups.status,
  regulationAgreed: state.regulation.regulationAgreed
}), {
  pushModal,
  popModal,
  replaceModal
})
export default class ForumListPage extends React.Component {
  componentWillReceiveProps(nextProps) {
    const {location, params, replaceModal, getTrendingTags} = nextProps;
    this.checkRegulation(nextProps);

    if (location.state && location.state.stage) {	
      replaceModal({													// 會改變 location.state，進而影響 store，於是又進入 @connect
        element: <ThreeStageModal stage={location.state.stage}/>,
        isTransparent: true
      });
    }
  }
}
```

以這個例子為例，可以考慮將 filter 之後的 `forums` 儲存在 state 中：


```js
@connect(state => ({
  me: state.app.me,
  configs: state.configs.store,
  tags: state.trending.tags,
  forums: state.forums && state.forums.store,
  forumGroupStatus: state.forumGroups.status,
  regulationAgreed: state.regulation.regulationAgreed
}), {
  pushModal,
  popModal,
  replaceModal
})
export default class ForumListPage extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {
  	  forums: props.forums && props.forums.filter(forum => !forum.get('invisible'))
  	};
  }

  componentWillReceiveProps(nextProps) {
    const {location, params, replaceModal, getTrendingTags} = nextProps;
    this.checkRegulation(nextProps);

    if (location.state && location.state.stage) {	
      replaceModal({
        element: <ThreeStageModal stage={location.state.stage}/>,
        isTransparent: true
      });
    }
  }
}
```

## dispatch action

Redux 的 `@connect` 第二個參數，可以傳入 action，然後 redux 會以 `dispatch` 加以包裝，成為可以呼叫的函數：

```js
@connect((state) => ({
  values: ...
}), {
  actionMethod...
})
```

此功能雖然很方便，但是有一個不好的 pattern 及兩個狀況容易發生錯誤：

1. deep props


2. 變數


3. not defined

```js
const {pushPath} = this.props;
```

實際上 `pushPath` 從未被傳入，但是 lint 語法檢查並無法發現。


