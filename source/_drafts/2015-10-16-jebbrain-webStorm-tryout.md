title: JebBrain WebStorm 使用心得
date: 2015-11-09 23:05:00
comments: true
categories: 
tags:
  - WebStorm
  - IDE
  - JavaScript
  - Linux
---
### 前言

### 問題

NumPad 按鍵無法當作方向鍵 (Linux)

### 解決方案

在 File / Settings > Keymap 找到：
(可以用搜尋的方式，譬如分別輸入 selection, word, down, left, right 與 up，找出下面列出的項目)

Down
Down with Selection: (Shift+Down)
Left
Left with Selection: (Shift+Left)
Right
Right with Selection: (Shift+Right)
Up
Up with Selection: (Shift+Up)
Move Caret to Next Word with Selection: (Ctrl+Shift+Right)
Move Caret to Previous Word with Selection: (Ctrl+Shift+Left)
Move Caret to Next Word: (Ctrl+Right)
Move Caret to Previous Word: (Ctrl+Left)

在上面按下右鍵，選擇 Add Keyboard Shortcut
然後分別按一下對應的按鍵 / 組合鍵
完成後顯示的對應按鍵會出現兩個相同名稱的按鍵組合，譬如：(Shift+Left) (Shift+Left)，但實際上分別對應到一般方向鍵與數字方向鍵。
這樣設定後，就可以使用數字方向鍵控制游標了。

(碎碎念: left, right, up, down, home, end, page down, page up 是常用的按鍵，
不懂新鍵盤為何要把它們分開放在那麼遠的地方，造成手必須移動才能使用，
甚至需要用到眼睛幫忙定位：在主鍵區之外的按鍵，位置真的都太遠了。
難怪 Geek 會選擇使用 Vim。)


### 問題

Symbolic Link (Linux)

若開啟的專案是透過 Symbolic Link 指定，譬如，專案實際位於：

/home/amobiz/projects/json-normalizer

然後 symbolic link 到:

/workspace/json-normalizer

透過 /workspace/json-normalizer 開啟專案之後，
在 edit 的時候，載入的檔案，通常是透過左邊的 project tree 開啟，顯示路徑為 /workspace/json-normalizer/*  (1)
在 debug 的時候，載入的檔案卻顯示為 /home/amobiz/projects/json-normalizer/* (2)，
最困擾的是，檔案似乎被 cache 了，對 tab (1) 的檔案進行修改，並不會反應到 tab (2) 中的檔案，即使重新啟動 debugger 也是一樣。

### 解決方案

（不確定有效性）
執行 File / Synchronize，這是嘗試跟 web server 進行檔案同步，有時是執行這個動作之後，就會詢問檔案已經修改，是否重新載入的訊息。
應該是因此清除了 cache，而偵測到檔案的變動。


### 問題

TODO / Search

WebStorm 可以列出專案中的 Todo Items，但是預設會連同 node_modules 下面的 library 都列出，

### 解決方案

若要排除 node_modules，在 Project Tab 下，在 node_modules 上點右鍵，選擇 『Mark Directory As / Excluded』。

參考:
Ignore node_modules in Webstorm when using navigation pop-up
http://stackoverflow.com/questions/18514438/ignore-node-modules-in-webstorm-when-using-navigation-pop-up

Managing TODO comments in your code
http://blog.jetbrains.com/webide/2012/10/managing-todo/