# AngularJS 1.x 面試問題

## 請說明 Factory, Service, Provider 的區別

OS: 真的要問這個問題嗎？

 (這個問題暴露出面試官的短視與刁難心態...，這個問題應該這樣問：你覺得 AngularJS 提供 Factory, Service, Provider 的目的為何，各自的使用時機為何？)

在我回答之前，我先說明為什麼這個問題不好。

首先，應該看過 JavaScript: The Good Parts 這本書吧，這本書教我們避開 JavaScript 的設計錯誤部份，善用優良部份。
同樣地，framework 設計不良的部份，也應該避免使用。你知道 [AngularJS 2.0 的 DI](https://github.com/angular/di.js) (Dependency Injection) 已經棄用這些東西了吧。

其次，為什麼說這是設計不良的部份，Factory, Service (還有  constant, value) 其實都是 Provider，只是建立的形式不同，背後的運作完全是建立在 Provider 的實作之上：

```js
$provide.service = function(name, Class) {
  provider.provide(name, function() {
    this.$get = function($injector) {
      return $injector.instantiate(Class);
    };
  });
}

$provide.factory = function(name, factory) {
  provider.provide(name, function() {
    this.$get = function($injector) {
      return $injector.invoke(factory);
    };
  });
}

$provide.value = function(name, value) {
  provider.factory(name, function() {
    return value;
  });
};
```

而實際上，這些都只不過是 [factory method](http://www.oodesign.com/factory-method-pattern.html) 的變形。硬是冠上一堆不一樣的名詞，只是徒增困擾。
做為 framework，不應該規範或限制使用者要如何建立服務元件，在 AngularJS 2.0 的 DI，完全不需要這些令人困擾的東西，就可以完整控制相依的元件的建立方式。


### 回答：

要談論 Factory, Service, Provider 的區別之前，要先說明為什麼需要這些東西。這是為了替 AngularJS 的 DI 機制提供建構元件的方式。
程式透過 DI 機制，獲取相依的元件，這是結合 IoC (Inverse of Control, 控制反轉) 及 DIP (Dependency Inversion Principle, 依賴反轉)的一種作法，用來降低模組之間的耦合度。

不管是那一種，註冊的方式都相同：提供一個名稱跟函數：

##### Services

```js
module.service('serviceName', function); 
```

##### Factories

```js
module.factory('factoryName', function); 
```

##### Providers

```js
module.provider('providerName', function); 
```

#### 差別在於 AngularJS 對待這些函數的方式：

##### Services

會將該函數當作建構函數 (constructor)，以 new 的方式呼叫，建立唯一一個物件，供所有的需求者透過 DI 共用。也就是說，AngularJS 為 service 強制提供了 [singleton](http://www.oodesign.com/singleton-pattern.html) 機制。

##### Factories

會將該函數當作普通函數呼叫，並且期望函數扮演 [factory method](http://www.oodesign.com/factory-method-pattern.html) 的角色。每個需求者透過 DI 要求時，會呼叫一次該函數，然後該函數的返回值，將成為需求者獲得的結果。
注意到，factory 可以永遠回傳相同的值，也可以每次回傳不同的值，並沒有任何限制。
所以 factory 其實也可以在內部實作 singleton 機制，以達成 service 一樣的共用效果。
只是，如其名稱所暗示的， factory 就是工廠，工廠就應該生產新的東西，沒錯吧。也唯有如此，才有必要使用 factory，否則，使用 service 即可。

##### Providers

會將該函數當作建構函數 (constructor)，以 new 的方式呼叫，建立唯一一個物件，該物件必須含有 `$get()` 函數，每次需求者透過 DI 要求時，呼叫該函數，然後該函數的返回值，將成為需求者獲得的結果。

什麼時候會用到 Provider 呢，首先注意到使用 DI 的時候，我們只能指定依賴對象的名稱，而無法指定參數。

其實 AngularJS 在建立 provider `xxx` 時，會先建立一個 `xxxProvider`，這其實就是使用我們提供的建構函數，以 `new` operator 呼叫後建立的物件。
程式在初始化的時候，可以要求 DI 注入 `xxxProvider` 物件以獲取該物件，然後，我們可以呼叫該物件提供的任意函數，進行初始化或執行任意行為。
而其餘部份的程式，則依照舊有的方式，以名稱 `xxx` 的方式，要求注入 `xxx` 物件，這時候 AngularJS 才會呼叫 `xxxProvider.$get()` 函數，返回真正的元件。

注意到，provider 本身是 singleton，就跟 service 一樣。但是透過 DI 由 `.$get()` 函數取得的值，則由 provider 本身決定，就跟 factory 一樣。由此可知，service 與 factory 實際上是 provider 的特殊化版本。

另外，注意到『程式在初始化的時候』，這表示，要對 provider 進行設定，有一定的順序要求，請參考『程式初始化流程』

另外，`$provide` 服務還支援 [decorator](https://docs.angularjs.org/api/auto/service/$provide#decorator)，
可以用來攔截 value, service, factory, provider，加以修改。

根據這篇文章：[Sane, scalable Angular apps are tricky, but not impossible. Lessons learned from PayPal Checkout.](https://medium.com/@bluepnume/sane-scalable-angular-apps-are-tricky-but-not-impossible-lessons-learned-from-paypal-checkout-c5320558d4ef)， 只有 provider 能在 `module.config()` 函數中使用，並且不能在 `module.config()` 以外的函數中使用。其他如 factory, service 等，則不能在 `module.config()` 函數中使用。(**補上官方文件**)
(這是因為在 `.config()` 函數之外，任何的 DI 指定的名稱，假設為 `xxx`，則 DI 系統會嘗試找到 `xxxProvider`，然後透過該 `xxxProvider.$get()` 取得真正的物件。
因此，若指定譬如 `$locationProvider`，則在 `.config()` 函數之外， DI 會先嘗試找到 `$locationProviderProvider`，而當然沒有這個東西，自然就無法在 `.config()` 函數之外使用 provider。)

另外，`$provide` 服務還支援 [constant](https://docs.angularjs.org/api/auto/service/$provide#constant)，其特性為:

1. 可在 module `.config()` 時期透過 DI 取用，
2. 不可 DI 引用其他服務，
3. 不可透過 decorator 修飾。

value 相較於  constant 的區別：

1. 不可在 module.config() 時期透過 DI 取用，
2. 不可 DI 引用其他服務 (與 constant 同)，
3. 可透過 decorator 修飾。

AngularJS: Service vs provider vs factory
http://stackoverflow.com/questions/15666048/angularjs-service-vs-provider-vs-factory

#### 那麼，到底什麼時候該用哪一個呢？

很多人建議只使用 factory 就好，譬如上面的文章：[Sane, scalable Angular apps are tricky, but not impossible. Lessons learned from PayPal Checkout.](https://medium.com/@bluepnume/sane-scalable-angular-apps-are-tricky-but-not-impossible-lessons-learned-from-paypal-checkout-c5320558d4ef)。

這些人的論點，主要就是前面我強調的：factory 可以做所有 service 可以做的事。

但是我個人則認為，若只看 service 與 factory，由其名稱來看，並不會有什麼容易產生使用時機誤解的地方，反而是考慮到 provider 之後，才讓人發生困惑。
所以我建議，當服務是 singleton 的時候，使用 service；當服務是用來建立新物件的時候，使用 factory。

那麼，若需要對 service 或 provider 進行設定的話，要怎麼辦呢？

如果可行的話，應該考慮開始採用 AngularJS 2.0。
在那之前，我建議至少開始改用 borwserify, webpack 或 System.js 這類現代工具來管理模組。
在建立 angular 模組之前，先載入相依的模組，然後直接進行相關的設定：

```js
import angular from 'angular';
import myOtherModule from '../my-other-module/my-other-module';
import MyAppController from './my-app-controller';

myOtherModule.setValue('max-cache', 500);

let appModule = angular.module('myApp', [myOtherModule])
.controller('MyAppController', MyAppController);

export default appModule;
```

至於那些 angular 提供的 provider，只好繼續使用 `.config()` 來引用並進行設定了。


## 請說明 controller 的 $scope 的繼承機制


## 請說明 `controller as` 語法要解決的是什麼問題？


## 請說明 directive 的 scope 屬性的作用，以及有哪些選項。


## 請說明 directive 的 restrict 屬性的作用，以及有哪些選項。





