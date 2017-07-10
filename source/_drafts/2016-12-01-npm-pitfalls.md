# npm 疑難雜症

## DTraceProviderBindings

執行 `npm run dev` 時出現：

Error: Cannot find module './build/Release/DTraceProviderBindings'

根據[這個說法](https://github.com/trentm/node-bunyan/issues/216#issuecomment-243281568)，這是因為 bunyan 必須使用 Python 2.7 才行，而 Mac 預設使用 Phthon 3.x。

另外，也有說法是 bunyan 找不到可選的相依模組造成。

根據[這個說法](https://github.com/trentm/node-bunyan/issues/216#issuecomment-150802443)，經過試驗確認，可以使用 `npm install --no-optional` 暫時消除錯誤訊息。不過恐怕會造成某些模組因缺乏可選性相依模組而有不同行為，不建議使用。

相關的文章：[解决hexo神烦的DTraceProviderBindings MODULE_NOT_FOUND](https://kikoroc.com/2016/05/04/resolve-hexo-DTraceProviderBindings-MODULE-NOT-FOUND.html)

結論：暫時忽略錯誤訊息。

### 2017/05/31 更新

如果出現 this version requires NODE_MODULE_VERSION 41 之類的訊息，可以試著執行 `npm rebuild` 重新 compile dtrace module。
