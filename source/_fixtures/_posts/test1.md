title: 'test 1'
date: 2012-07-22 05:55:53
tags:
  - Hexo
  - Nunjucks
  - post_path
  - reference-style-link
---
## Title


__js code__
``` js
(function() {
  // ...
})();
```

<!-- more -->
<!-- forkme https://github.com/amobiz/lazy-umd.js -->

{% cheatsheet %}

__js code inside swig block__

``` js
(function() {
  // ...
})();
```


* [Reference-Style Link][1]
* [Reference-Style Link post_references][test2#Title]

<!-- post_references -->
<!-- post_references test2#Title -->

[1]: http://technet.microsoft.com/zh-tw/library/dd125460 "Reference-Style Link"

{% endcheatsheet %}
