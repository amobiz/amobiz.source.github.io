# React-Perf


## 寫一個 enzyme test tool，可以檢查元件是否有執行不必要的 render。

assert(Perf.printWasted().length === 0);


安裝 [react-addons-perf](https://facebook.github.io/react/docs/perf.html)

```bash
npm i -D react-addons-perf
```

### 方法一，使用 [React Perf](https://github.com/crysislinux/chrome-react-perf) [chrome extension](https://chrome.google.com/webstore/detail/react-perf/hacmcodfllhbnekmghgdlplbdnahmhmm)

if (typeof window !== 'undefined') {
  window.Perf = require('react-addons-perf').default;
}

### 方法二，react-perf-component

注意，此方法用到 `componentDidMount()`，所以 server rendering 時會出現以下錯誤訊息：

```
ReactDebugTool.js:227 Uncaught DOMException: Failed to execute 'measure' on 'Performance': The mark '91::componentDidMount' does not exist.
```

另外，此方法在 `componentDidUpdate()` 才列印訊息，所以父元件若沒有更新子元件 (或者本身是最上層元件)，或者確實已做好最佳化，不會有多餘的 render，就不會有訊息出現。

安裝 [react-perf-component](https://github.com/sheepsteak/react-perf-component)

```bash
npm i -D react-perf-component
```

針對要測試的元件，在 `development` mode 下：

```js
import React, {PropTypes} from 'react';
import perf from 'react-perf-component';

@perf
export default class MyComponent extends React.Component {

}
```