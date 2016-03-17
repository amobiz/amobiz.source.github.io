/**
 * Post references tag
 *
 * 遇 `{% postrefs %}` 標籤時，
 * 以 link reference 的形式：
 * `[slug-id]: url "title"`
 * 插入所有的 post 的 slug id。
 * 方便 markdown 使用 slug id 來索引相關 post。
 *
 * 注意，原本是以 hexo filter 的形式寫成，但是由於 hexo 處理 filter 是在 swig/nunjucks 處理 template 之後，
 * 導致 swig/nunjuck 處理時，reference link 找不到對應的定義。
 *
 * 之前直接修改 hexo 原始碼來解決這個問題。現在改為使用 swig/nunjucks 的 tag 形式，並將定義直接含在 tag 內部的 markdown 中一併處理。
 *
 * Syntax:
 *
 *   {% postrefs %}
 *
 *   markdown link reference:
 * 	 [post title][post-slug-id]
 *
 *   {% endpostrefs %}
 */
'use strict';

var _refs;

function postReferenceTag(args, content) {
	var Post;

	if (!_refs) {
		Post = hexo.model('Post');
		_refs = Post.map(function (post, idx) {
			return '[' + post.slug + ']: ' + _link(post) + _title(post) + '\n';
		}).join('');
	}

	content = content + '\n' + _refs;

	return '<div>' + hexo.render.renderSync({ text: content, engine: 'markdown' }) + '</div>';

	function _link(post) {
		return hexo.config.root + (post.path || post.source);
	}

	function _title(post) {
		return post.title ? ' "' + post.title + '"' : '';
	}
}

hexo.extend.tag.register('postrefs', postReferenceTag, true);
