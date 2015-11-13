title: Gulp 學習筆記 - Gulp Internals (3.x)
date: 2015-11-12 20:38:00
comments: true
category:
tags:
  - Gulp
  - notes
---
### 前言

最近正在開發一個 gulp 工具：[configurable-gulp-recipes](https://github.com/amobiz/configurable-gulp-recipes)，所以分別研究了 Gulp 3.9 和 Gulp 4.0 的原始碼，以下是 Gulp 3.9 的快速筆記。

<!-- more -->

### 解析 Gulp 原始碼

進入點：

[gulp/index.js](https://github.com/gulpjs/gulp/blob/master/index.js)

`Gulp` 繼承 `Orchestrator`:

```
var util = require('util');
var Orchestrator = require('orchestrator');
var gutil = require('gulp-util');
var deprecated = require('deprecated');
var vfs = require('vinyl-fs');

function Gulp() {
	Orchestrator.call(this);
}
util.inherits(Gulp, Orchestrator);
```

`Orchestrator` 的定義：

[orchestrator/orchestrator](https://github.com/orchestrator/orchestrator)

```
Orchestrator.prototype.add = function (name, dep, fn) {
	...

	this.tasks[name] = {
		fn: fn,
		dep: dep,
		name: name
	};
	return this;
};

Orchestrator.prototype.task = function (name, dep, fn) {
	if (dep || fn) {
		// alias for add, return nothing rather than this
		this.add(name, dep, fn);
	} else {
		return this.tasks[name];
	}
};
```

可以看到：

1. `gulp.task()` 透過 `gulp.add()` 函數，將定義的 task 包裝為物件，儲存在 `gulp.tasks[]` 陣列中。
2. 透過 `gulp.task()` 函數，其實可以取得特定名稱的 task 物件的完整定義。

下面這一行乍看之下似乎是多餘的，因為 `Gulp` 繼承 `Orchestrator` 時，就已經同時取得 `.add()` 及 `.task()` 函數，但是 `Orchestrator.prototype.task()` 實際上將工作委託給 `Orchestrator.prototype.add()` 函數，然而`task()` 並未改變任何行為，因此，其實只要讓 `task()` 也指向 `add()` 即可：

`gulp.task()` 改直接引用自 `Orchestrator.prototype.add` 成為別名:

```
Gulp.prototype.task = Gulp.prototype.add;
```

`gulp.src()`, `gulp.dest()` 直接引用自 `vinyl-fs`:

```
Gulp.prototype.src = vfs.src;
Gulp.prototype.dest = vfs.dest;
```

`gulp.watch()` 將監看對象陣列攤平，丟給 `vinyl-fs` 的 `.watch()` 函數：

```
Gulp.prototype.watch = function(glob, opt, fn) {
	if (typeof opt === 'function' || Array.isArray(opt)) {
		fn = opt;
		opt = null;
	}

	// Array of tasks given
	if (Array.isArray(fn)) {
		return vfs.watch(glob, opt, function() {
			this.start.apply(this, fn);
		}.bind(this));
	}

	return vfs.watch(glob, opt, fn);
};
```

`gulp.src()` 透過 `glob-stream` 將 glob 轉換為 `vinyl` (File)(vinyl 是黑膠唱片的意思，表示承載內容的物品)：

[vinyl-fs/lib/src/index.js](https://github.com/wearefractal/vinyl-fs/blob/master/lib/src/index.js)

```
var assign = require('object-assign');
var through = require('through2');
var gs = require('glob-stream');
var File = require('vinyl');
var duplexify = require('duplexify');
var merge = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var filterSince = require('../filterSince');
var isValidGlob = require('is-valid-glob');

var getContents = require('./getContents');
var resolveSymlinks = require('./resolveSymlinks');

function createFile(globFile, enc, cb) {
	cb(null, new File(globFile));
}

function src(glob, opt) {
	var options = assign({
		read: true,
		buffer: true,
		sourcemaps: false,
		passthrough: false
	}, opt);

	var inputPass;

	if (!isValidGlob(glob)) {
		throw new Error('Invalid glob argument: ' + glob);
	}

	var globStream = gs.create(glob, options);

	var outputStream = globStream
		.pipe(resolveSymlinks())
		.pipe(through.obj(createFile));

	if (options.since != null) {
		outputStream = outputStream
		.pipe(filterSince(options.since));
	}

	if (options.read !== false) {
		outputStream = outputStream
			.pipe(getContents(options));
	}

	if (options.passthrough === true) {
		inputPass = through.obj();
		outputStream = duplexify.obj(inputPass, merge(outputStream, inputPass));
	}
	if (options.sourcemaps === true) {
		outputStream = outputStream
			.pipe(sourcemaps.init({loadMaps: true}));
	}
	globStream.on('error', outputStream.emit.bind(outputStream, 'error'));
	return outputStream;
}

module.exports = src;
```

[glob-stream/index.js](https://github.com/wearefractal/glob-stream/blob/master/index.js)

```
// create globbing stuff
var globber = new glob.Glob(ourGlob, ourOpt);

...

globber.on('match', function(filename) {
	found = true;

	stream.write({
		cwd: opt.cwd,
		base: basePath,
		path: path.resolve(opt.cwd, filename)
	});
});
```

`vinyl` 雖然有專屬的 module （class），也有許多 method 可用:

[wearefractal/vinyl](https://github.com/wearefractal/vinyl)

但是對於 `Gulp` 來說，它只需要四個欄位：
```
{
	base: string,
	cwd: string,
	path: string, // filename
	contents: any // file content
}
```

在 `Gulp` 中，由 `gulp.src()` 開始，一直到 `gulp.dest()` 為止，傳遞的都是只有上面四個欄位的 `vinyl`。

所以，像 [`Browserify`](http://browserify.org/) 這樣的工具若要能夠供 `Gulp` 使用，必須透過 [`vinyl-source-stream`](https://github.com/hughsk/vinyl-source-stream) 這樣的工具，將輸出的文字內容，轉換為 vinyl 的格式，同時賦予檔案名稱：

### 同場加映，解析 vinyl-source-stream 原始碼

[hughsk/vinyl-source-stream](https://github.com/hughsk/vinyl-source-stream) / [index.js](https://github.com/hughsk/vinyl-source-stream/blob/master/index.js)

```
var through2 = require('through2')
var File = require('vinyl')
var path = require('path')

module.exports = function (filename, baseDir) {
	var ins = through2();	// .......................................................(3)
	var out = false

	var opts = {
		contents: ins		// ...............................................(3)
	}

	// NOTE: 注意其 opts.path 的決定方式
	if (filename) opts.path = path.resolve(baseDir || process.cwd(), filename)
	if (baseDir) opts.base = baseDir

	var file = new File(opts);	//  ...............................................(2)

    // 回傳的是 through2 物件，注意 objectMode: true。........................................(1)
	return through2({
		objectMode: true
	}, function(chunk, enc, next) {
		if (!out) {
			this.push(file) // NOTE: 這裡推入 vinyl 物件。.......................(2)
			out = true
		}

		ins.push(chunk) 	// ................................................(4)
		next()
	}, function() {
		ins.push(null)		// ................................................(5)
		this.push(null)
	})
}
```

可以看到：
1. 回傳的是 [`through2`](https://github.com/rvagg/through2) 物件 (`through2` 是 node 常用的 stream 包裝函數，可以避免使用繼承的方式撰寫 stream 物件)。
2. `through2` 接受的第一個函數，稱為 `transformFunction`，是當 stream 在傳輸資料時，負責進行內容轉換工作。
    使用 `through2` 時，透過 `push()` 函數將實際上要輸出的內容，加到輸出 stream 中。可以看到這裡要傳輸的是 `vinyl` 物件，所以回傳的 `through2` 物件，在定義的時候，必須指定 `objectMode: true`。
3. 前面提到 `vinyl` 物件最重要的四大屬性，其中 `contents` 是用來傳輸 / 存放檔案內容的。在這裡，`contents` 實際上又是一個 `through2` 物件，注意這裡沒有定義 `objectMode`，所以這是一個 `byte stream`。
4. 在每當 up stream 有資料傳送進來時，便呼叫 `push()` 函數，將資料推送到 buffer 中。
5. `through2` 接受的第二個函數，稱為 `flushFunction`，是當 stream 資料傳輸完畢時，負責進行最後的收尾清理工作。在這裡都 `push(null)` 表示資料結尾。



