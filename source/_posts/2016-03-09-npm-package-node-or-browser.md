title: "如何判斷 npmjs.com 上的套件，是否支援 node 或 browser"
date: 2016-03-09 01:32:38
comments: true
category:
  - Programming
tags:
  - tutorial
  - Open Source
  - npm
  - node
  - browser
  - AMD
  - CommonJS
  - UMD
---
{% credit credit:"Vítor Santos" link:"https://unsplash.com/photos/GOQ32dlahDk" desc:"意象說明<br><br>工欲善其事必先利其器" %}
![](https://images.unsplash.com/photo-1454587399083-b11b22f48fb6?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=1080&fit=max&s=8a0cb2a646f0d3a30461337998b6c642)
{% endcredit %}

在社群上有網友問到如何判斷 [npmjs.com](https://www.npmjs.com/) (或任意 open source 平台)上的套件，是否支援 node 或 browser，以下我將自己的經驗整理回答如下：

<!-- more -->

1. 首先當然就是先看 readme。通常 for browser 專用的套件，都會直接說明支援哪些瀏覽器，或在哪些瀏覽器測試過。另一個觀察的方式就是看它是否還可以使用 [bower](http://bower.io/) 安裝。

2. 再來，可以了解一下套件提供的功能，自行判斷一下這些功能的實作需要哪些平台功能的支援。由此大概判斷是 for node 或 for browser。

3. 另外，可以看套件本身支援哪種模組格式：

	* 採用 [AMD](http://requirejs.org/docs/whyamd.html) 的話，通常作者只預期可以在 browser 上使用 (但實際上也許可以供 node 使用)，

	* 採用 [UMD](https://github.com/umdjs/umd) 的話，通常作者預期可以同時在 browser 和 node 上使用，

	* 採用 [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1) 的話，通常作者只預期可以在 node 上使用 (但實際上也許可以供 browser 使用)，

	* 採用 [ES2015 module](http://www.2ality.com/2014/09/es6-modules-final.html) 的話，就很難僅憑格式判斷。

	這一點因為現在 [browserify](http://browserify.org/) 和 [webpack](https://webpack.github.io/) 的流行，越來越多人只使用 CommonJS 或 ES2015 格式，所以只能做為參考。

4. 看一下相依的模組，看看有沒有熟悉的模組，這些模組是否只支援特定平台。

5. 掃一下 source code，看看有沒有平台相關的關鍵字，譬如 `window`, `location` (browser) 或 `process`, `readFile` (node) 之類。

6. 如果上面的方式都無法判斷的話，最快的方式就是直接寫測試程式，在目標平台上執行看看。

	因為至少有下面兩項因素會導致套件無法在 browser 上使用：

	* 套件本身或依賴的套件用到了 node 的專屬 API

	不過，類似 [browserify](https://github.com/substack/node-browserify#compatibility) 這樣的工具可以提供簡單的 node API 供 browser 下使用。

	* 用到了一般瀏覽器尚未支援的語言特性

	不過，一樣可以用 [babel](https://babeljs.io/docs/usage/polyfill/) 等工具來克服。

	相反地，如果是要在 node 上使用，怕套件本身或依賴的套件用到了 browser [host object](http://stackoverflow.com/a/7614380/726650) 的話，真的只有直接測試比較快。

7. 最後的絕招，如果在所有的文件上都找不到的話，就直接向作者詢問吧。

	真的要先確認文件上找不到再發問，建議直接發 issue (標示為 Question)，因為其他使用者也可能會想知道答案。大部分的作者都會很熱心回答，不過有時候還是需要耐心等候。

最後，也歡迎大家到我的 [npm](https://www.npmjs.com/~amobiz) 和 [GitHub](https://github.com/amobiz) 針對專案提問或建議，能發 PR 當然是最好了。 <3




