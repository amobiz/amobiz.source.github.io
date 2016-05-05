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

var _attrs = require('./attrs');

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
