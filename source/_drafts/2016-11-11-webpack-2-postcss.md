Webpack postcss


1. postcss-import 最好加上 `path`，這樣 `@import` 時，可以簡化路徑。

	譬如，

	before:

	```css
	@import "../../styles/_variables.css";
	```

	after:

	```css
	@import "styles/_variables.css";
	```

2. postcss-import 最好搭配 postcss-url，這樣可以處理好 image url 的相對路徑。
	搭配使用 postcss-custom-properties (或 postcss-variables) 時，定義 image 的路徑應該使用 `url(../path/to/image.svg)` 的形式，這樣 postcss-url 就可以幫忙處理路徑。

	譬如，

	假設使用了 webpack extractPlugin 取出 stylesheet。
	目錄為：

	src/
	  styles/
	    _variables.css
	  images/
	    plus.svg
	  components/
	    MyComponent/
	      index.js
	  	  MyComponent.jsx
	  	  MyComponent.css

	before:

	未使用 postcss-url，且不使用 `url()` 定義 image 路徑時，由於只是字串的取代，此時路徑必須相對於 .jsx 檔案的所在，所以若有 .jsx 在不同層次的目錄下，就只能重複定義：

	```css
	/* _variables.css */
	:root {
	  --icon: '../../images/plus.svg';
	}
	```

	```css
	/* MyComponent.css */
	@import "../../styles/_variables.css"

	.icon {
	  background: url(var(--icon)) no-repeat;
	}
	```

	```jsx
	import styles from './MyComponent.css';
	```

	before 2:

	未使用 postcss-url，定義 image 路徑時，若使用了 `url()`，則必須相對於 style 檔案的所在 ?

	```css
	/* _variables.css */
	:root {
	  --icon: url(../images/plus.svg);
	}
	```

	```css
	/* MyComponent.css */
	@import "../../styles/_variables.css"

	.icon {
	  background: url(var(--icon)) no-repeat;
	}
	```

	```jsx
	import styles from './MyComponent.css';
	```

	after:

	使用 postcss-url 之後，定義 image 路徑時，只要相對於 .jsx 檔案的所在：

	```css
	/* _variables.css */
	:root {
	  --icon: url(../images/plus.svg);
	}
	```

	```css
	/* MyComponent.css */
	@import "styles/_variables.css"

	.icon {
	  background: var(--icon) no-repeat;
	}
	```

	```jsx
	import styles from './MyComponent.css';
	```


```json
  postcss: webpack => ([
    postcssImport({
      path: join(__dirname, '../src'),
      addDependencyTo: webpack
    }),
    postcssUrl(),	// 文件上說必須加上 `from`, `to`，但沒加似乎就可以正常運作。
    postcssMixins(),
    postcssVariables(),
    postcssNested(),
    cssnext({
      features: {
        customProperties: false,
        nesting: false
      }
    }),
    cssnano({
      zindex: false,
      autoprefixer: false
    })
  ]),
```
