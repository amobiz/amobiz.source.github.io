# React Tricks

## Pitfalls

### 容易拼錯字，而且通常不會得到警告

由於 React 元件的屬性是透過 `props` 傳遞，因此有個致命的缺點，就是容易拼錯字。

React Team 顯然知道有這個問題，所以讓我們可以透過定義 `propTypes`，讓 React development runtime 檢查傳入元件的屬性。但是即使這麼做了，也只能減少三分之一出錯的機會。因為如上所述，React development runtime 只會檢查傳入元件的屬性，而其他使用到屬性的地方，並不會做檢查。而一般的 lint 語法檢查工具，並不會參考 `propTypes` 的定義，並據此對 `props` 的存取進行檢測並提出警告，所以並沒有辦法幫上什麼忙。至於另外三分之一出錯的機會，還是跟 `propTypes` 有關，那就是 React development runtime 只會針對在 `propTypes` 列出的屬性進行檢查，而沒有列出的，即使元件實際上並不使用該屬性，也不會提出警告，所以，當拼錯字時，如果該屬性不是必要的屬性的話 (透過 PropTypes 的 `isRequired` 定義)，就不會提出警告了！

但這跟 destructing 語法其實沒有太大的關係，
使用 ES6 的 destructing 語法，由 `props` 取出屬性時，雖然有可以很明確看出取出了哪些屬性，

```js
class MyComponent extends PureComponent {
  static propTypes {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func
  };

  render() {
    const {values} = this.prop;  // ......(1)

    return (
      <input values={values} onChange={this.handleOnChange}/> // ...(2)
    );
  }

  handleChange = (e) => {
    const {onChange} = this.props;
    onChange(e.target.value);
  };
}
```

上面的例子中，
(1) 應該是 `value`, `this.props`，但分別拼錯為 `values`, `this.prop`，不過都不會被警告。
(2) 應該是 `handleChange`，但拼錯為 `handleOnChange`，但因為透過 `this` 存取，所以不會檢查 `handleOnChange` 未定義。


```js
<MyComponent
  values={'hello'}                    // .....(1)
  onChanged={this.handleChanged}/>    // .....(2)
```

上面的例子中，
(1) 實際上應該是 `value`，但拼錯為 `values`，不過幸好此屬性被定義為 `isRequired`，所以 React 會提出警告，表示缺少元件需要的 `value` 屬性。
(2) 實際上應該是 `onChange`，但拚錯為 `onChanged`，由於 `onChange` 屬性不是 `isRequired`，所以 React 不會提出警告，不會告訴我們沒有提供 `onChange` 屬性，也不會告訴我們，我們提供的 `onChanged` 屬性元件並不接受。

有沒有解決辦法？如果有 lint 工具能夠支援 `propTypes` 的定義，也許就可以透過 lint 解決。或者，使用 TypeScript 來進行進行，並且將 `propTypes` 定義為 shape，就可以強制檢查了。但是說實話，TypeScript 的生態，並不像 ES6 廣泛受到支援，遇到問題時，也比較不容易得到幫助或解答。

## 盡量將元件 Functionl 化

元件內聚性越高，與其他元件的耦合性越低，就越容易重複使用。
Functional 元件本身不維護 state 狀態，所有的狀態都是透過 `props` 傳入，
因此，元件本身不需要知道如何獲取資料，或是如何修改資料。

## 若使用 redux，使用 `@connect` 直接由 `store` 抓取資料，或注入 action

雖然原則上我們極力將大部分的元件寫成 Functional Component (或稱為 Dumb Component)，
然後最外層使用 Container Component (或稱為 Smart Component)，負責擷取資料，注入 action 等，
處理應用程式邏輯相關的雜務，但若整個應用較為龐大，往往會產生較深的元件樹，導致資料必須由最上層一路傳遞到最下層，
大量的程式碼只是將屬性由 `props` 中取出，然後再往下一層元件傳遞，這樣不但容易遺漏、或是拼錯屬性名稱，
而且往往在某些屬性已經廢棄不用之後，也不會被移除，導致最後沒有人知道這些屬性的用途，而不敢去動這些屬性。

為避免由最外層的元件，一層一層地傳遞 props 到深層元件，可以使用 `@connect` 直接由 `store` 抓取資料，或注入 action。
原則就是，

