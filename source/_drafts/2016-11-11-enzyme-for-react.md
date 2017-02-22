# Enzyme for React

### package.json:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx --ignore-pattern src/**/*Test.js",
    "test": "NODE_ENV=test mocha -r test/setup.js src/**/*Test.js",
    "test-lint": "NODE_ENV=test eslint -c test/.eslintrc src/**/*Test.js",
  },
}
```

### setup / css-modules / mocha compiler

#### css-modules

```js
/* global document: true, documentRef: true */
/* eslint no-unused-vars: off */

// es2005 support
require('babel-register')();

// css-module support

require('css-modules-require-hook')({
  generateScopedName: '[name]_[local]_[hash:base64:5]'
});

// babel / jsdom do not support svg, disable image loader with mocha compiler
// 可能是 babel, 因為平常使用 webpack url-loader 先將 svg 打包成 data url,
// 或是 file-loader 將 svg 轉換成路徑，所以 babel 在解析語法時，面對的只是字串，
// 但是因為上面的 emzyme 設定沒使用 webpack，所以 import svg 的檔案被當做一般的 module 載入。

function noop(module) { module.exports = ''; }

require.extensions['.svg'] = noop;
require.extensions['.png'] = noop;
require.extensions['.jpg'] = noop;
require.extensions['.jpeg'] = noop;

// enzyme mount support

const jsdom = require('jsdom').jsdom;
const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

documentRef = document;
```

#### 參考資料：
https://github.com/airbnb/enzyme/issues/408#issuecomment-222752484
https://gist.github.com/diessica/76cdb131ddba6ef103d688ab7165c74e#gistcomment-1874162

### 檔案結構：

```
posts/
	PostAuthor/
		index.js
		PostAuthor.jsx
		PostAuthor.css (如果有的話)
		PostAuthorTest.js
```

### Shallow Rendering：

只 render 目前的元件，將子元件視為 atomic 或 leaf (就像 HTML 內建標籤) 而不 render 子元件的內容。專注在目前元件的 render 結果。

```js
describe('PostAuthor', () => {
  describe('for post (isComment: false)', () => {
    it('should render both school and department when personaType is "default"', () => {
      const personaType = 'default';
      const wrapper = shallow(<PostAuthor post={post} personaType={personaType}/>);
      expect(wrapper.text()).to.contain('學校');
      expect(wrapper.text()).to.contain('系所');
    });
  });
});
```

[API](http://airbnb.io/enzyme/docs/api/shallow.html)

#### shallow 驗證 nested element

下面這個例子，我們想驗證 `Link` 的內容是 `about` 文字：

```js
import {Link} from 'react-router';

export default const About = () => (
  <div>
    <Link to='/about'>about</Link>
  </div>
);
```

```js
import {shallow} from 'enzyme';
import About from './About';

expect(shallow(<About/>).text()).to.contain('about');
```

但是 `shallow(<About/>).text()` 回傳的卻是：

```html
<div><Link/></div>
```

因為 emzyme 不會呼叫 `Link` 的 render，而 `about` 是 `Link` 的 `children`，所以我們無法得到 Link 的內容。

有人[提議](https://github.com/airbnb/enzyme/issues/250)加上 `expand` 選項，讓我們可以 render 指定的子元件。

不過，`shallow()` 回傳的 wrapper 本身也有 `shallow()` 方法，所以我們可以針對需要的子元件，進一步做驗證：

```js
import {shallow} from 'enzyme';
import {Link} from 'react-router';
import About from './About';

expect(shallow(<About/>).find(Link).shallow().text()).to.contain('about');
```

注意到這時候我們必須 import `Link` 元件，這樣 enzyme 才能夠知道如何 render 它。
但這同時也表示，我們的測試必須依賴於其它元件。
因此，這樣的作法並不推薦。因為我們做單元測試時，總是希望能夠不受其他元件的影響，獨立測試。

如果有這種 nesting element 的需求，可以使用後面介紹的 Static Rendering API。

#### 關於 decorator

* @immutableRenderDecorator
* @provideHooks
* @connect
* @reduxForm

由於 decorator 會多包裝一層，會導致 shallow render 失效。

建議：

1. 盡量撰寫 dumb component，
2. 同時 export raw component 及 decorated component，但要注意自行塞入缺少的 props。

### Static Rendering

與 shallow rendering 同樣的，static rendering 輸出的是 html；
不同的是，static rendering 輸出的是完整的 tree。
因此 static rendering 適合用來檢視整個元件的輸出，可以解決上面提到 nesting element 的檢視問題。

```js
import {Link} from 'react-router';

export default const About = () => (
  <div>
    <Link to='/about'>about</Link>
  </div>
);
```

```js
import {render} from 'enzyme';
import About from './About';

expect(render(<About/>).text()).to.contain('about');
```

### Full Rendering

可以處理生命週期事件，可以檢視子元件。

```js
import { mount } from 'enzyme';
import sinon from 'sinon';
import Foo from './Foo';

describe('<Foo />', () => {

  it('calls componentDidMount', () => {
    sinon.spy(Foo.prototype, 'componentDidMount');
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount.calledOnce).to.equal(true);
  });

  it('allows us to set props', () => {
    const wrapper = mount(<Foo bar="baz" />);
    expect(wrapper.props().bar).to.equal("baz");
    wrapper.setProps({ bar: "foo" });
    expect(wrapper.props().bar).to.equal("foo");
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = mount(
      <Foo onButtonClick={onButtonClick} />
    );
    wrapper.find('button').simulate('click');
    expect(onButtonClick.calledOnce).to.equal(true);
  });

});
```

[API](http://airbnb.io/enzyme/docs/api/mount.html)



### 參考資料

* [Enzyme: JavaScript Testing utilities for React](https://medium.com/airbnb-engineering/enzyme-javascript-testing-utilities-for-react-a417e5e5090f#.2aal0fu28)
* [A STEP-BY-STEP TDD APPROACH ON TESTING REACT COMPONENTS USING ENZYME](http://thereignn.ghost.io/a-step-by-step-tdd-approach-on-testing-react-components-using-enzyme/)
* [Using Enzyme with Webpack](https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md)
* [css-modules-require-hook](https://github.com/css-modules/css-modules-require-hook)
