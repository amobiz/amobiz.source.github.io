title: "AngularJS 學習筆記"
date: 2016-04-13 03:03:00
comments: true
category:
  - Programming
tags:
  - notes
  - AngularJS
---

## 前言

#### Directive Factory

要建立自定義的 directive 時，需要呼叫 [`$compileProvider`](https://docs.angularjs.org/api/ng/provider/$compileProvider) 的 `.directive()` 函數，其定義為： `directive(name, directiveFactory)`。

其中，`directiveFactory` 函數，可以回傳一個 [`definition object`](https://docs.angularjs.org/api/ng/service/$compile#directive-definition-object)，指定相關的屬性設定。用法可參考 [Creating Custom Directives](https://docs.angularjs.org/guide/directive)。

注意 `definition object` 中有兩個進階屬性，`compile` 和 `link` 跟 directive 的處理過程相關。

##### compile 屬性

compile 函數的定義為 `function compile(element, attrs) { ... }`。

注意這裡的 `element` 是原始的未處裡過的 DOM。`compile` 函數應該負責對原始 DOM 進行一次性的處理操作，然後回傳一個物件，該物件可以視需要至少包含一個 `pre` 或 `post` 函數。類似這樣：

```js
function directiveFactory() {
	return {
		restrict: 'E',
		compile: function (tElem, tAttrs) {
			console.log(name + ': compile');
			return {
				pre: function (scope, iElem, iAttrs) {
					console.log(name + ': pre link');
				},
				post: function (scope, iElem, iAttrs) {
					console.log(name + ': post link');
				}
			}
		}
	}
}
```

##### link 屬性

link 函數的定義為 `function link(scope, element, attrs, controller, transcludeFn) { ... }`。
如果 directive 有定義 `compile` 函數，通常就不會再定義 `link` 函數，而是直接由 `compile` 函數回傳需要的 `pre` 和 `post` 函數。
此 link 函數，相當於 `compile` 函數中回傳的 `post` 函數。

1. 如果有需要，譬如像 `ng-repeat`，Angular (其實就是後面介紹的 `$compile` 函數) 會複製 `compile` 函數處理完的 DOM。
2. 針對每個元件單位，依據需要可能建立對應的 scope，然後呼叫 `link` 函數，進行 scope 和個別 DOM 之間的連結。通常在此 link 函數中對 DOM 註冊必要的 listener。

##### 在 directiveFactory 中回傳 link 函數

另外，還有一種進階作法，是在 `directiveFactory` 函數中回傳一個函數，該函數的作用，相當於上面 `definition object` 中的 `link` 函數、以及 `compile` 函數中回傳的 `post` 函數。
雖然官方不推薦這個作法，但是偶而會看到，所以至少需要了解其原理。

詳細的 directive 處理過程，請參考 [HTML Compiler](#html-compiler) 的說明。

[AngularJS directives內compile及link的函式本質](https://987.tw/2014/09/03/angularjs-directivesnei-compileji-linkhan-shi-de-ben-zhi/)

#### HTML Compiler

所有的工作，都是由 `$compile` 函數處理。而其中最重要需要知道的是，Angular 處理的是 DOM，而不是 string template，以維持 DOM 結構的穩定。

1. `$compile` 函數首先找到 `ng-app` directive，然後由此開始，尋找所有的 directive。
2. 依據 directive 的 priority 排序，同一元件中 priority 最大的 directive 最先處理。
3. `$compile` 依照階層以及 priority，逐一處理 directive。過程中，會依照階層關係，往下逐一呼叫每個 directive 的 `compile` 函數 (如果有的話)。此時 directive 的 `compile` 函數可以進行一次性的對 DOM 的操作。
	正規化後的每個 directive 的 `compile` 函數應該回傳 { pre, post } 函數，`$compile` 函數會將整個 DOM 和這些 link 函數，結合為一個統合的 (combined) link 函數，並將之回傳。
4. 在連結階段，將實際處理 scope 與 DOM 的繫結。
	此時將依照階層關係，往下逐一呼叫每個 directive 的 `pre` 函數 (如果有的話)，所以父元件的 pre 會先於子元件被呼叫。
	到達終端後，再以相反順序，呼叫每個 directive 的 `post` 函數 (如果有的話)，因此父元件的 post 會晚於子元件被呼叫。

虛擬碼大約如下：

```js
var $compile = ...; // injected into your code
var scope = ...;
var parent = ...; // DOM element where the compiled template can be appended

var html = '<div ng-bind="exp"></div>';

// Step 1: parse HTML into DOM element
var template = angular.element(html);

// Step 2: compile the template
var linkFn = $compile(template);

// Step 3: link the compiled template with the scope.
var element = linkFn(scope);

// Step 4: Append to DOM (optional)
parent.appendChild(element);
```

參考資料：

[HTML Compiler](https://docs.angularjs.org/guide/compiler)
[AngularJS directives內compile及link的函式本質](https://987.tw/2014/09/03/angularjs-directivesnei-compileji-linkhan-shi-de-ben-zhi/)

#### One-Time data binding

這是 AngularJS 1.3 新增的功能。

參考資料：

[AngularJS: One-Time VS Two-Way Data Binding](http://kodypeterson.com/angularjs-the-3-types-of-data-binding/)

雖然這篇文章說沒有所謂 One-Way data binding，不過後來 AngularJS 1.5 的確推出了 One-Way data binding 的功能。見後述。

[AngularJS one-time binding syntax](https://toddmotto.com/angular-one-time-binding-syntax/)

#### One-Way data binding

這是 AngularJS 1.5 新增的功能。

針對 directive 的 scope binding，可以使用 `<` 指定資料只由 parent scope 傳遞到 child scope。然而由於 object 是參照的關係，child scope 可以設定 parent scope 的 object 的 property，直接更改到 parent scope 的資料。

```js
app.directive('directiveName', function () {
	return {
		scope: {},
		bindToController: {
			count: '<'
		},
		controller: function () {},
		controllerAs: 'vm'
	};
});
```

或使用前面提到的，同樣是 AngularJS 1.5 新增的 `component()` 函數：

```js
var component = {
  bindings: {
		count: '<'
	}
};
app.component('componentName', component);
```

參考資料：

[One-way data-binding in Angular 1.5](https://toddmotto.com/one-way-data-binding-in-angular-1-5/)

[Exploring the Angular 1.5 .component() method](https://toddmotto.com/exploring-the-angular-1-5-component-method/#one-way-bindings)

#### One Time Data Binding with Recompile

若資料很少變動，但是偶而仍有變動可能，則可以考慮利用 `$compile` 重新 compile。

假設

```js
var marked = require('marked');

app.directive('markdown', function ($compile) {
	return function (scope, element, attrs) {
		scope.$watch(function (scope) {
			return scope.$eval(attrs.markdown);
		}, function (value) {
			if (typeof value !== 'undefined') {
				value = marked(content);
				element.html(value);
				$compile(element.contents())(scope);
			}
		};
	};
});
```

幾個重點：

1. 這個 directiveFactory 回傳的是 link 函數，所以 signature 為：`function (scope, element, attrs)`。
2. 由於第一項的緣故，也就是並未定義 `scope` 屬性的緣故，所以在傳入的 scope 中，並不會有任何自定義屬性 (這個例子中為 `markdown`)，所以不能使用 `scope.$watch('markdown', handler)` 來監看資料，
	所以，這裡必須使用 factory method 的方式，透過 `$eval` 處理值的監看： `scope.$watch(function (scope) { return scope.$eval(attrs.markdown); }, handler);`
3. 由於監看函數總是會在第一次的時候，以 `undefined` 值呼叫 handler 函數，為了避免無謂的處理，這裡檢查並排除這種情形。
4. 由於 `$compile` 函數只處理 DOM 元素，因此，在此先將結果設定給元件，元件將字串內容轉為 DOM，然後再透過元件的 `.contents()` 函數取出 DOM，再交給 `$compile` 函數處理。
	或者也可以透過 `angular.element(value)` 轉換為 DOM。
5. `$compile` 函數處理後，回傳 link 函數，我們在此立即呼叫它，並傳入 scope 進行繫結。

在這個例子中，`markdown` directive 的作用類似於 `ng-bind-html`，所以如果資料不會異動，也就是沒有重新 compile 的需求的話，可以在處理完畢後，移除 `$watcher`，以達成 one-time binding 的效果：

```js
var marked = require('marked');

app.directive('markdown', function ($compile) {
	return function (scope, element, attrs) {
		var $watcher = scope.$watch(function (scope) {
			return scope.$eval(attrs.markdown);
		}, function (value) {
			if (typeof value !== 'undefined') {
				value = marked(content);
				element.html(value);
				$compile(element.contents())(scope);
				$watcher();
			}
		};
	};
});
```

`.$watch` 函數回傳的是一個 `$watcher` 函數，當不需要繼續 `$watch` 的時候，只要呼叫該函數，就可以終結該 `$watch`。

如果使用 `definition object` 的形式撰寫，同時定義 `scope` 屬性，則可以直接 `$watch` 需要的屬性。因此，上面的寫法，相當於：

```js
var marked = require('marked');

app.directive('markdown', function ($compile) {
	return {
		restrict: 'A',
		scope: {
			markdown: '<'
		},
		link: function (scope, element, attrs) {
			var $watcher = scope.$watch('markdown', function(value) {
				if (typeof value !== 'undefined') {
					value = marked(value);
					element.html(value);
					$compile(element.contents())(scope);
					$watcher();
				}
			});
		}
	};
```

#### $sanitize

1. 預設在使用 `ng-bind-html` 時，即會自動進行 `$sanitize` 處理，若有需要做進一步的處理，則可以直接呼叫 `$sanitize` 函數。
2. `$sanitize` 會移除不安全的 tag，包括 `script`, `iframe`, `video`, `audio` 等。 `src`, `href` 等屬性也會進行處理。
3. `$sanitize` 會將中文字轉換為 `&#uuuu;` 的形式，將 `\n` 轉換為 `&#10;`。所以在 `$sanitize` 之後，要處理內容時要注意這一點。
4. 即使經過手動 `$sanitize` 處理，若是透過 `ng-bind-html` 來顯示，則還是會再次進行 `$sanitize` 處理。所以，若在 `$sanitize` 處理之後，又另外加了一些被禁用的 tag，則該 tag 仍然會被移除。
	因此，若確信在 `$sanitize` 處理之後的內容是安全的，則可以透過 `$sce.trustAsHtml()` 函數來告知 `ng-bind-html` 不需要再 `$sanitize` 處理。但是這種處理方式有點冗餘，可以參考上面 `markdown` directive 的作法。

```js
function markdown(content) {
	var result = this.$sanitize(content);
	result = marked(result);
	result = this.$sce.trustAsHtml(result);
	return result;
}
```

#### $watch(), $digest(), $apply() 及 $on(), $broadcast() 用途分別為何？

[$watch How the $apply Runs a $digest](http://angular-tips.com/blog/2013/08/watch-how-the-apply-runs-a-digest/)

[理解$watch ，$apply 和 $digest - 理解数据绑定过程](http://www.angularjs.cn/A0a6)

#### Batarang

1. 對於 one time binding 的支援似乎有些問題：

有文章說它會 disable one time binding, 現在一時找不到該文。

我發現 one time binding 的寫法會有影響，
這樣在 Batarang 才不會出現 watcher:

```
{{::item.url}}
```

若這樣:

```
{{ ::item.url }}
```

就會出現 (也就是 one time binding 無效)。但後者似乎是官方推薦的寫法。

2. 似乎不會追蹤手動呼叫的 `$watch()`。

3. 它的 $watch view，不斷地閃動，根本看不清楚 watch text 是什麼，對於排除不必要的 $watch 實在不方便。

#### jqLite

號稱是簡易版的 jQuery，但是由於 API 不支援完整的 jQuery 功能，所以使用時經常踩雷之後才會注意到。譬如：`.children()`, `.parent()` 不支援 selector，`.find()` 雖然支援，但只能使用 tagname。嗯....雖然文件有簡單的註記，但誰會記得這些東西啊～～。這些功能應該 (至少在 development 模式下) 要做 assert，有不支援的參數應該要丟出 exception 才對。


### 文章摘要

#### [WHEN TO USE DIRECTIVES, CONTROLLERS, OR SERVICES IN ANGULAR JS](http://kirkbushell.me/when-to-use-directives-controllers-or-services-in-angular/)

通常在 controller 中，回應 user 的行為，對 model/service 進行操作：

```js
function BookCtrl($scope, Book) {
  $scope.addBook = function () {
    Book.addBook({ title: "Star Wars", author: "George Lucas" });
  };
}
```

```html
<button ng-click="addBook()">Add</button>
```

這篇文章建議將 directive 寫成 attribute，並在 directive 中，直接對 service 進行操作，以避免在不同 view 中，重複撰寫 controller 來處理相同的邏輯。蠻有趣的論點。

```js
module.directive( "addBookButton", [ 'Book', function( Book ) {
  return {
    restrict: "A",
    link: function( scope, element, attrs ) {
      element.bind( "click", function() {
        Book.addBook( { title: "Star Wars", author: "George Lucas" } );
      });
    }
  }
}]);
```

```html
<button add-book-button>Add</button>
```

### [Sane, scalable Angular apps are tricky, but not impossible. Lessons learned from PayPal Checkout.](https://medium.com/@bluepnume/sane-scalable-angular-apps-are-tricky-but-not-impossible-lessons-learned-from-paypal-checkout-c5320558d4ef)

