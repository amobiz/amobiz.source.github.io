title: "Angular Moment Notes"
date: 2016-03-30
comments: true
category:
  - Programming
tags:
  - AngularJS
  - Moment.js
  - angular-moment
---
{% cheatsheet 草稿 class:draft class:warning %}
本文為草稿，請小心參酌使用。
{% endcheatsheet %}

### 顯示相對時間

Moment 最引人注意的，就是顯示相對時間的功能，可以將指定的時間，以目前時間為基準，顯示為符合人類對於時間長度的一般描述：『一小時前』、『兩天前』。
在 angular-moment 中，可以使用 `am-time-ago` 屬性來指定時間值，用法類似 `ng-bind`。
注意到，由於 `amTimeAgo` 是 attribute directive，因此需使用 `-` 分隔 camel case 單字，以 `am-time-ago` 的形式使用。

```html
<time datetime="::vm.createdAt" am-time-ago="::vm.createdAt"></time>
```

### 顯示特定時間

不論資料來源是 `Date` 物件或標準的 UTC 格式字串，要顯示本地時間時，可以使用 `amDateFormat` filter 來處理。譬如，如果要顯示完整的本地時間時，可以使用簡寫格式： `amDateFormat:'LLLL'`。
注意到，由於 `amDateFormat` 是 filter，因此需直接以 camel case 形式使用。


```html
<time datetime="::vm.createdAt">{{vm.createdAt | amDateFormat:'LLLL'}}</time>
```

如果要將資料顯示為 UTC 時間，可以使用 `amUtc` filter，或者直接使用 `amUtcOffset` 直接指定為特定時區的時間：

```html
<time datetime="::vm.createdAt">{{vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL'}}</time>
```

或者可以使用 `amTinezone`：

```html
<time datetime="::vm.createdAt">{{vm.createdAt | amTimezone:'Taipei' | amDateFormat:'LLLL'}}</time>
```

#### One Time Binding 注意事項：

根據我自己的實際測試，angular-moment 的 filter 似乎無法支援 one-time binding，還好 directive 不會有這個問題：

1. 只使用 `amDateFormat` 時，顯示為空內容
2. 當加上 `amUtcOffset` 後，顯示的時間不是指定值，而是目前時間

```html
<h2>interpolate</h2>

<h3>no one-time binding</h3>
<div>0:<span>{{vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL'}}</span></div>
<div>1:<span>{{vm.createdAt | amDateFormat:'LLLL'}}</span></div>

<h3>one-time binding with { {::var | filter} } - not work: wrong time</h3>
<div>2:<span>{{::vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL'}}</span></div>
<div>3:<span>{{::vm.createdAt | amDateFormat:'LLLL'}}</span></div>

<h3>one-time binding with { {::(var | filter)} } - not work: wrong time</h3>
<div>4:<span>{{::(vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL')}}</span></div>
<div>5:<span>{{::(vm.createdAt | amDateFormat:'LLLL')}}</span></div>

<h3>one-time binding with { {::(var) | filter} } - not work: wrong time</h3>
<div>6:<span>{{::(vm.createdAt) | amUtcOffset:'+0800' | amDateFormat:'LLLL'}}</span></div>
<div>7:<span>{{::(vm.createdAt) | amDateFormat:'LLLL'}}</span></div>

<h3>one-time binding with ::{ {var | filter} } - (invalid one-time binding)</h3>
<div>8:<span>::{{vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL'}}</span></div>
<div>9:<span>::{{vm.createdAt | amDateFormat:'LLLL'}}</span></div>

<h2>ng-bind</h2>

<h3>no one-time binding</h3>
<div>0:<span ng-bind="vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL'"></span></div>
<div>1:<span ng-bind="vm.createdAt | amDateFormat:'LLLL'"></span></div>

<h3>one-time binding with ::var | filter - not work: wrong time</h3>
<div>2:<span ng-bind="::vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL'"></span></div>
<div>3:<span ng-bind="::vm.createdAt | amDateFormat:'LLLL'"></span></div>

<h3>one-time binding with ::(var | filter) - not work: wrong time</h3>
<div>4:<span ng-bind="::(vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL')"></span></div>
<div>5:<span ng-bind="::(vm.createdAt | amDateFormat:'LLLL')"></span></div>

<h3>one-time binding with ::(var) | filter - not work: wrong time</h3>
<div>6:<span ng-bind="::(vm.createdAt) | amUtcOffset:'+0800' | amDateFormat:'LLLL'"></span></div>
<div>7:<span ng-bind="::(vm.createdAt) | amDateFormat:'LLLL'"></span></div>
```

根據 [One-time binding doesn't work with filters](https://github.com/angular/angular.js/issues/8605#issuecomment-52120009) 這個留言，
原因可能是因為 angular-moment 可能沒有正確處理 `undefined` value 的情況。

這個問題，我找不到相關文件，但根據上面的討論串，是因為 one-time binding 會期望要評估的值，在穩定下來 (stabilize) 之前，必須是 `undefined`。
一旦數值不是 `undefined`，且再次檢查仍為相同數值，則判定為穩定 (stabilized)，之後就會停止 `$watch` 該數值。

而 angular-moment 的問題是，若輸入數值不是有效的，它就會回傳空字串，而造成 one-time binding 將結果認定為穩定 (stabilized)，因此無法得到正確的結果。

上面的討論串中，有提到應該在 `$parser` 中，針對 one-time binding 的狀況，若數值為 `undefined`，就不要再呼叫 filter。
但是，這個討論串最後還是看不出來 Angular team 如何處理這個問題，但卻把 issue 關閉了。不得不抱怨一下，常常遇到這種狀況，為什麼 close issue 的人不能描述一下理由/解決方式呢？

另外，原本 angular-moment 自己實作了 one-time binding，但在 angular 1.3 之後移除了：
[Remove one-time binding from am-time-ago directive](https://github.com/urish/angular-moment/issues/122)
