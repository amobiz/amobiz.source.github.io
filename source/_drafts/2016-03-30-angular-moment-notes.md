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


不論資料來源是 `Date` 物件或標準的 UTC 格式字串，要顯示本地時間時，可以使用 `amDateFormat` filter 來處理。譬如，如果要顯示完整的本地時間時，可以使用簡寫格式： `amDateFormat:'LLLL'`：

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


