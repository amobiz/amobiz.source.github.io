# AngularJS 1.x 面試問題

## 請說明 Factory, Service, Provider 的區別

OS: 真的要問這個問題嗎？

在我回答之前，我先說明為什麼這個問題不好。

首先，應該看過 JavaScript: The Good Parts 這本書吧，這本書教我們避開 JavaScript 的設計錯誤部份，善用優良部份。
同樣地，framework 設計不良的部份，也應該避免使用。你知道透過 AngularJS 2.0 的 [DI](https://github.com/angular/di.js) (Dependency Injection) 引用服務時，已經沒有這些複雜又令人困惑的東西了吧。

### 回答：

首先要說明的是，為什麼需要這些東西？

這是為了替 AngularJS 的 DI 機制提供建構服務的方式。

為什麼需要 DI 機制？

為了降低程式的複雜度，讓模組與模組之間的依賴性降到最低，讓程式更容易撰寫、測試。

程式透過 DI 機制，獲取相依的元件，這是結合 IoC (Inverse of Control, 控制反轉) 及 DIP (Dependency Inversion Principle, 依賴反轉)的一種作法，用來降低模組之間的耦合度。

一般人所稱的 Factory, Service, Provider，還有 Constant, Value 其實都只是建立服務的方法，它們的差別只在建立的形式不同，它們背後的運作完全是建立在相同的實作之上。嚴格說起來，AngularJS DI 的核心，根本不知道有這些東西，它看得到的，只有這些 `factory()`, `service()`, `provider()`, `constant()`, `value()` 方法建立起來的服務而已。

然而，AngularJS team 犯了一個錯誤：他們把建立服務這件事，弄得太複雜，又濫用一些常見的名詞來區分不同的建構方式，導致大家以為這些是不同的東西。譬如 factory，大家很容易以為它是 factory method，在每次呼叫時，應該建立並回傳一個新的物件。很抱歉，不是，它只會被呼叫一次，就只有一次，然後建立好的東西，就被儲存、註冊為服務。

#### 差別在於 AngularJS 對待這些服務建構函數的方式：

繼續之前，要知道 AngularJS 為服務強制提供了 [singleton](http://www.oodesign.com/singleton-pattern.html) 機制。某種程度上，你可以將它們視為 global。

##### `provider()`

將傳入的函數當作建構子 (constructor)，透過 `new` 運算子呼叫。建構子建立的物件 (姑且稱此物件為 ServiceProvider)，必須擁有 `$get()` 方法。而 `$get()` 方法的返回值，就是服務物件 (稱此物件為 Service)。只在註冊的時候，唯一呼叫一次。

```js
app.provider('myService', function MyServiceProviderConstructor() {
	this.$get = function () {
		return 'my-service;
	};
});
```

如果用 ES2005 來寫的話，傳給 `provider()` 的函數，實際上是一個 class：

```js
class MyServiceProvider {
	$get() {
		return 'my-service';
	}
}

app.provider('myService', MyServiceProvider);
```

##### `factory()`

將傳入的函數當作普通函數呼叫。該函數的返回值，就是服務物件。只在註冊的時候，唯一呼叫一次。

```js
app.factory('myService', function myServiceFactory() {
	return 'my-service';
});
```

##### `service()`

將傳入的函數當作建構子 (constructor)，透過 `new` 運算子呼叫。建構子建立的物件，就是服務物件。只在註冊的時候，唯一呼叫一次。

```js
app.service('myService', function MyServiceConstructor() {
	this.name = 'my-service';
});
```

為什麼必須要有 ServiceProvider： `{ $get: function () {} }` 的設計呢？

這是因為透過 AngularJS 1.x 的 DI 機制，並無法在要求注入服務的當下指定參數，進行適當的客製化。於是 AngularJS 想出了一個方法，讓我們某種程度上，能夠在建立服務之前，進行初始化：

1. 將服務初始化功能，與真正的服務功能區分開來，
2. 藉由強迫初始化功能只能在 `config()` 階段使用，也就是只有在 `config()` 函數，才可以要求注入 ServiceProvider，這樣所有的要求注入該服務的模組，都能夠藉由呼叫 ServiceProvider，這樣所有的要求注入該服務的模組，都能夠藉由呼叫該物件提供的任意函數，先對該服務的初始化進行調整， 提供的任意函數，該服務的初始化進行調整，
3. 在 `config()` 階段完成初始化之後，在包含 `run()` 階段及其它 `directive()`, `controller()` 定義階段，服務第一次被要求注入時，才透過 ServiceProvider 的 `$get()` 方法建立並註冊服務。

其實這個想法，原本立意良好，問題是，服務是全域的，每個模組都可以在 `config()` 階段進行設定，而互相干擾。

其實 AngularJS 在建立 provider `xxx` 時，會先建立一個 `xxxProvider`，這其實就是使用我們提供的建構函數，以 `new` operator 呼叫後建立的物件。

##### 為什麼只有在 `config()` 期間可以使用 ServiceProvider？

provider 只能在 `module.config()` 函數中使用，並且不能在 `module.config()` 以外的函數中使用。
其他如 factory, service 等，則不能在 `module.config()` 函數中使用。

這是因為在 `config()` 函數之外，任何的 DI 指定的名稱，假設為 `xxx`，則 DI 系統會嘗試找到 `xxxProvider`，然後在第一次遇到要求注入 `xxx` 的地方，透過該 `xxxProvider.$get()` 函數，取得真正的物件。
因此，譬如若在 `config()` 函數之外，指定注入 `$locationProvider`，則 DI 會先嘗試找到 `$locationProviderProvider`，而當然沒有這個東西，自然就無法在 `config()` 函數之外使用 provider。

##### `value()` 與 `constant()`

value 相較於 constant 的區別：

1. 不可在 module.config() 時期透過 DI 取用，
2. 不可 DI 引用其他服務 (與 constant 同)，
3. 可透過 decorator 修飾。

AngularJS: Service vs provider vs factory
http://stackoverflow.com/questions/15666048/angularjs-service-vs-provider-vs-factory

##### `decorator()`

另外，`$provide` 服務還支援 [decorator](https://docs.angularjs.org/api/auto/service/$provide#decorator)，
可以用來攔截 value, service, factory, provider，加以修改。

另外，`$provide` 服務還支援 [constant](https://docs.angularjs.org/api/auto/service/$provide#constant)，其特性為:

1. 可在 module `.config()` 時期透過 DI 取用，
2. 不可 DI 引用其他服務，
3. 不可透過 decorator 修飾。

#### 那麼，到底什麼時候該用哪一個呢？

我的答案是，隨便，不管使用哪一種方式建立服務，結果都一樣，如果你了解它們背後的實作方式，你可以選擇最適合你的情境需要的形式來建立服務。如果你覺得要記憶三種方式很麻煩，則鎖定 `factory()` 就好。

那麼，若需要對服務進行初始設定的話，要怎麼辦呢？

1. 考慮使用 AngularJS 2.0 DI

	如果可行的話，應該考慮開始採用 AngularJS 2.0，你可以考慮先引入 [`ngUpgrade`](http://blog.thoughtram.io/angular/2015/10/24/upgrading-apps-to-angular-2-using-ngupgrade.html)，然後使用 AngularJS 2.0 的 DI 來引用服務，在 AngularJS 2.0 的服務，可以是任意形式。

2. 使用現代工具來管理模組

	在那之前，我建議至少開始改用 borwserify, webpack 或 System.js 這類現代工具來管理模組。在建立 angular 模組之前，先載入相依的模組，然後直接進行相關的設定：

	```js
	import angular from 'angular';
	import myOtherModule from '../my-other-module/my-other-module';
	import MyAppController from './my-app-controller';

	myOtherModule.setValue('max-cache', 500);

	let appModule = angular.module('myApp', [myOtherModule])
	.controller('MyAppController', MyAppController);

	export default appModule;
	```

3. 直接在服務物件上提供設定功能

4. 至於那些 angular 提供的 provider，只好繼續使用 `.config()` 來引用並進行設定了。


## 請說明 controller 的 $scope 的繼承機制


## 請說明 `controller as` 語法要解決的是什麼問題？


## 請說明 directive 的 scope 屬性的作用，以及有哪些選項。


## 請說明 directive 的 restrict 屬性的作用，以及有哪些選項。





