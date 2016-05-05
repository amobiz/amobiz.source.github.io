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

module.exports = _attrs;
