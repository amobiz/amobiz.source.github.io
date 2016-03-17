/**
 * element tag
 *
 * 為 tag 加入特定的 id 及 class，以方便文內交互索引及套用 style。
 *
 * Syntax:
 *   {% element [id:<id>] [class:<class> ...] %}
 *   markdown
 *   {% endelement %}
 */
'use strict';

function elementTag(args, content) {
	var value, id, classlist;

	classlist = [];
	value = args.shift();
	while (value) {
		id = getId(value) || id;
		value = getClass(value);
		if (value) {
			classlist.push(value);
		}
		value = args.shift();
	}

	return '<div'
		+ (id ? ' id="' + id + '"' : '')
		+ (classlist.length ? ' class="' + classlist.join(' ') + '"' : '')
		+ '>'
		+ hexo.render.renderSync({ text: content, engine: 'markdown' })
		+ '</div>';

	function getId(value) {
		return getValue('id', value);
	}

	function getClass(value) {
		return getValue('class', value);
	}

	function getValue(type, value) {
		value = value.split(/\s*:\s*/);
		if (value && value[0] === type) {
			return value[1];
		}
	}
}

hexo.extend.tag.register('element', elementTag, true);
