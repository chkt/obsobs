'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var marked0$0 = [iterate].map(regeneratorRuntime.mark);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseObservable = require('./BaseObservable');

var _BaseObservable2 = _interopRequireDefault(_BaseObservable);

var _observe = _interopRequireWildcard(_BaseObservable);

var _obsops = require('obsops');

var _ops = _interopRequireWildcard(_obsops);

var _length = new WeakMap();
var _notifier = new WeakMap();

function iterate(source) {
	var i, l, val;
	return regeneratorRuntime.wrap(function iterate$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				if (Array.isArray(source)) {
					context$1$0.next = 2;
					break;
				}

				throw new TypeError();

			case 2:
				i = 0, l = source.length;

			case 3:
				if (!(i < l)) {
					context$1$0.next = 12;
					break;
				}

				val = source[i];

				if (!(val === undefined)) {
					context$1$0.next = 7;
					break;
				}

				return context$1$0.abrupt('continue', 9);

			case 7:
				context$1$0.next = 9;
				return [String(i), val];

			case 9:
				i += 1;
				context$1$0.next = 3;
				break;

			case 12:
			case 'end':
				return context$1$0.stop();
		}
	}, marked0$0[0], this);
}

function resolve(now, was) {
	var add = _ops.differenceByValue(now, was);
	var remove = _ops.differenceByValue(was, now);
	var update = [],
	    move = [];

	remove.forEach(function (item, index, source) {
		var rel = add.indexOf(item);

		if (rel === index) {
			update[index] = add[index];

			delete add[index];
			delete remove[index];
		} else if (rel !== -1) {
			move[index] = rel;

			delete add[rel];
			delete remove[index];
		} else if (index in now) {
			update[index] = _ops.difference(now[index], remove[index]);

			delete remove[index];
		}
	});

	return {
		add: add,
		remove: remove,
		update: update,
		move: move
	};
}

var IndexedObservable = (function (_Observable) {
	_inherits(IndexedObservable, _Observable);

	function IndexedObservable() {
		var source = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

		_classCallCheck(this, IndexedObservable);

		if (!Array.isArray(source)) throw new TypeError();

		_get(Object.getPrototypeOf(IndexedObservable.prototype), 'constructor', this).call(this);

		_length.set(this, 0);
		_notifier.set(this, _observe.getNotifier.call(this));

		if (source.length !== 0) this.append.apply(this, _toConsumableArray(source));
	}

	_createClass(IndexedObservable, [{
		key: 'insert',
		value: function insert(index) {
			if (!Number.isSafeInteger(index) || index < 0) throw new TypeError();

			var len = _length.get(this);

			if (index > len) throw new RangeError();

			for (var _len = arguments.length, items = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				items[_key - 1] = arguments[_key];
			}

			var move = [],
			    add = [],
			    ilen = items.length;

			for (var i = len - 1; i > index - 1; i -= 1) {
				move[i] = String(i + ilen);
			}for (var i = 0, item = items[0]; i < ilen; item = items[++i]) {
				add[index + i] = item;
			}_observe.moveProperties.call(this, move);
			_observe.createProperties.call(this, add);

			_length.set(this, len + ilen);

			return this;
		}
	}, {
		key: 'append',
		value: function append() {
			var len = _length.get(this);

			for (var _len2 = arguments.length, items = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				items[_key2] = arguments[_key2];
			}

			var add = [],
			    ilen = items.length;

			for (var i = 0, item = items[0]; i < ilen; item = items[++i]) {
				add[len + i] = item;
			}_observe.createProperties.call(this, add);

			_length.set(this, len + ilen);

			return this;
		}
	}, {
		key: 'remove',
		value: function remove(index) {
			if (!Number.isSafeInteger(index) || index < 0) throw new TypeError();

			var len = _length.get(this);

			for (var _len3 = arguments.length, items = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
				items[_key3 - 1] = arguments[_key3];
			}

			var remove = [],
			    move = [],
			    ilen = items.length;

			if (index + ilen > len) throw new RangeError();

			if (ilen === 0) return this;

			for (var i = index + ilen; i < len; i += 1) {
				move[i] = String(i - ilen);
			}for (var i = 0, item = items[0]; i < ilen; item = items[++i]) {
				remove[index + i] = item;
			}_observe.removeProperties.call(this, remove);
			_observe.moveProperties.call(this, move);

			_length.set(this, len - ilen);

			return this;
		}
	}, {
		key: 'observe',
		value: function observe(cb) {
			_notifier.get(this).addListener(cb);

			return this;
		}
	}, {
		key: 'release',
		value: function release(cb) {
			_notifier.get(this).removeListener(cb);

			return this;
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return _get(Object.getPrototypeOf(IndexedObservable.prototype), 'toJSON', this).call(this, []);
		}
	}, {
		key: 'length',
		get: function get() {
			return _length.get(this);
		}
	}]);

	return IndexedObservable;
})(_BaseObservable2['default']);

exports['default'] = IndexedObservable;

_observe.getFactoryQueue(_observe.DEFAULT_TYPE).append(function (prop, val) {
	return Array.isArray(val) ? new IndexedObservable(val) : undefined;
});

_observe.getConfiguration(IndexedObservable).set({
	scalarType: Array,
	scalarIterator: iterate,
	propertyResolver: resolve
});
module.exports = exports['default'];