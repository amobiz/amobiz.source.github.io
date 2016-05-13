

看了 Gias Kay Lee 大大的連結文章才知道有 indirect eval call 這種東西。

稍微摘要一下 (如果有錯請鞭小力一點)：

一個函數呼叫稱為 CallExpression，並可區分為兩部份，MemberExpression 部份和 Arguments 部份，
因此 `eval("a = 0")` 的 MemberExpression 是 `eval`，Arguments 是 `("a = 0")`。

在 strict mode 下，如果直接像 `eval("...")` 這樣呼叫 `eval` 函數，或是 `(eval)("...")`，這裡有點小複雜，但可以簡單看作 `(eval)` 去掉括號後，剩下 `eval`，此時我們說 MemberExpression 就是 `eval`。而當 MemberExpression 就是 `eval` 時，稱為 direct eval call。

因為 `eval` 函數本身的特殊性，JavaScript 在執行 `eval` 函數時會做特別的處理。根據 es5 規定，在 strict mode 下， direct eval call 必須在 caller function scope 下進行。

相對地，任何不是 `eval("...")` 的呼叫，都是 indirect eval call。根據 es5 規定，在 strict mode 下， indirect eval call 必須在 global scope 下進行。

因此， `(0, eval)("...")` 的 MemberExpression，去掉外部的括號後是 `0, eval`，由於 `0, eval` 並不是 `eval`，所以這是 indirect eval call，且執行的結果，作用在 global scope 下。

至於 `0, eval` 本身，則只是普通的使用 comma operator 分隔的運算式。由左至右依序執行，並得出最後結果，也就是得到 `eval` 函數本身。

由於只要 MemberExpression 不是正好等於 `"eval"` 的情況就是 indirect eval call，因此我們可以使用任意 `eval` 以外的變數指向 eval 函數，像這樣 `var geval = eval; geval("...");`，甚至於 `window.eval("...")`，就可以達成 indirect eval call 的目的。這是比較簡單的重複使用方法。

最後，使用 indirect eval call 的目的，則是為了不受 function scope 限制。