```js
@connect(state => ({
  isLogin: state.app.isLogin,
  forums: state.forums.store,
  posts: state.posts.store
}))
export default class PostList extends React.PureComponent {
  static propTypes = {
    pagination: PropTypes.object,
    isShowDate: PropTypes.bool,
    isGroupByDate: PropTypes.bool,
    forumAlias: PropTypes.string,
    sideBarAction: PropTypes.func,

    isLogin: PropTypes.bool,
    posts: PropTypes.object.isRequired,
    forums: PropTypes.object.isRequired,

    submitting: PropTypes.object,
    onLikePostClick: PropTypes.func,
    onCollectPostClick: PropTypes.func
  };

  render() {
    return (
      <div>
        {this.renderEntries()}
        <div className={styles.footer}>
          {this.renderFooter()}
        </div>
      </div>
    );
  }

  renderEntries() {
    const {posts, pagination, isLogin, isShowDate, isGroupByDate, sideBarAction, forums, forumAlias, submitting, onLikePostClick, onCollectPostClick} = this.props;
    let lastYear = 0, lastMonth = 0;

    if (pagination && forums && forums.count()) {
      return pagination.get('index')
      .map(id => posts.get(id))
      .valueSeq()
      .filter(post => post)
      .map((post, i) => {
        const id = post.get('id');
        const forum = forums.find(forum => forum.get('alias') === post.get('forumAlias'));
        const entry = (
          <div key={id} className={styles.entry}>
            <div className={styles.wrapper}>
              <PostEntry
                isShowForum={!forumAlias || forumAlias==='featured'}
                isShowDate={isShowDate}
                isLogin={isLogin}
                forum={forum}
                post={post}
                submitting={submitting}
                sideBarAction={sideBarAction}
                onLikePostClick={onLikePostClick}
                onCollectPostClick={onCollectPostClick}/>
            </div>
          </div>
        );

        if (isGroupByDate) {
          const date = new Date(post.get('createdAt'));
          const year = date.getFullYear();
          const month = date.getMonth() + 1;

          if (year !== lastYear || month !== lastMonth) {
            const category = (
              <div key={`date-${i}`} className={styles.postDateGroup}>
                <div className={styles.postDateGroupWrapper}>
                  <FormattedMessage id='common.yearMonth' values={{year, month}}/>
                </div>
              </div>
            );

            lastYear = year;
            lastMonth = month;

            return [
              category,
              entry
            ];
          }
        }

        return entry;
      }).flatten().toArray();
    }
  }
}
```

## 萃取出多個元件共用的行為

__PostActionHelper.jsx__

```js
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import omit from 'lodash/omit';

import {
  likePost,
  unlikePost,
  collectPost,
  uncollectPost} from '../../../actions/posts';
import {pushToast} from '../../../actions/toasts';

import {checkRequiredScope} from '../../../utils/threeStagesCheck';

@connect((state) => ({
  app: state.app,
  me: state.app.me,
  isLogin: state.app.isLogin
}), {
  likePost,
  unlikePost,
  collectPost,
  uncollectPost,
  pushToast
})
export default class PostActionHelper extends React.PureComponent {
  static propTypes = {
    Component: PropTypes.func.isRequired,
    likePost: PropTypes.func.isRequired,
    unlikePost: PropTypes.func.isRequired,
    collectPost: PropTypes.func.isRequired,
    uncollectPost: PropTypes.func.isRequired
  };

  state = {
    submitting: {
      likePost: false
    }
  };

  render() {
    const {Component} = this.props;
    const props = omit(this.props, [
      'Component', 'likePost', 'unlikePost', 'collectPost', 'uncollectPost'
    ]);

    return (
      <Component {...props} {...this.state}
        onLikePostClick={this.handleLikePostClick}
        onCollectPostClick={this.handleCollectPostClick}/>
    );
  }

  checkPrerequisite = (action, message) => {
    const {pushToast, me, isLogin} = this.props;

    if (!isLogin) {
      pushToast({content: '請先登入 Dcard！'});
      return false;
    }

    const scopes = me.get('scopes');
    const error = checkRequiredScope(scopes, action);
    if (error) {
      pushToast({content: `${error}${message}！`});
      return false;
    }

    return true;
  };

  handleLikePostClick = (post) => {
    const {likePost, unlikePost} = this.props;
    const {submitting} = this.state;
    const id = post.get('id');

    if (submitting.likePost) return;

    if (!this.checkPrerequisite('like', '就可以送出愛心囉')) return;

    this.setState({
      submitting: {
        ...submitting,
        likePost: true
      }
    }, () => {
      const action = post.get('liked') ? unlikePost : likePost;
      action(id).then(() => {
        this.setState({
          submitting: {
            ...submitting,
            likePost: false
          }
        });
      });
    });
  };

  handleCollectPostClick = (post) => {
    if (!this.checkPrerequisite('collect', '就可以收藏文章囉')) return;

    const {collectPost, uncollectPost} = this.props;
    if (post.get('collected')) {
      uncollectPost(post.get('id'));
    } else {
      collectPost(post.get('id'));
    }
  };
}
```

__withPostActions.js__

```js
export default (Component) => (props) => (
  <PostActionHelper {...props} Component={Component}/>
);
```

### 將 HOC 主要內容元件化的注意事項

