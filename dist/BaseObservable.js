'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.defaultIterator = defaultIterator;
exports.defaultResolver = defaultResolver;
exports.getNotifier = getNotifier;
exports.createProperties = createProperties;
exports.updateProperties = updateProperties;
exports.removeProperties = removeProperties;
exports.moveProperties = moveProperties;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var marked0$0 = [defaultIterator].map(regeneratorRuntime.mark);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _obsops = require('obsops');

var _ops = _interopRequireWildcard(_obsops);

var _provDistProvider = require('prov/dist/Provider');

var _provDistProvider2 = _interopRequireDefault(_provDistProvider);

var _provDistConfigProvider = require('prov/dist/ConfigProvider');

var _provDistConfigProvider2 = _interopRequireDefault(_provDistConfigProvider);

var _Notifier = require('./Notifier');

var _Notifier2 = _interopRequireDefault(_Notifier);

var _notify = _interopRequireWildcard(_Notifier);

var _ConditionalQueue = require('./ConditionalQueue');

var _ConditionalQueue2 = _interopRequireDefault(_ConditionalQueue);

var DEFAULT_TYPE = Symbol('observable');
exports.DEFAULT_TYPE = DEFAULT_TYPE;
var SET_PROPERTIES = Symbol('setProperties');

exports.SET_PROPERTIES = SET_PROPERTIES;
var _ERRNOINS = "not an instance";
var _ERRPROP = "invalid property manipulation";

var _factory = new _provDistProvider2['default'](function (id) {
	return new _ConditionalQueue2['default']();
});
var _config = new _provDistConfigProvider2['default']({
	factoryType: DEFAULT_TYPE,
	scalarType: Object,
	scalarIterator: defaultIterator,
	propertyResolver: defaultResolver
});

var _type = new WeakMap();
var _iterator = new WeakMap();
var _resolver = new WeakMap();

var _value = new WeakMap();
var _child = new WeakMap();
var _notifier = new WeakMap();

/**
 * The default iteration generator
 * @param {Object} source - The iterable
 * @yields [{String}, {*}]
 */

function defaultIterator(source) {
	var names, i, prop;
	return regeneratorRuntime.wrap(function defaultIterator$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				names = Object.getOwnPropertyNames(source);
				i = 0, prop = names[0];

			case 2:
				if (!(prop !== undefined)) {
					context$1$0.next = 8;
					break;
				}

				context$1$0.next = 5;
				return [prop, source[prop]];

			case 5:
				prop = names[++i];
				context$1$0.next = 2;
				break;

			case 8:
			case 'end':
				return context$1$0.stop();
		}
	}, marked0$0[0], this);
}

/**
 * The default update resolver
 * @param {Object} now - The current state
 * @param {Object} was - The previous state
 * @returns {{add: {Object}, remove: {Object}, update: {Object}}}
 */

function defaultResolver(now, was) {
	var add = _ops.differenceByValue(now, was);
	var remove = _ops.differenceByValue(was, now);
	var update = {};

	for (var prop in remove) {
		if (prop in add) {
			update[prop] = add[prop];

			delete add[prop];
			delete remove[prop];
		} else if (prop in now) {
			update[prop] = _ops.difference(now[prop], remove[prop]);

			delete remove[prop];
		}
	}

	return {
		add: add,
		remove: remove,
		update: update
	};
}

/**
 * Returns a generic getter function for this[prop]
 * @param {String} prop - The instance property
 * @returns {Function}
 * @private
 */
function _createGetter(prop) {
	var child = _child.get(this),
	    vals = _value.get(this);

	return function () {
		return prop in child ? child[prop] : vals[prop];
	};
}

/**
 * Returns a generic setter function for this[prop]
 * @param {String} prop - The instance property
 * @returns {Function}
 * @private
 */
function _createSetter(prop) {
	var _this = this;

	var notify = _notifier.get(this);
	var vals = _value.get(this);

	return function (now) {
		var was = vals[prop];

		if (was === now) return;

		_removeProperty.call(_this, prop);

		Object.defineProperty(_this, prop, _createProperty.call(_this, prop, now));

		notify.queue(prop, _notify.TYPE_UPDATE, now, was);
	};
}

