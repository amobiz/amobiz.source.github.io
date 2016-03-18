/**
 * Cheatsheet tag
 *
 * Syntax:
 *   {% cheatsheet [summary] [class...] %}
 *   details
 *   {% endcheatsheet %}
 */
'use strict';

function cheatsheetTag(args, content) {
    var summary, value, classlist, markdown;

    summary = [];
    value = args.shift();
    while (value && !getClass(value)) {
        summary.push(value);
        value = args.shift();
    }
    if (summary.length) {
        summary = '<h5>' + summary.join(' ') + '</h5>';
    }
    else {
        summary = '';
    }

    classlist = [];
    while (value) {
        value = getClass(value);
        if (value) {
            classlist.push(value);
        }
        value = args.shift();
    }
    classlist = ['cheatsheet'].concat(classlist).join(' ');

	markdown = hexo.render.renderSync({ text: content, engine: 'markdown' });

    markdown = '<aside class="' + classlist + '">' + summary + markdown + '</aside>';

	return markdown;

    function getClass(value) {
        if (value) {
            value = value.split('class:');
            if (value) {
                return value[1];
            }
        }
    }
}

hexo.extend.tag.register('cheatsheet', cheatsheetTag, true);
