title: "AngularJS Notes - ui-router"
date: 2016-03-26
comments: true
category:
  - Programming
tags:
  - AngularJS
  - AngularJS 1.x
  - ui-router
  - tutorial
  - pitfalls
---
{% cheatsheet 草稿 class:draft class:warning %}
本文為草稿，請小心參酌使用。
{% endcheatsheet %}

### 前言

捨棄 AngularJS 內建的 `$routeProvider` 轉而使用 [ui-router](https://github.com/angular-ui/ui-router) 時，經常是為了支援巢狀 (nested state) 或並行狀態 (parallel state)。
而巢狀 state 下，又通常需要提供預設的子狀態。這篇文章記錄一些使用 ui-router 常見的需求與注意事項。

另外，遇問題時可以先查一下 [Frequently Asked Questions](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions)。

### 指定 Html5 Mode

在不支援 html5 的瀏覽器中，通常使用 `#` hash 來記錄狀態，但是，真的很醜，所以如果目標瀏覽器支援的話，最好打開 html5 mode。

參考資料：

* [How to: Configure your server to work with html5Mode](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode)

### 避免指定 Controller

理由是分別指定 template 和 controller 時，會有機會導致不一致的情況。應該一律使用 directive。

```js
myapp.directive('phone-list', function() {
    return {
        scope: {},
        template: myTemplate,
        controller: function() {
            this.phones = ...;
        },
        controllerAs: 'vm'
    };
});
```

```js
$stateProvider
.state('phones', {
    url: '/phones',
    template: '<phone-list></phone-list>'
});
```

參考資料：

[Don’t specify controllers in your routes](https://medium.com/@bluepnume/sane-scalable-angular-apps-are-tricky-but-not-impossible-lessons-learned-from-paypal-checkout-c5320558d4ef#5b61)

### 指定子狀態

有四種方法：

#### 使用 . 符號

```js
$stateProvider
.state('contacts', {
    url: '/contacts'
    templateUrl: 'contacts.html'
})
.state('contacts.person', {
    url: '/:person-id',
    templateUrl: 'contacts.person.html'
});
```

注意：

1. 在說明巢狀 state 的文件上沒有特別註明，這是在 [URL Routing](https://github.com/angular-ui/ui-router/wiki/URL-Routing#url-routing-for-nested-states) 才提到，子狀態的網址，__不要__再包含父狀態的網址。
	如果不希望附加父狀態的網址，則必須使用絕對網址：

```js
$stateProvider
.state('contacts', {
    url: '/contacts'
    templateUrl: 'contacts.html'
})
.state('contacts.list', {
    url: '^/list',
    templateUrl: 'contacts.list.html'
});
```

2. 另外一個重點是，所有的狀態名稱都必須是唯一的，即使是子狀態也不可相同。
	譬如 `person.edit` 實際上定義了兩個狀態，即 `person` 與 `edit`。
	因此，不可定義 `group.edit`，因為這定義了 `group` 與 `edit` 兩個狀態，而 `edit` 狀態與 `person` 的子狀態重複。

3. 子狀態會繼承父狀態的狀態，即，在 `$stateParams` 中，可以存取到父狀態的參數。

#### 使用 Object-based States

這其實跟上一個方法沒什麼差別，只不過將 state 名稱，由第一個參數搬到 options 物件內：

```js
$stateProvider
.state({
    name: 'contacts',  //mandatory
    templateUrl: 'contacts.html'
})
.state({
    name: 'contacts.list', //mandatory. This counter-intuitive requirement addressed in issue #368
    parent: contacts,  //mandatory
    templateUrl: 'contacts.list.html'
});
```

#### 使用 stateHelper plugin

應該沒有必要僅僅為了把 state config 寫成巢狀，就多引入一個外掛。僅列出供參考。

* [ui-router.stateHelper](https://github.com/marklagendijk/ui-router.stateHelper)

#### 在子狀態中使用 `parent` 屬性

```js
$stateProvider
.state('contacts', {})
.state('list', {
    parent: 'contacts'
});
```

參考資料：

* [Nested States & Nested Views](https://github.com/angular-ui/ui-router/wiki/Nested-States-&-Nested-Views)

### 進入預設的 Substate

使用官方的 `$urlRouterProvider` 的 `.when()` 函數即可。

```js
$urlRouterProvider.when('/main', '/main/street');
```

參考資料：

[How to: Set up a default/index child state](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-set-up-a-defaultindex-child-state)

#### 附註

似乎有一段時間，ui-router 的 redirect 功能失效了：

[Angular UI-Router $urlRouterProvider .when not working when I click <a ui-sref=“…”>](http://stackoverflow.com/questions/27120308/angular-ui-router-urlrouterprovider-when-not-working-when-i-click-a-ui-sref)

因此出現了一些 hack 解決辦法，由於這些 hack 出現在 google 搜尋結果的前面，因此浪費了一些時間，試用了這些方案，其中還遇到一些問題，因此特別記錄下來。

##### 不夠好的 Hack 解決方案及其問題

在 StackOverflow [Redirect a state to default substate with UI-Router in AngularJS](http://stackoverflow.com/questions/29491079/redirect-a-state-to-default-substate-with-ui-router-in-angularjs) 的提問中，
被接受的答案，建議透過 watch `$stateChangeStart` 事件，然後透過檢查自定義屬性 `redirectTo` 來決定是否需要 redirect：

```js
$stateProvider
    .state('main', {
        url: '/main',
        templateUrl: 'main.html',
        redirectTo: 'main.street',
    })
```

```js
app.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
        if (to.redirectTo) {
            evt.preventDefault();
            $state.go(to.redirectTo, params)
        }
    });
}]);
```

這樣做的話，使用者直接進入 `/main` 網址時，就會觸發 `$stateChangeStart` 事件，由於 `main` state 定義了 `redirectTo` 屬性，所以這段程式會直接轉到 `main.street` 子狀態。

然而，若此 substate 還有 substate，假設為 `main.street.lane`，而使用者嘗試直接進入 `main.street.lane` 此 substate 時，你將發現，該 state 確實啟動了，但是網址卻又跳回那個預設的 substate。

理論上，這是因為，ui-router 在進入 substate 前，必須先進入 parent state，一路由 root 向終端 substate 轉換。在此過程中，每進入一個 state，都會觸發 `$stateChangeStart` 、 `$stateChangeSuccess` 等事件。
因此，若要直接進入 `main.street.lane` state，則必定要先進入 `main` state，而此時就會觸發上面 `$stateChangeStart` 那一段事件處理程式，而跳躍到 `main.street` state，並且中斷了原本的 state transfer。

那麼，為什麼顯示的是 `main.street.lane` state 的內容呢？我測試的時候，在進入 root state 前，會先進入 `main.street.lane` state 指定的 controller，然後才又從 root 開始，依照上述的順序轉換。
不確定這是否是正常的行為，但至少，url location 不是停留在正確的 state 上，光這一點就無法接受這個解法。

##### 透過 ui-router-extras 解決

第二個答案，則是建議使用 [`ui-router-extras`](https://github.com/christopherthielen/ui-router-extras) 解決問題。
此方法的確可以正確處理 redirect，但是事實上使用官方的 `$urlRouterProvider` 的 `.when()` 函數即可。

以下是使用 webpack 打包的方法：

先透過 `imports-loader` 進行 shim 處理：

```js
// @see: https://github.com/webpack/docs/wiki/shimming-modules
// #webpack: shimming modules
require('imports?angular=angular!ui-router-extras/release/modular/ct-ui-router-extras.core.js');
require('imports?angular=angular!ui-router-extras/release/modular/ct-ui-router-extras.dsr.js');
```

然後指定模組依賴關係：

```js
angular.module('app', [
	uiRouter,
	'ct.ui.router.extras.dsr'
])
```

最後，透過 `deepStateRedirect` 屬性，指定預設的 substate：

```js
app.config(($stateProvider, $urlRouterProvider) => {
	'ngInject';

	$stateProvider
	.state('forum', {
		url: '/f',
		template: '<forum></forum>',
		// @see http://stackoverflow.com/a/29514880/726650
		// #Redirect a state to default substate with UI-Router in AngularJS
		deepStateRedirect: { default: { state: 'forum.posts' } }
	})
	.state('forum.posts', {
		url: '/:forum',
		params: {
			forum: 'all'
		},
		template: '<posts forum="vm.active"></posts>'
	});
})
```

### 指定可選子狀態

在 ui-router 中，路徑 route 參數預設就是可選的，但是不幸的是，在省略的情況下，卻會在網址尾端多了一個 `/` 斜線。

譬如，假設網址為 `/forum/:forum`，則 `/forum/` 與 `/forum/js` 都是符合的網址，但是 `/forum` 則不是。
如果只有一層的可選路徑 route 參數，這可能不是什麼問題，但是若有多層的可選路徑 route 參數，網址就會變成：`/forum////`。
若希望允許 `/forum`，唯一的方法就是定義多個 state。

```js
$stateProvider
.state('forum', { url: '/forum', ... })
.state('forum.id', { url: '/:forum-id', ... })
.state('forum.id.post', { url: '/:post-id', ... });
```

參考資料：

* [Defining optional parameters with AngularJS UI Router](http://benfoster.io/blog/ui-router-optional-parameters)
