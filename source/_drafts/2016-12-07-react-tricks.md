React 雕蟲小技


### Component Refactoring

當要修改的元件牽涉到介面變動時，

1. 複製該元件，
   譬如，原 component 名稱為 Component，將複製的元件命名為 ComponentEx，

2. 複製該元件的消費者元件，
   若該元件被一或多個其他元件使用，從中隨意選取 (或視情況選擇最簡單或最複雜的) 一個元件，
   假設消費者元件為 Container，將其複製為 ContainerEx，

3. 修改消費者元件，
   撰寫測試，令 ContainerEx 以預期的使用方式使用 ComponentEx，然後測試失敗，

4. 修改 ComponentEx 元件，直到通過測試，

5. 如果有他消費者元件，重複步驟 2 ~ 3，直到所有已修改的元件都通過測試，

6. 將所有消費者元件的消費者元件，改為引用新的消費者元件，如 ContainerEx，
   重複步驟 3 ~ 5，直到所有的測試通過，

7. 刪除原 Component，
   將 ComponentEx 重新命名為 Component，將所有 ComponentEx 的引用，改為 Component，
   將所有消費者元件，如 ContainerEx，重新命名為 Container，
   將所有 ContainerEx 的引用，改為 Container。


### Pass Props

```js
import MyComponent from './MyComponent'

function Parent(props) {
	return (
		<MyComponent {..props}/>
	);
}
```

#### 吝嗇 (rest spread operator)

```js
function Parent(props) {
	const {onwProp1, ownProp2, ...childProps} = props;

	return (
		<MyComponent {...childProps}/>
	);
}
```
 
#### 吝嗇 (lodash/omit)

```js
import omit from 'lodash/omit';

function Parent(props) {
	const childProps = omit(props, Object.keys(Parent.propTypes));

	return (
		<MyComponent {...childProps}/>
	);
}

Parent.propTypes = {
	onwProp1: PropTypes.object,
	onwProp2: PropTypes.object
}
```

### Decorator / HOC

```js
function hoc(MyComponent) {
	return func(props) {
		return (
			<MyComponent {..props}/>
		);
	};
}
```

### Inject Props

```js
function Parent(props) {
	return (
		<div>
			React.Children.map(this.children, 
	);
}
```

