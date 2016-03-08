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

$watch How the $apply Runs a $digest
http://angular-tips.com/blog/2013/08/watch-how-the-apply-runs-a-digest/

理解$watch ，$apply 和 $digest --- 理解数据绑定过程
http://www.angularjs.cn/A0a6

#### 指定 controller as 之後，controller 中的 this 與 $scope 有何不同？

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

AngularJS: "Controller as" or "$scope"?
http://codetunnel.io/angularjs-controller-as-or-scope/

John Papa 應該是最早介紹 Controller As 語法的人：

Do You Like Your Angular Controllers with or without Sugar?
http://www.johnpapa.net/do-you-like-your-angular-controllers-with-or-without-sugar/

AngularJS's Controller As and the vm Variable
http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/

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

### [Sane, scalable Angular apps are tricky, but not impossible. Lessons learned from PayPal Checkout.](https://medium.com/@bluepnume/sane-scalable-angular-apps-are-tricky-but-not-impossible-lessons-learned-from-paypal-checkout-c5320558d4ef#.g9ng4gso0)


