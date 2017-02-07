# HTML Tricks

### Key


非 input 類的 element，若要能得到 key event，必須設定 `tabindex` 屬性，這樣它才有機會得到 focus，然後才能接受 key event。
如果其有 input 類型子元件，或者任意子元件有設定 `tabindex` 屬性，則該元件應該能透過 event propagation 而得到 key event。
當然，獲得 key event 的前提是，該元件或任意子元件已經獲得 focus，且中間的元件都未攔截該事件，唯有如此，該元件才能接收到 key event。

```js
render() {
  return (
    <div tabIndex='0' onKeyDown={this.handleKeyDown}>
      Click Me
    </div>
  );
}

onKeyDown = (e) => {
  console.log(e.key);	
}
```

如果希望在未獲得 focus 時也能處理 key event，則可以透過 window 來監聽 key event，同樣以 React 為例：

```js
componentDidMount() {
  window.addEventListener('keydown', this.handleKeyDown);
}

componentWillUnmount() {
  window.removeEventListener('keydown', this.handleKeyDown);
}
```

參考：

[You'll need to assign a tabIndex-attribute for your element (the wrapping element for example) for it to receive keypresses](http://stackoverflow.com/a/32445016/726650)
[The DOM wants the element to be focused in order to receive the keyboard event](http://stackoverflow.com/a/40432014/726650)