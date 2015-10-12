'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TYPE_MOVE = 0;
exports.TYPE_MOVE = TYPE_MOVE;
var TYPE_ADD = 1;
exports.TYPE_ADD = TYPE_ADD;
var TYPE_REMOVE = 2;
exports.TYPE_REMOVE = TYPE_REMOVE;
var TYPE_UPDATE = 3;

exports.TYPE_UPDATE = TYPE_UPDATE;
var FLAG_CASCADE = 4;

exports.FLAG_CASCADE = FLAG_CASCADE;
var _TYPES = Object.freeze([TYPE_MOVE, TYPE_ADD, TYPE_REMOVE, TYPE_UPDATE]);

var _qIns = [];
var _qProp = [];
var _qType = [];
var _qNow = [];
var _qWas = [];

var _timeout = 0;

var _origin = new WeakMap();

var _observeProp = new WeakMap();
var _observeAny = new WeakMap();

var _parent = new WeakMap();
var _parentProp = new WeakMap();

/**
 * Returns true if type is a valid notification type, false otherwise
 * @param {Int} type - The notification type
 * @returns {Boolean}
 * @private
 */
function _isNotificationType(type) {
	return _TYPES.indexOf(type) !== -1;
}

/**
 * Calls all callbacks in cbs with now, was, meta
 * @param {Function[]} cbs - The callbacks
 * @param {*} now - The current value
 * @param {*} was - The previous value
 * @param {Object} meta - The notification data
 * @private
 */
function _call(cbs, now, was, meta) {
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = cbs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var cb = _step.value;

			try {
				cb.call(this, now, was, meta);
			} catch (err) {
				console.error(err);
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator['return']) {
				_iterator['return']();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}
}

/**
 * Notifies all listener of property to a change
 * @param {Notifier} source - The source instance
 * @param {String} property - The property name
 * @param {Int} type - The notification type
 * @param {*} now - The current value
 * @param {*} was - The previous value
 * @private
 */
function _notify(source, property, type, now, was) {
	var meta = Object.freeze({
		origin: _origin.get(source),
		property: property,
		type: type,
		path: []
	});

	for (var target = source, prop = property; target !== undefined; _ref = [_parent.get(target), _parentProp.get(target)], target = _ref[0], prop = _ref[1], _ref) {
		var _ref;

		var origin = _origin.get(target);
		var cbsProp = _observeProp.get(target);
		var cbsAny = _observeAny.get(target);

		meta.path.unshift(prop);

		if (prop in cbsProp) _call.call(origin, cbsProp[prop], now, was, meta);

		if (cbsAny.size !== 0) _call.call(origin, cbsAny, now, was, meta);
	}
}

/**
 * Processes all waiting observers
 * @private
 */
function _process() {
	_timeout = 0;

	var len = _qIns.length;
	var qIns = _qIns.splice(0, len);
	var qProp = _qProp.splice(0, len);
	var qType = _qType.splice(0, len);
	var qNow = _qNow.splice(0, len);
	var qWas = _qWas.splice(0, len);

	for (var i = 0; i < len; i += 1) {
		_notify(qIns[i], qProp[i], qType[i], qNow[i], qWas[i]);
	}
}

var Notifier = (function () {
	function Notifier(source) {
		_classCallCheck(this, Notifier);

		if (typeof source !== 'object' || source === null) throw new TypeError();

		_origin.set(this, source);

		_observeProp.set(this, {});
		_observeAny.set(this, new Set());
	}

	_createClass(Notifier, [{
		key: 'setCascadeParent',
		value: function setCascadeParent(source, prop) {
			if (_origin.get(source) === undefined || typeof prop !== 'string' || prop === '') throw new TypeError();

			_parent.set(this, source);
			_parentProp.set(this, prop);
		}
	}, {
		key: 'resetCascadeParent',
		value: function resetCascadeParent() {
			_parent['delete'](this);
			_parentProp['delete'](this);
		}
	}, {
		key: 'addListener',
		value: function addListener(cb) {
			if (typeof cb !== 'function') throw new TypeError();

			_observeAny.get(this).add(cb);

			return this;
		}
	}, {
		key: 'addNamedListener',
		value: function addNamedListener(prop, cb) {
			if (typeof prop !== 'string' || prop === '' || typeof cb !== 'function') throw new TypeError();

			var obs = _observeProp.get(this);

			if (!(prop in obs)) obs[prop] = new Set();

			obs[prop].add(cb);

			return this;
		}
	}, {
		key: 'removeListener',
		value: function removeListener(cb) {
			if (typeof cb !== 'function') throw new TypeError();

			_observeAny.get(this)['delete'](cb);

			return this;
		}
	}, {
		key: 'removeNamedListener',
		value: function removeNamedListener(prop, cb) {
			if (typeof prop !== 'string' || prop === '' || typeof cb !== 'function') throw new TypeError();

			var obs = _observeProp.get(this);

			if (!(prop in obs)) return this;

			var cbs = obs[prop];

			cbs['delete'](cb);

			if (cbs.size === 0) delete obs[prop];

			return this;
		}
	}, {
		key: 'removeAllListeners',
		value: function removeAllListeners() {
			_observeAny.get(this).clear();

			return this;
		}
	}, {
		key: 'removeAllNamedListeners',
		value: function removeAllNamedListeners(prop) {
			if (typeof prop !== 'string' || prop === '') throw new TypeError();

			var obs = _observeProp.get(this);

			if (prop in obs) delete obs[prop];

			return this;
		}
	}, {
		key: 'queue',
		value: function queue(name, type, now, was) {
			if (typeof name !== 'string' || name === '' || !_isNotificationType(type)) throw new TypeError();

			_qIns.push(this);
			_qProp.push(name);
			_qType.push(type);
			_qNow.push(now);
			_qWas.push(was);

			if (_timeout === 0) _timeout = setTimeout(_process, 0);

			return this;
		}
	}]);

	return Notifier;
})();

exports['default'] = Notifier;