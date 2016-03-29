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


如果資料來源是 `Date` 物件，要顯示完整的本地時間時，可以使用 `amDateFormat:'LLLL'` filter：

```html
<time datetime="::vm.createdAt">{{vm.createdAt | amDateFormat:'LLLL'}}</time>
```

如果資料來源不是 `Date` 物件，而是 UTC 格式字串，則必須先使用 `amUtc` filter 將之轉換為 UTC 格式。如果要顯示本地時間，可以直接使用 `amUtcOffset`。譬如：

```html
<time datetime="::vm.createdAt">{{vm.createdAt | amUtcOffset:'+0800' | amDateFormat:'LLLL'}}</time>
```

或者可以使用 `amTinezone`：

```html
<time datetime="::vm.createdAt">{{vm.createdAt | amTimezone:'Taipei' | amDateFormat:'LLLL'}}</time>
```


