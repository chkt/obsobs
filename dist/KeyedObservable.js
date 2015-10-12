'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var marked0$0 = [_iterate].map(regeneratorRuntime.mark);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseObservable = require('./BaseObservable');

var _BaseObservable2 = _interopRequireDefault(_BaseObservable);

var _observe = _interopRequireWildcard(_BaseObservable);

_BaseObservable2['default'].configure(_observe.DEFAULT_TYPE, function (prop, val) {
	return typeof val === 'object' && val !== null ? new KeyedObservable(val) : undefined;
});

var _notifier = new WeakMap();

function _iterate(source) {
	var prop;
	return regeneratorRuntime.wrap(function _iterate$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				if (!(typeof source !== 'object' || source === null)) {
					context$1$0.next = 2;
					break;
				}

				throw new TypeError();

			case 2:
				context$1$0.t0 = regeneratorRuntime.keys(source);

			case 3:
				if ((context$1$0.t1 = context$1$0.t0()).done) {
					context$1$0.next = 11;
					break;
				}

				prop = context$1$0.t1.value;

				if (source.hasOwnProperty(prop)) {
					context$1$0.next = 7;
					break;
				}

				return context$1$0.abrupt('continue', 3);

			case 7:
				context$1$0.next = 9;
				return [prop, source[prop]];

			case 9:
				context$1$0.next = 3;
				break;

			case 11:
			case 'end':
				return context$1$0.stop();
		}
	}, marked0$0[0], this);
}

var ADD_PROPS = Symbol();
exports.ADD_PROPS = ADD_PROPS;
var REMOVE_PROPS = Symbol();

exports.REMOVE_PROPS = REMOVE_PROPS;
var OBSERVE = Symbol();
exports.OBSERVE = OBSERVE;
var OBSERVE_ANY = Symbol();
exports.OBSERVE_ANY = OBSERVE_ANY;
var RELEASE = Symbol();
exports.RELEASE = RELEASE;
var RELEASE_ANY = Symbol();
exports.RELEASE_ANY = RELEASE_ANY;
var RELEASE_ALL = Symbol();

exports.RELEASE_ALL = RELEASE_ALL;

var KeyedObservable = (function (_Observable) {
	_inherits(KeyedObservable, _Observable);

	function KeyedObservable() {
		var source = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var type = arguments.length <= 1 || arguments[1] === undefined ? _observe.DEFAULT_TYPE : arguments[1];

		_classCallCheck(this, KeyedObservable);

		_get(Object.getPrototypeOf(KeyedObservable.prototype), 'constructor', this).call(this, _iterate, type);

		_notifier.set(this, _observe.getNotifier.call(this));

		_observe.createProperties.call(this, source);
	}

	_createClass(KeyedObservable, [{
		key: ADD_PROPS,
		value: function value(source) {
			_observe.createProperties.call(this, source);

			return this;
		}
	}, {
		key: REMOVE_PROPS,
		value: function value(source) {
			_observe.removeProperties.call(this, source);

			return this;
		}
	}, {
		key: OBSERVE,
		value: function value(prop, cb) {
			_notifier.get(this).addNamedListener(prop, cb);

			return this;
		}
	}, {
		key: OBSERVE_ANY,
		value: function value(cb) {
			_notifier.get(this).addListener(cb);

			return this;
		}
	}, {
		key: RELEASE,
		value: function value(prop, cb) {
			_notifier.get(this).removeNamedListener(prop, cb);

			return this;
		}
	}, {
		key: RELEASE_ANY,
		value: function value(cb) {
			_notifier.get(this).removeListener(cb);

			return this;
		}
	}, {
		key: RELEASE_ALL,
		value: function value(prop) {
			_notifier.get(this).removeAllNamedListeners(prop);

			return this;
		}
	}]);

	return KeyedObservable;
})(_BaseObservable2['default']);

exports['default'] = KeyedObservable;