/**
 * Creates the property represented by prop,val
 * @param {String} prop - The property name
 * @param {*} val - The property value
 * @returns {{get: {Function}, set: {Function}, configurable: {Boolean}, enumerable: {Boolean}}}
 * @private
 * @throws {Error} _ERRNOINS if this does not point to a registered instance
 * @throws {Error} _ERRPROP if the property already exists
 */
function _createProperty(prop, val) {
	var type = _type.get(this);
	var factory = getFactoryQueue(type);
	var notify = _notifier.get(this);

	if (type === undefined) throw new Error(_ERRNOINS);

	var vals = _value.get(this);

	if (prop in vals) throw new Error(_ERRPROP);

	var ins = factory.process(this, prop, val, undefined);

	if (ins instanceof BaseObservable) {
		_child.get(this)[prop] = ins;
		_notifier.get(ins).setCascadeParent(notify, prop);
	}

	vals[prop] = val;

	return {
		get: _createGetter.call(this, prop),
		set: _createSetter.call(this, prop),
		configurable: true,
		enumerable: true
	};
}

/**
 * Removes the property referenced by prop
 * @param {String} prop - The property name
 * @private
 * @throws {Error} _ERRPROP if the property does not exist
 */
function _removeProperty(prop) {
	var vals = _value.get(this);
	var child = _child.get(this);

	if (!(prop in vals)) throw new Error(_ERRPROP);

	if (prop in child) {
		_notifier.get(child[prop]).resetCascadeParent();

		delete child[prop];
	}

	delete vals[prop];
	delete this[prop];
}

/**
 * Updates the property value of the property represented by prop,val
 * @param {String} prop - The property name
 * @param {*} val - The property value
 * @private
 * @throws {Error} _ERRNOINS if this does not point to a registered instance
 * @throws {Error} _ERRPROP if the property does not exist
 */
function _updateProperty(prop, val) {
	var type = _type.get(this);
	var factory = getFactoryQueue(type);
	var notify = _notifier.get(this);

	if (type === undefined) throw new Error(_ERRNOINS);

	var vals = _value.get(this);
	var child = _child.get(this);

	if (!(prop in vals)) throw new Error(_ERRPROP);

	var wasIns = prop in child ? child[prop] : undefined;
	var nowIns = factory.process(this, prop, val, wasIns);

	vals[prop] = val;

	if (nowIns !== undefined && wasIns === nowIns) return;

	if (wasIns instanceof BaseObservable) {
		_notifier.get(wasIns).resetCascadeParent();

		delete child[prop];
	}

	if (nowIns instanceof BaseObservable) {
		child[prop] = nowIns;
		_notifier.get(nowIns).setCascadeParent(notify, prop);
	}
}

var getFactoryQueue = _factory.get.bind(_factory);
exports.getFactoryQueue = getFactoryQueue;
var getConfiguration = _config.get.bind(_config);

exports.getConfiguration = getConfiguration;
/**
 * Returns the notifier associated with this
 * @returns {Notifier}
 * @throws {Error} _ERRNOINS if this does not point to a registered instance
 */

function getNotifier() {
	var notify = _notifier.get(this);

	if (notify === undefined) throw new Error(_ERRNOINS);

	return notify;
}

/**
 * Creates the properties represented by source
 * @param {Object} source - The property source
 */

function createProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	var spec = {};
	var notify = _notifier.get(this);

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator2 = _iterator.get(this)(source)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator2.next()).done); _iteratorNormalCompletion = true) {
			var _step$value = _slicedToArray(_step.value, 2);

			var prop = _step$value[0];
			var val = _step$value[1];

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

/**
 * Updates the properties represented by source
 * @param {Object} source - The property source
 * @throws {Error} _ERRNOINS if this does not point to a registered instance
 */

function updateProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	var vals = _value.get(this);
	var child = _child.get(this);
	var notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator3 = _iterator.get(this)(source)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator3.next()).done); _iteratorNormalCompletion2 = true) {
			var _step2$value = _slicedToArray(_step2.value, 2);

			var prop = _step2$value[0];
			var val = _step2$value[1];

			var was = vals[prop];
			var wasIns = child[prop];

			_updateProperty.call(this, prop, val);

			var nowIns = child[prop];

			if (nowIns === undefined || nowIns !== wasIns) notify.queue(prop, _notify.TYPE_UPDATE, val, was);
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

/**
 * Removes the properties represented by source
 * @param {Object} source - The property source
 * @throws {Error} _ERRNOINS if this does not point to a registered instance
 */

function removeProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	var vals = _value.get(this),
	    notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator4 = _iterator.get(this)(source)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator4.next()).done); _iteratorNormalCompletion3 = true) {
			var _step3$value = _slicedToArray(_step3.value, 2);

			var prop = _step3$value[0];
			var val = _step3$value[1];

			var was = vals[prop];

			_removeProperty.call(this, prop);

			notify.queue(prop, _notify.TYPE_REMOVE, undefined, was);
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
}

/**
 * Moves the properties represented by source
 * @param {Object} source - The property source
 * @throws {Error} _ERRNOINS if this does not point to a registered instance
 */

function moveProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	var spec = {};
	var vals = _value.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	var child = _child.get(this),
	    notify = _notifier.get(this);

	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator5 = _iterator.get(this)(source)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator5.next()).done); _iteratorNormalCompletion4 = true) {
			var _step4$value = _slicedToArray(_step4.value, 2);

			var origin = _step4$value[0];
			var dest = _step4$value[1];

			if (!(origin in vals) || dest in vals) throw new Error(_ERRPROP);

			spec[dest] = _createProperty.call(this, dest, vals[origin]);
			_removeProperty.call(this, origin);

			notify.queue(origin, _notify.TYPE_MOVE, dest, origin);
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator5['return']) {
				_iterator5['return']();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	Object.defineProperties(this, spec);
}

var BaseObservable = (function () {
	/**
  * Creates a new instance
  */

	function BaseObservable() {
		_classCallCheck(this, BaseObservable);

		var config = _config.get(this.constructor);

		_type.set(this, config.factoryType);
		_iterator.set(this, config.scalarIterator);
		_resolver.set(this, config.propertyResolver);

		_value.set(this, {});
		_child.set(this, {});
		_notifier.set(this, new _Notifier2['default'](this));
	}

	/**
  * Updates the internal state of the instance and all children
  * @param {Object} now - The new state
  * @returns {BaseObservable}
  * @throws {Error} _ERRNOINS if not called on a registered instance
  */

	_createClass(BaseObservable, [{
		key: SET_PROPERTIES,
		value: function value(now) {
			if (typeof now !== 'object' || now === null) throw new TypeError();

			var was = _value.get(this);

			if (was === undefined) throw new Error(_ERRNOINS);

			var _resolver$get$call = _resolver.get(this).call(this, now, was);

			var add = _resolver$get$call.add;
			var remove = _resolver$get$call.remove;
			var update = _resolver$get$call.update;
			var move = _resolver$get$call.move;

			if (remove instanceof Object && Object.keys(remove).length !== 0) removeProperties.call(this, remove);

			if (move instanceof Object && Object.keys(move).length !== 0) moveProperties.call(this, move);

			if (update instanceof Object && Object.keys(update).length !== 0) updateProperties.call(this, update);

			if (add instanceof Object && Object.keys(add)) createProperties.call(this, add);

			return this;
		}

		/**
   * The iterator
   * @yields [{String}, {*}]
   */
	}, {
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
			var child = _child.get(this);
			var vals = _value.get(this);
			var res = {};

			for (var prop in vals) {
				res[prop] = prop in child ? child[prop].toJSON() : vals[prop];
			}return res;
		}
	}]);

	return BaseObservable;
})();

exports['default'] = BaseObservable;