'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.getNotifier = getNotifier;
exports.createProperties = createProperties;
exports.removeProperties = removeProperties;
exports.moveProperties = moveProperties;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Notifier = require('./Notifier');

var _Notifier2 = _interopRequireDefault(_Notifier);

var _notify = _interopRequireWildcard(_Notifier);

var _ConditionalQueue = require('./ConditionalQueue');

var _ConditionalQueue2 = _interopRequireDefault(_ConditionalQueue);

var DEFAULT_TYPE = Symbol('observable');

exports.DEFAULT_TYPE = DEFAULT_TYPE;
var _ERRNOINS = "not an instance";
var _ERRPROP = "invalid property manipulation";

var _CHILD = Symbol('child');

var _factory = new Map();

var _type = new WeakMap();
var _iterator = new WeakMap();
var _value = new WeakMap();
var _notifier = new WeakMap();

function _createGetter(prop) {
	var _this = this;

	return function () {
		return _value.get(_this)[prop];
	};
}

function _createSetter(prop) {
	var notify = _notifier.get(this);
	var vals = _value.get(this);

	return function (now) {
		var was = vals[prop];

		if (was === now) return;

		vals[prop] = now;

		notify.queue(prop, _notify.TYPE_UPDATE, now, was);
	};
}

function _createProperty(prop, val) {
	var type = _type.get(this);

	if (type === undefined) throw new Error(_ERRNOINS);

	var factory = _factory.get(type);
	var notify = _notifier.get(this);

	var ret = factory.process(this, prop, val);

	if (ret instanceof BaseObservable) {
		_notifier.get(ret).setCascadeParent(notify, prop);
		_value.get(this)[prop] = _CHILD;

		return {
			value: ret,
			configurable: true,
			enumerable: true
		};
	} else {
		_value.get(this)[prop] = val;

		return {
			get: _createGetter.call(this, prop),
			set: _createSetter.call(this, prop),
			configurable: true,
			enumerable: true
		};
	}
}

function _removeProperty(prop, val) {
	if (this[prop] instanceof BaseObservable && typeof val === 'object' && val !== null) {
		removeProperties.call(this[prop], val);

		return;
	}

	delete _value.get(this)[prop];
	delete this[prop];
}

function getNotifier() {
	var notify = _notifier.get(this);

	if (notify === undefined) throw new Error(_ERRNOINS);

	return notify;
}

function createProperties(source) {
	var spec = {};
	var vals = _value.get(this),
	    notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator2 = _iterator.get(this)(source)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator2.next()).done); _iteratorNormalCompletion = true) {
			var _step$value = _slicedToArray(_step.value, 2);

			var prop = _step$value[0];
			var val = _step$value[1];

			if (prop in vals) throw new Error(_ERRPROP);

			spec[prop] = _createProperty.call(this, prop, val);

			notify.queue(prop, _notify.TYPE_ADD, val, undefined);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator2['return']) {
				_iterator2['return']();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	Object.defineProperties(this, spec);
}

function removeProperties(source) {
	var vals = _value.get(this),
	    notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator3 = _iterator.get(this)(source)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator3.next()).done); _iteratorNormalCompletion2 = true) {
			var _step2$value = _slicedToArray(_step2.value, 2);

			var prop = _step2$value[0];
			var val = _step2$value[1];

			if (!(prop in vals)) throw new Error(_ERRPROP);

			var was = vals[prop];

			_removeProperty.call(this, prop, val);

			if (!(prop in this)) notify.queue(prop, _notify.TYPE_REMOVE, undefined, was);
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator3['return']) {
				_iterator3['return']();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}
}

function moveProperties(source) {
	var spec = {};
	var vals = _value.get(this),
	    notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator4 = _iterator.get(this)(source)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator4.next()).done); _iteratorNormalCompletion3 = true) {
			var _step3$value = _slicedToArray(_step3.value, 2);

			var origin = _step3$value[0];
			var dest = _step3$value[1];

			if (!(origin in vals) || dest in vals) throw new Error(_ERRPROP);

			if (vals[origin] === _CHILD) {
				spec[dest] = Object.getOwnPropertyDescriptor(this, origin);
				vals[dest] = _CHILD;

				delete this[origin];
				delete vals[origin];
			} else {
				spec[dest] = _createProperty.call(this, dest, vals[origin]);
				_removeProperty.call(this, origin);
			}

			notify.queue(origin, _notify.TYPE_MOVE, dest, origin);
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator4['return']) {
				_iterator4['return']();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	Object.defineProperties(this, spec);
}

var BaseObservable = (function () {
	_createClass(BaseObservable, null, [{
		key: 'configure',
		value: function configure(type) {
			var _factory$get;

			if (typeof type !== 'symbol') throw new TypeError();

			if (!_factory.has(type)) _factory.set(type, new _ConditionalQueue2['default']());

			for (var _len = arguments.length, factory = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				factory[_key - 1] = arguments[_key];
			}

			(_factory$get = _factory.get(type)).append.apply(_factory$get, factory);

			return this;
		}
	}]);

	function BaseObservable(iterate, type) {
		_classCallCheck(this, BaseObservable);

		if (
		//IMPLEMENT validate generator
		typeof type !== 'symbol') throw new TypeError();

		_type.set(this, type);
		_iterator.set(this, iterate);
		_value.set(this, {});
		_notifier.set(this, new _Notifier2['default'](this));
	}

	_createClass(BaseObservable, [{
		key: Symbol.iterator,
		value: regeneratorRuntime.mark(function value() {
			var vals, prop;
			return regeneratorRuntime.wrap(function value$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						vals = _value.get(this);
						context$2$0.t0 = regeneratorRuntime.keys(vals);

					case 2:
						if ((context$2$0.t1 = context$2$0.t0()).done) {
							context$2$0.next = 8;
							break;
						}

						prop = context$2$0.t1.value;
						context$2$0.next = 6;
						return [prop, vals[prop]];

					case 6:
						context$2$0.next = 2;
						break;

					case 8:
					case 'end':
						return context$2$0.stop();
				}
			}, value, this);
		})
	}, {
		key: 'toJSON',
		value: function toJSON() {
			var vals = _value.get(this),
			    res = {};

			for (var prop in vals) {
				res[prop] = vals[prop] === _CHILD ? this[prop].toJSON() : vals[prop];
			}return res;
		}
	}]);

	return BaseObservable;
})();

exports['default'] = BaseObservable;