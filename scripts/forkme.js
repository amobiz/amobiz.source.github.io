/**
 * Forkme filter
 *
 * 將 `<!-- forkme -->` 註解轉換為 GitHub forkme badget.
 *
 * Syntax:
 *   <!-- forkme [url] [position:left|right] [fixed] [color:red|green|darkblue|orange|gray|white] -->
 */
'use strict';

var ALT = "Fork me on GitHub";
var RIBBONS = {
	left: {
		style: {
			absolute: "position: absolute; top: 0; left: 0; border: 0;",
			fixed: "position: fixed; top: 0; left: 0; border: 0;"
		},
		stocks: {
			red: {
				src: "https://camo.githubusercontent.com/82b228a3648bf44fc1163ef44c62fcc60081495e/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f7265645f6161303030302e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_left_red_aa0000.png"
			},
			green: {
				src: "https://camo.githubusercontent.com/121cd7cbdc3e4855075ea8b558508b91ac463ac2/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677265656e5f3030373230302e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_left_green_007200.png"
			},
			darkblue: {
				src: "https://camo.githubusercontent.com/567c3a48d796e2fc06ea80409cc9dd82bf714434/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f6461726b626c75655f3132313632312e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_left_darkblue_121621.png"
			},
			orange: {
				src: "https://camo.githubusercontent.com/8b6b8ccc6da3aa5722903da7b58eb5ab1081adee/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f6f72616e67655f6666373630302e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_left_orange_ff7600.png"
			},
			gray: {
				src: "https://camo.githubusercontent.com/c6625ac1f3ee0a12250227cf83ce904423abf351/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677261795f3664366436642e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_left_gray_6d6d6d.png"
			},
			white: {
				src: "https://camo.githubusercontent.com/c6286ade715e9bea433b4705870de482a654f78a/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f77686974655f6666666666662e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_left_white_ffffff.png"
			}
		}
	},
	right: {
		style: {
			absolute: "position: absolute; top: 0; right: 0; border: 0;",
			fixed: "position: fixed; top: 0; right: 0; border: 0;"
		},
		stocks: {
			red: {
				src: "https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"
			},
			green: {
				src: "https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png"
			},
			darkblue: {
				src: "https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
			},
			orange: {
				src: "https://camo.githubusercontent.com/652c5b9acfaddf3a9c326fa6bde407b87f7be0f4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6f72616e67655f6666373630302e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png"
			},
			gray: {
				src: "https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
			},
			white: {
				src: "https://camo.githubusercontent.com/52760788cde945287fbb584134c4cbc2bc36f904/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67",
				canonical: "https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png"
			}
		}
	}
};

var rPostReferences = /<!--+\s*forkme\s*(.*?)\s*--+>/i;

function forkme(data) {
	var config;

	config = this.config;

	data.content = data.content.replace(rPostReferences, function (tag, args) {
		var url, position, style, color, src, canonical;

		args = args ? args.split(/\s+/) : [];

		url = _url(args);
		position = _position(args);
		style = _style(position, args);
		color = _color(position, args);
		src = color.src;
		canonical = color.canonical;

		return '<a id="forkme" '
			+ _attr('href', url) + ' '
			+ 'target="_blank">'
			+ '<img '
			+ _attr('style', style) + ' '
			+ _attr('src', src) + ' '
			+ _attr('alt', ALT) + ' '
			+ _attr('data-canonical-src', canonical) + ' '
			+ 'class="nofancybox">'
			+ '</a>';
	});

	function _url(args) {
		var url;

		url = args[0];
		if (_isUrl(url)) {
			args.shift()
		} else {
			url = config.forkme.home;
		}
		if (!url) {
			throw new Error('url not specified');
		}
		return url;
	}

	function _position(args) {
		var pos;

		pos = args[0];
		if (pos) {
			pos = pos.toLowerCase();
			pos = RIBBONS[pos];
		}
		if (pos) {
			args.shift();
		} else {
			pos = RIBBONS[config.forkme.position || 'right'];
		}

		return pos;
	}

	function _style(position, args) {
		if (args[0] === 'fixed') {
			args.shift();
			return position.style.fixed;
		}
		return position.style.absolute;
	}

	function _color(position, args) {
		return position.stocks[args[0] || config.forkme.color || 'green'];
	}

	function _attr(name, value) {
		return name + '="' + value + '"';
	}

	function _isUrl(arg) {
		return arg && (arg.indexOf('http') === 0 || arg[0] === '/');
	}
}

hexo.extend.filter.register('after_post_render', forkme);
