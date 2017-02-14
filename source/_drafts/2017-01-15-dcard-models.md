Dcard Models

forum
	fullyAnonymous: 論壇是否全匿名


post
	currentMember: 當前的使用者 (me)，就是這篇 post 的作者


comment
	host: 此 (已發表的) 留言，是本篇文章的作者	



/**
 * @prop post 使用者資訊 (來源可以是 me (在新發文時), post, comment (在顯示及編輯時))。
 * @prop personaType 選擇名稱顯示方式，接受 'default', 'anonymous', 'nickname'。可用於 post, comment。
 *  )
 * @prop isComment 是否為回應。在『全匿名』論壇中，除原始發文者外，回應至少需顯示校名。
 * @prop isHost 是否為原始發文者。只對回應有效。在回應中，針對原始發文者顯示『原PO』字樣。
 * @prop isFullyAnonymous 是否為『全匿名』論壇。
 *  在『全匿名』論壇中：
 *    isPostAnonymous=true: 顯示『匿名』。若為原始發文者，顯示『原PO』。
 *    isPostAnonymous=false: 顯示學校。若為原始發文者，顯示『原PO - 校名』。
 *  在一般論壇中：
 *    isPostAnonymous=true: 顯示學校。。若為原始發文者，顯示原PO - 校名』。
 *    isPostAnonymous=false: 顯示學校及系所。若為原始發文者，顯示原PO - 校名 系所』。
 */
PostAuthor

Post

	const isFullyAnonymous = forum && forum.get && forum.get('fullyAnonymous');

    <PostAuthorHeader post={post} isFullyAnonymous={isFullyAnonymous}>

	    <PostAuthor post={post} isFullyAnonymous={isFullyAnonymous} isPostAnonymous={isPostAnonymous} isComment={isComment}/>


