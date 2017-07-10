# Modern CSS Structure and Layout Tricks

### 偏好使用 flexbox 排版


### 元素置中用 transform 就好，不要再考慮舊的技巧了



### 偏好在父元件中設定子元件的排版方式

案例：假設我們有多個按鈕，按鈕之間希望能有固定的間距，然後所有的按鈕要一起置中顯示。

與其在個別子元件中設定 `margin` 等間距：

```css {
.buttons {
  display: flex;
  justify-content: center;
}

.btn {
  margin-right: 8px;

  &:last-child {
    margin-right: 0;
  }
}
```

偏好在 container 中設定：

```css
.buttons {
  display: flex;
  justify-content: center;

  & > * {
    margin-right: 8px;
  }

  & > *:last-child {
    margin-right: 0;
  }
}
```

理由是：

1. 排版本來就是容器元件的責任，
2. 個別的子元件可以不需要是相同的類別，
3. 結構變動時，不需要為新增或移除的子元件重新調整間距等設定。

