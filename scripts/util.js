'use strict';

var REGEX_PAIR = /([^:]+)\s*:\s*(.*)/;
function attrs(args, keys) {
	var value, ret;

	ret = args.reduce(extract, {});
	Object.keys(ret).forEach(function (key) {
		if (Array.isArray(ret[key])) {
			ret[key] = ret[key].join(' ');
		}
	});
	return ret;

	function extract(ret, values) {
		var value = REGEX_PAIR.exec(values);
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

var REGEX_ARG = /\${([-_\w:]+)}/g;
function render(template, values) {
	return template.replace(REGEX_ARG, function (match, exp) {
		var expr = values[exp];
		switch (typeof expr) {
			case 'string':
				return expr;
			case 'function':
				return expr();
			default:
				return '';
		}
	});
}

module.exports.attrs = attrs;
module.exports.render = render;