HOC 基本上就是一個函數，而我們在 HOC 函數中動態建立新的元件，然後將它回傳。
然而，由於在函數中動態建立物件時，基本上每次都會建立一個全新的物件，而不是重複使用該物件，
這樣一來，每次使用 HOC 時，就會建立一份全新的，但功能完全相同的物件。所以可以考慮將元件抽取出來，獨立寫成一個模組，這樣 HOC 就可以重複使用此元件，而不是每次都建立全新的物件。

不過，這樣做有一個問題，就是要被包裹/修改的元件 (以下稱 wrapped component) 要如何傳遞給包裹元件 (以下稱 helper component)？
基本上，就只能透過 `props` 傳遞，但這樣有一個致命缺陷：當透過 `props` 傳遞元件時，必須為該屬性命名，而 HOC 常常會一個包覆一個，
這樣就會有 `props` 屬性名稱衝突問題。

譬如我們希望將 wrapped component 以 `Component` 的名稱傳遞給 helper component。我們可能會這樣寫：

```js
const withPostActions = (Component) => (
  <PostActionHelper Component={Component}/>
);

class PostActionHelper extends React.PureComponent {
  render() {
    const {Component} = this.props;

    return (
      <Component {...this.props}/>
    );
  }
}
```

若是同時有另一組 HOC 也是透過 `Component` 的名稱來傳遞 wrapped component：

```js
withCommentActions = (Component) => (
  <CommentActionHelper Component={Component}/>
);

class CommentActionHelper extends React.PureComponent {
  render() {
    const {Component, ...props} = this.props;

    return (
      <Component {...props}/>
    );
  }
}
```

```js
const withAnalytic = (Component) => (
  <AnalyticHelper Component={Component}/>
);

class AnalyticHelper extends React.PureComponent {
  render() {
    const {Component} = this.props;

    return (
      <Component {...this.props}/>
    );
  }
}

@withPostActions
@withAnalytic
export default class PostPage extends React.PureComponent {
  render() {
    ...
  }
}
```


```js
withPostActions(withAnalytic(PostPage));
```

```js
// 1. 這裡實際傳入的是 withAnalytic，
//    為了方便說明，我們這裡直接將它展開，
//    可以當作傳入的 Component 就是 AnalyticHelper
const withPostActions = (AnalyticHelper) => (
  // 2. 但是 AnalyticHelper 是透過 Component 屬性傳入
  createElement(PostActionHelper, {Component: AnalyticHelper})
);

class PostActionHelper extends React.PureComponent {
  render() {
    // 3. 記得傳入的 Component 屬性實際上就是 AnalyticHelper 吧？
    //    所以把 Component 屬性指定給 AnalyticHelper 常數，這樣比較容易看。
    //    記住，Component 屬性是指向 AnalyticHelper！
    const {Component: AnalyticHelper} = this.props;

    // 4. 我們希望把傳入的全部屬性，全部傳遞給 AnalyticHelper，
    //    但是，記得吧？(不記得？請往上看第三點最後一行) Component 屬性是指向 AnalyticHelper！
    //    看到沒，我們期望 AnalyticHelper 拿到的 Component 是 PostPage，
    //    但由於屬性名稱衝突，它現在拿到的是它自已！
    return (
      <AnalyticHelper {...this.props}/>
    );
  }
}

解法：

既然是屬性名稱衝突，那就不要讓名稱衝突就好了。但是怎麼做呢？

原本嘗試要使用 Symbol 來解決 `props` 屬性名稱衝突的問題，但是：
1. 目前 React 不支援 `props` 的屬性名稱以 Symbol 來表示，
2. 若考慮到 server rendering 的需要，由於 Symbol 無法被 DEHYDRATE，因此可以推論，未來 React 也不會支援 Symbol 屬性。

所以，最簡單的方式，就是在屬性名稱前面加上 module name space。
不過為了避免不小心拼錯屬性名稱的問題，可以由 helper 自行匯出 (export) 出屬性名稱，讓 HOC 引用 (import) 該名稱，這樣就不用在不同的地方重複寫兩次屬性名稱，造成拼錯的問題。

```js
export const ComponentProp = 'PostActionsHelper.Component';
export default class PostActionsHelper extends React.PureComponent {
  static propTypes = {
    [ComponentProp]: PropTypes.func.isRequired
  };

  render() {
    const {[ComponentProp]: Component, ...props} = this.props;

    return (
      <Component {...props}/>
    );
  }
}
```

## 加速 Functional Component 的 render 速度

```jsx
<Component {...props}/>
```

v.s.

```jsx
{Component(props)}
```

* [45% Faster React Functional Components, Now](https://medium.com/missive-app/45-faster-react-functional-components-now-3509a668e69f)

* [React inline elements transform](https://babeljs.io/docs/plugins/transform-react-inline-elements/)

