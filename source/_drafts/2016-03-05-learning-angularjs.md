title: "AngularJS 學習筆記"
date: 2016-03-05 03:44:00
comments: true
category:
  - Programming
tags:
  - notes
  - AngularJS
---

### FAQ

#### $watch(), $digest(), $apply() 及 $on(), $broadcast() 用途分別為何？

[$watch How the $apply Runs a $digest](http://angular-tips.com/blog/2013/08/watch-how-the-apply-runs-a-digest/)

[理解$watch ，$apply 和 $digest - 理解数据绑定过程](http://www.angularjs.cn/A0a6)

#### 指定 controller as 之後，controller 中的 this 與 $scope 有何不同？

這是 AngularJS 1.2 新增的功能。

為了避開巢狀 scope 的 prototype properties 繼承問題，
可以在 parent scope 中以物件的形式設定值，這樣，child controller 就可以直接獲得並存取該屬性。

```js
function ParentCtrl($scope) {
    $scope.obj = { value: 5 };
}

function ChildCtrl($scope) {
    $scope.setValue = function (val) {
        $scope.obj.value = val;
    };
}
```

Controller As 語法，只是這種作法的語法蜜糖，當你寫 `controller as obj` 時，AngularJS 在背後所做的事，基本上就跟上面一樣。
細節是這樣的，首先，記住 Controller 函數其實是一個 constructor，AngularJS 會以 new 操作子呼叫你的 controller 函數，建立一個新的物件，
然後，AngularJS 會自動幫你在 `$scope` 中，以  `obj` 為屬性名稱，將該物件指定給 `$scope`。直接以程式展示的話，大概是這樣：

```js
var $scope = {};
$scope.obj = new ParentCtrl($scope);
```

所以，從另一個角度看，在 controller 中的 `this`，只是一個普通的 JavaScript 物件，當然也就沒有  `$scope`的功能。
因此，如果在 controller 中需要 $scope 功能的話，就必須再另外透過 DI 注入 $scope 物件，就像上面那樣。

參考資料：

這一篇解釋得很詳細：

[AngularJS: "Controller as" or "$scope"?](http://codetunnel.io/angularjs-controller-as-or-scope/)

John Papa 應該是最早介紹 Controller As 語法的人：

[Do You Like Your Angular Controllers with or without Sugar?](http://www.johnpapa.net/do-you-like-your-angular-controllers-with-or-without-sugar/)

[AngularJS's Controller As and the vm Variable](http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/)

[Exploring Angular 1.3: Binding to Directive Controllers](http://blog.thoughtram.io/angularjs/2015/01/02/exploring-angular-1.3-bindToController.html)。


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

或使用同樣是 AngularJS 1.5 新增的 `component()` 函數：

```js
var component = {
  bindings: {
		count: '<'
	}
};
app.component('componentName', component);
```

參考資料：

[One-way data-binding in Angular 1.5](https://toddmotto.com/one-way-data-binding-in-angular-1-5/}

[Exploring the Angular 1.5 .component() method](https://toddmotto.com/exploring-the-angular-1-5-component-method/#one-way-bindings)

#### Component Helper

這是 AngularJS 1.5 新增的功能。

為了讓 AngularJS 1.X 移植到 AngularJS 2.0 比較容易，而提供的比較接近 AngularJS 2.0 component 寫法的方式來定義元件。

```js
var component = {
  bindings: {
		count: '='
	}
};
app.component('componentName', component);
```

推薦像上面這樣，將 `component` 的設定另外定義，這樣比較接近 AngularJS 2.0 定義 component 的方式。

參考資料：

[Exploring the Angular 1.5 .component() method](https://toddmotto.com/exploring-the-angular-1-5-component-method)


#### Batarang

對於 one time binding 的支援似乎有些問題：

1. 有文章說它會 disable one time binding, 現在一時找不到該文。
2. 我發現 one time binding 的寫法會有影響，

這樣在 Batarang 才不會出現 watcher:

```
{{::item.url}}
```

若這樣:

```
{{ ::item.url }}
```

就會出現。但後者似乎是官方推薦的寫法。


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


