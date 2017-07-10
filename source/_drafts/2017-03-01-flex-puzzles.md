# Flex Puzzles


### 讓 items 置中 (類似 margin: 0 auto)，但是 item 又能夠靠前對齊 (就像 `justify-content: flex-start` 的效果)。前提：不必設定 container 的大小，因為 container 也希望隨畫面自動縮放。 (無解，考慮用 grid)

期望：

| OOOOOOOOOO |
| OOOOOOOOOO |
|   OOOOOO   |


```css
.container {
  display: flex;
  flex-wrap: wrap;
}

.container > * {
  flex: 0 0 auto;
}
```

輸出：

|OOOOOOOOOO  |
|OOOOOOOOOO  |
|OOOOOO      |


```css
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.container > * {
  flex: 0 0 auto;
}
```

輸出：

| OOOOOOOOOO |
| OOOOOOOOOO |
|   OOOOOO   |
