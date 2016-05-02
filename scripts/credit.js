/**
 * credit tag
 *
 * 顯示主圖之授權內容及意象傳達。
 *
 * Syntax:
 *   {% credit credit:<name> link:<url> desc:<description> %}
 *   markdown
 *   {% endcredit %}
 */
'use strict';

function _attrs(args, keys) {
	var value, ret;

	ret = args.reduce(extract, {});
	Object.keys(ret).forEach(function (key) {
		if (Array.isArray(ret[key])) {
			ret[key] = ret[key].join(' ');
		}
	});
	return ret;

	function extract(ret, values) {
		var value = /([^:]+)\s*:\s*(.*)/.exec(values);
		if (value) {
			add(value[1], value[2]);
		}
		return ret;

		function add(key, value) {
			if (ret[key]) {
				if (Array.isArray(ret[key])) {
					ret[key].push(value);
				} else {
					ret[key] = [ret[key], value];
				}
			} else {
				ret[key] = value;
			}
		}
	}
}

function creditTag(args, content) {
	var attrs = _attrs(args, ['desc', 'credit', 'link']);
	return '<div class="Credit">'
			+ hexo.render.renderSync({ text: content, engine: 'markdown' })
			+ '<div class="Credit-backdrop">'
				+ '<div class="Credit-info">'
					+ desc(attrs.desc)
					+ credit(attrs.credit, attrs.link)
				+ '</div>'
			+ '</div>'
		+ '</div>';

	function desc(content) {
		if (content) {
			return '<div class="Credit-desc">'
				+ hexo.render.renderSync({ text: content, engine: 'markdown' })
				+ '</div>';
		}
		return '';
	}

	function credit(title, link) {
		if (title) {
			return '<div><a class="Credit-link" target="_blank" href="' + link + '">' + title + '</a></div>';
		}
		return '';
	}
}

hexo.extend.tag.register('credit', creditTag, true);