CommentEntry

	const isFullyAnonymous = forum && forum.get && forum.get('fullyAnonymous');
	const isPostAnonymous = post && (isFullyAnonymous && !!post.get('anonymousSchool') || !isFullyAnonymous && !!post.get('anonymousDepartment'));

    <PostAuthorHeader post={comment} isFullyAnonymous={isFullyAnonymous} isPostAnonymous={isPostAnonymous} isComment={true}>

	    <PostAuthor post={post} isFullyAnonymous={isFullyAnonymous} isPostAnonymous={isPostAnonymous isComment={isComment}/>


PostEntry

    <PostAuthor post={post} isFullyAnonymous={forum && forum.get && forum.get('fullyAnonymous')}/>



/**
 * 供發文者選取發文身分。
 *
 * @prop field 用來交換資料的欄位。
 * @prop me 使用者資訊 (來源可以是 me (在新發文時), post, comment (在顯示及編輯時))。
 * @prop isFullyAnonymous 論壇是否為『全匿名』。
 * @prop isComment 是否為回應。在『全匿名』論壇中，除原始發文者外，回應至少需顯示校名。
 * @prop readOnly 發文後不可更改發文身分。
 * @prop canHaveNickname 二階、三階的使用者才能建立『暱稱』。
 * @prop onCreate 建立『暱稱』的處理函數。
 */
PersonaDropdownMenu



forum
	fullyAnonymous


post
	fullyAnonymous

	anonymousSchool
	anonymousDepartment

comment
	anonymous



我目前是使用 post:write 判斷二階以上 user，來決定是否可啟用 persona

目前的 persona scope 為：

persona => 可以看到所有單一身分的資訊, 所有人都有
persona:write => 可以編輯自己單一身分的資訊, 要電話驗證後才有

是否需要改成這樣，以因應未來開放：

persona:read => 可以看到所有單一身分的資訊, 所有人都有
persona:create => 可以建立單一身分，指定的身分才有
persona:write => 可以編輯自己單一身分的資訊, 要電話驗證後才有


### redux

前提：每次 dpsiatch 時，並不必然都會造成 re-render：

```js
export default function createAsyncAction(type, handler, meta) {
  return (...args) => (dispatch, getState) => {
    const ctx = {dispatch, getState};
    const metaData = maybeFunction(meta, args, ctx);

    // 注意這裡多了一次 dispatch
    dispatch({
      type,
      meta: metaData
    });

    return dispatch({
      type,
      meta: metaData,
      payload: handler.apply(ctx, args)
    });
  };
}
```

雖然多了一次 `dispatch`，但實際沒有造成任何 store 變化，因此不會有對應的 render。

### redux-redial

似乎不是在元件建立前執行 fetch，而是先建立元件，再 fetch 資料，然後再傳遞給元件，因此元件至少會 render 兩次。
而且由於首次 render 時，未能得到實際內容，因此相關的 render() 函數，就必須判斷是否有值，導致程式相對複雜。

```js
@provideHooks({
  fetch: ({dispatch}) => {
    return dispatch(listConfig());
  }
})
@connect(state => ({
  configs: state.configs.store
}), {
  setConfig,
  destroyConfig,
  resetForm
})
export default class ConfigListPage extends React.PureComponent {
}
```

注意這裡，由於 `configs` 是由 `state.configs.store` 取得，而這是在 store 初始化時，即建立好的資料，因此 `configs` 不會是 `undefined`，但是若不是像這樣有 immutable `store` 儲存資料的情形，就沒有這樣幸運了：

```js
@provideHooks({
  fetch: ({dispatch, params}) => {
    return dispatch(getComment(params.id)).then((response) => {
      return Promise.all([
        dispatch(getMember(response.payload.memberId)),
        dispatch(listRecentCommentReportOfComment(params.id)),
        dispatch(listCommentVersions(params.id))
      ]);
    })
  }
})
@connect((state, {params}) => ({
  comment: state.comments.store.get(params.id),
  commentReports: state.commentReports.store.get(params.id) && state.commentReports.store.get(params.id).get('reports'),
  commentVersions: state.commentVersions.store.sortBy(item => item.get('updatedAt')).reverse(),
  member: state.members.store
}), {
  getComment,
  updateComment,
  destroyComment,
  solveCommentReportByComment,
  createCommentReport,
  solveCommentReport,
  pushPath
})
export default class CommentPage extends React.PureComponent {
}
```

注意這裡的 `comment: state.comments.store.get(params.id)`，在 `getComment()` 的 dispatch 回傳之前，
該 store.get(params.id) 是沒有東西的。因此，傳入的 `comment` 就是 `undefined`。

因此，程式必須要判斷傳入的 props 是否有值。


## 關於 reducer / pagination

這是 Dcard-Web 最不容易弄懂的部分，因為包裝的太多，隱藏了太多細節，而且 action -> reducer 有太多可以自訂的地方，所以很不容易弄清楚規格。
再加上使用 Immutable，不容易區分哪裡是 Plain JavaScript Object, 哪裡是 Immutable Object。

要弄懂這一部份，要從最根本、也重要的 `createAsyncAction()` 函數開始：

```js
function maybeFunction(data, args, ctx) {
  return typeof data === 'function' ? data.apply(ctx, args) : data;
}

export default function createAsyncAction(type, handler, meta) {
  return (...args) => (dispatch, getState) => {
    const ctx = {dispatch, getState};
    const metaData = maybeFunction(meta, args, ctx);

    dispatch({
      type,
      meta: metaData
    });

    return dispatch({
      type,
      meta: metaData,
      payload: handler.apply(ctx, args)
    });
  };
}
```

此函數會建立一個可供 `redux-thunk` 呼叫的非同步函數。

`createAsyncAction()` 函數的參數：

`type` 是 action type，比較沒有疑問。

`handler` 是真正處理功能的函數，此函數的參數完全可以自訂，此函數通常會回傳 promise。

	Dcard-Web 多數 action 的參數都是 `(id, options, refresh)`。
	`options` 通常是給 api endpoint 的 `query` 參數。
	`refresh` 參數實際上只有 pagination 相關的 reducer 會處理，所以如果沒有 pagination 就完全用不到。
	

`meta` 部分，可以是一個物件，或是一個函數。

	如果是函數，則呼叫 action 的所有參數，會如同 `handler` 一樣，完整的傳遞給 `meta` 函數，而函數預期應該回傳一個物件。
	
	如果需要對不同的 api 呼叫儲存在不同的 pagination，
	譬如 `popular=true` 與 `popular=false` 兩者，內容的排序不同，但項目基本上是相同來源，有可能重疊時，
	則這裡通常須要根據 query 決定並提供 key 屬性，所以經常在 action 中看到 `getPostListKey()` 這樣的函數。

	然後像這樣取得正確的 pagination：
	```js
	const key = getPostListKey(location.query);
	const pagination = state.postPagination.store.get(key);
	```

另外，注意到這裡有兩次 `dispatch` 呼叫，第一次實際上不呼叫 handle，目的是要提供給 reducer 預先做準備或進行清理。

目前只發現一個實際的例子，在 `createPaginationReducer()` 函數，當 `payload` 為空且 `refresh` 為 `true` 時，會清除 `index` 的索引內容。
而 `payload` 為空，正是第一次 `dispatch` 會造成的結果，所以第一次 `dispatch` 可能就只是為了這個目的而存在。

```js
export function createPaginationReducer(listType) {
  return handleActions({

  	  ...

    [listType]: (state, action) => {

      ...

      if (!payload) {
        return {
          ...state,
          store: state.store.set(key, data.merge({
            loading: true,
            index: refresh ? new OrderedSet() : data.get('index')
          }))
        };
      }
    }
  }

```

由於上面的實作方式，`refresh` 預設為 `true`，導致這裡有一個 pagination 容易被忽略的實作關鍵：
就是 list 類的 action __必須__ 實作 meta 的部分，
這樣才可以讓 pagination 的 reducer 不使用預設值，將 `refresh` 設定為 `true`。

譬如：

```js
export const listPost = createAsyncAction(ActionTypes.LIST_POST, function(options) {
  return api('posts?' + qs.stringify(options), {
    method: 'get'
  }, this)
    .then(filterError)
    .then(parseJSON);
},

function(options, refresh) {
  return {
    key: getPostListKey(options),
    refresh
  };
});
```

注意這裡傳給的 `createAsyncAction()` 函數的第二個函數，這就是用來建立 meta 的函數，
當 action 被呼叫時，若沒有明確指定 `refresh` 為 `true`，
由於 meta 函數會得到 action 函數相同的參數，因此 meta 函數被呼叫時，就會得到 `undefined` 的 `refresh`。
這樣的效果，等於是將 `refresh` 的預設值重設為 `false`。

由於 refresh 只有 pagination 會用到，而要讓 pagination 能正確運作，卻又必須覆蓋預設的實作，
所以可以確認，這其實是一個設計或實作錯誤。


最後，從第二次 `dispatch` 也可以看到，每個 reducer 收到的 action，必定包含了三個屬性：`type`, `meta`, `payload`。





