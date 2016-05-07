/**
 * Cheatsheet tag
 *
 * Syntax:
 *   {% condition when:condition [class:name ...] %}
 *   details
 *   {% endcondition %}
 *
 *   {% condition-toggle name:condition default:value on:desc off:desc [class:name] %}
 */
'use strict';

var util = require('./util');

var injected = false;

function conditionTag(args, content) {
	var attrs = util.attrs(args, ['when', 'class']);
	attrs.content = hexo.render.renderSync({ text: content, engine: 'markdown' });
	return util.render('<div class="Condition ${class}" data-when="${when}">${content}</div>', attrs);
}

function toggleTag(args) {
	var attrs = util.attrs(args, ['when', 'default', 'on', 'off', 'class']);
	attrs.script = 'Toggler.toggle(\'' + attrs.when + '\')';
	attrs.content = attrs.default === 'on' ? attrs.on : attrs.off;
	var template = '<button class="Trigger ${class}"'
		+ ' data-when="${when}"'
		+ ' data-default="${default}"'
		+ ' data-on="${on}"'
		+ ' data-off="${off}"'
		+ ' onclick="${script}"'
		+ '>${content}</button>';
	return inject() + util.render(template, attrs);
}

function inject() {
	if (injected) return '';
	return '<script>(' + toggleInit.toString() + ')()</script>';
}

function toggleInit() {
	window.Toggler = {
		toggle: toggle
	};

	ready(function () {
		var els = document.querySelectorAll('.Trigger');
		els = Array.prototype.slice.call(els, 0);
		els.forEach(function (el) {
			var when = el.getAttribute('data-when');
			var els = document.querySelectorAll('.Condition[data-when=' + when + ']');
			els = Array.prototype.slice.call(els, 0);
			set(el, els, el.getAttribute('data-default') === 'on');
		});
	});

	function toggle(when) {
		var el = document.querySelector('.Trigger[data-when=' + when + ']');
		var els = document.querySelectorAll('.Condition[data-when=' + when + ']');
		els = Array.prototype.slice.call(els, 0);
		var data = el.data || (el.data = {});
		if ('when' in data) {
			data.when = !data.when;
		} else {
			data.when = el.getAttribute('data-default') !== 'on';
		}
		set(el, els, data.when);
	}

	function set(el, els, on) {
		if (on) {
			el.innerHTML = el.getAttribute('data-on');
			removeClass(els, 'hidden');
		} else {
			el.innerHTML = el.getAttribute('data-off');
			addClass(els, 'hidden');
		}
	}

	function removeClass(els, cls) {
		els.forEach(function (el) {
			el.classList.remove(cls);
		});
	}

	function addClass(els, cls) {
		els.forEach(function (el) {
			el.classList.add(cls);
		});
	}

	function ready(fn) {
		function onready(/*e*/) {
			document.removeEventListener('DOMContentLoaded', onready, false);
			window.removeEventListener('load', onready, false);
			setTimeout(fn);
		}
		if (document.readyState === 'complete') {
			setTimeout(fn);
		}
		else {
			// Use the handy event callback
			document.addEventListener('DOMContentLoaded', onready, false);
			// A fallback to window.onload, that will always work
			window.addEventListener('load', onready, false);
		}
	}
}

hexo.extend.tag.register('condition', conditionTag, true);
hexo.extend.tag.register('toggle', toggleTag, false);
