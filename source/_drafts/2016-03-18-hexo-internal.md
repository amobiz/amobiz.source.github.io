title: 'Hexo internal'
date: 2016-03-18 02:46:00
comments: true
categories:
  - Programming
tags:
  - Hexo
---
多數資料結構，譬如管理 Post 的 model/post.js，實際上都是
Warehouse 的 Schema instance。此 class 有點類似 Backbone 的 Model + Collection
同時管理 model 的 schema 規則，同時也提供儲存、查詢 model 的功能。
