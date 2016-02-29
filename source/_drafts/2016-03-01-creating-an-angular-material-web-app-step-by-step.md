title: "Creating an Angular Material Web App: Step by Step"
comments: true
category:
  - Programming
tags:
  - Tutorial
  - AngularJS
  - Material Design
  - Web App
  - Webpack
  - PostCSS
date: 2016-03-01 03:23:46
---
{% cheatsheet 草稿 class:draft class:warning %}
本文為草稿，請小心參酌使用。
{% endcheatsheet %}

### 前言 / 簡介

本文介紹

<!-- more -->

## Boilerplate

[NG6-starter](https://github.com/AngularClass/NG6-starter)

* 優點
  * 使用 ES2015 語法
  * 使用最新的 Angular 1.5：支援 `component()` 函數，可以撰寫接近 Angular 2.0 component 風格的程式。
* 缺點
  * 使用 ui-router 而不是 Angular 2.0 的 new router。

```bash
git clone https://github.com/AngularClass/NG6-starter.git
```

## 改用 PostCSS

```bash
npm un -D stylus-loader
npm i -D postcss postcss-import postcss-cssnext lost cssnano
```

### webpack.config.js

```js
module: {
	loaders: [
		{ test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'ng-annotate!babel' },
		{ test: /\.html$/, loader: 'raw' },
		{ test: /\.css$/, loader: "style-loader!css-loader!postcss-loader" }
	]
},
postcss: function () {
	return [
		require('postcss-import')({
			addDependencyTo: webpack
		}),
		require('postcss-cssnext'),
		require('lost'),
		require('cssnano'),
	];
},
```

### karma.conf.js

```js
module: {
	loaders: [
		{ test: /\.js/, exclude: [/app\/lib/, /node_modules/], loader: 'babel' },
		{ test: /\.html/, loader: 'raw' },
		{ test: /\.css$/, loader: "style-loader!css-loader!postcss-loader" }
	]
},
postcss: function () {
	return [
		require('postcss-import')({
			addDependencyTo: webpack
		}),
		require('postcss-cssnext'),
		require('lost'),
		require('cssnano'),
	];
}
```

### 修改 generator template

```bash
git mv generator/component/temp.styl generator/component/temp.css
```

### 修改 *.styl

### 使用的 packages

* [postcss](https://github.com/postcss/postcss): PostCSS
* [postcss-loader](https://github.com/postcss/postcss-loader): CSS Webpack loader for PostCSS
* [postcss-import](https://github.com/postcss/postcss-import): import and inline css files
* [postcss-cssnext](https://github.com/MoOx/postcss-cssnext): Future CSS
* [lost](https://github.com/peterramsing/lost): Grid Framework
* [cssnano](https://github.com/ben-eb/cssnano): CSS minifier

## 加上 linter: stylelint + eslint



## 套用 Angular Material

```bash
npm i -D angular-material angular-aria angular-animate
```

__app.js__

```js
import angular from 'angular';
import uiRouter from 'angular-ui-router';
import aria from 'angular-aria';
import animate from 'angular-animate';
import Common from './common/common';
import Components from './components/components';
import AppComponent from './app.component';
import 'normalize.css';

angular.module('app', [
    uiRouter,
	aria,
	animate,
    Common.name,
    Components.name
  ])
  .config(($locationProvider) => {
    "ngInject";
    $locationProvider.html5Mode(true).hashPrefix('!');
  })

  .component('app', AppComponent);
```

## 將 navbar 移到 html 最外層

navbar 在每個 view 中都會出現，每次切換 ui-view 的時候包含 navbar 並不是很有效率，將它移動到最上層的 html 中。

## Logo

* 以 background-image顯示 logo
* 以 text-indent: 100% 隱藏文字 (SEO friendly)

```css
.logo a {
	display: block;
	text-indent: 100%;
	white-space: nowrap;
	overflow: hidden;
}
```

* [REPLACING THE -9999PX HACK (NEW IMAGE REPLACEMENT)](http://www.zeldman.com/2012/03/01/replacing-the-9999px-hack-new-image-replacement/)

## Nav Menu

