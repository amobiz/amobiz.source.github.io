# redux-form vs immutable.js


### redux-form 5.x

TL;DR: redux-form 5.x 不支援 immutable.js。

由於 redux-form 會嘗試 `deepEqual` 存取 value 的 `length` 屬性 (在 [`ReduxForm.prototype.componentWillReceiveProp`](https://github.com/erikras/redux-form/blob/v5/src/createHigherOrderComponent.js#L57))，以判斷物件類型，
而 immutable 的 `length` 屬性已 deprecated，會發出一堆 warning log。

[作者建議的做法](https://github.com/erikras/redux-form/issues/110#issuecomment-144839263)：

```js
import Immutable from 'immutable';
import {reducer as formReducer} from 'redux-form';

const immutableize = reducer => (state, action) =>
  Immutable.fromJS(reducer(state.toJS(), action));

const immutableFormReducer = immutableize(formReducer);
```

由於 Draft.js 的資料是存放在 `EditorState` 中，內部是一個 immutable 物件。
如前所述，由於 redix-form 會嘗試 `deepEqual` 存取 value 的 `length` 屬性，
因此，即使如下嘗試將 immutable 物件包裹在一個物件中，也無法避免上述問題。


```js
class Wrapper extends React.PureComponent {
  static propTypes = {
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired
  };

  handleChange = (value) => {
    const {onChange} = this.props;

    onChange(value.editorState);
  };

  render() {
    return React.cloneElement(this.props.children, {
      ...this.props,
      value: {
        editorState: this.props.value
      },
      onChange: this.handleChange
    });
  }
}
```

幾個避開的想法：

1. 5.x 依賴 [deep-equal](https://github.com/substack/node-deep-equal) 模組，可以發 PR，或是直接覆寫，避開 immutable 物件。
  [Iterable](https://github.com/facebook/immutable-js/blob/c65062599ecad54a1ad5bacd72f65e8f9ef7449b/src/Iterable.js)

  ```js
  import {IS_ITERABLE_SENTINEL} from 'immutable/Iterable';
  import {deepEqual} from 'immutable/utils/deepEqual'

  export function deepEqual(a, b, opt) {
    if (a === b) return true;

    if (a[IS_ITERABLE_SENTINEL] && && b[IS_ITERABLE_SENTINEL]) {
      return deepEqual(a, b);
    }

    ...
  }
  ```

2. 覆寫 `createHigherOrderComponent()` 回傳的 component 的 `componentWillReceiveProp()` 函數

   但是 [`readFields()`](https://github.com/erikras/redux-form/blob/e285aca18ee0576a4e39c5440aef593d1dc63d7f/src/readFields.js) 函數很麻煩：
   
3. 傳入的 `initialValues` 不要包含 immutable 物件

  避免 form 的資料回流到 `initialValues`? 應該不行，它也會檢查 `fields`。



### redux-form 6.x

[redux-form 6.x 已經支援 immutable.js](http://redux-form.com/6.0.0-rc.1/examples/immutable/)。

