import Notifier, * as _notify from './Notifier';


const _ERROP = "invalid property manipulation";

const _PROP_CHILD = Symbol();


export const ADD_PROPS = Symbol('addProperties');
export const REMOVE_PROPS = Symbol('removeProperties');

export const OBSERVE = Symbol('observe');
export const OBSERVE_ANY = Symbol('observeAny');
export const RELEASE = Symbol('release');
export const RELEASE_ANY = Symbol('releaseAny');
export const RELEASE_ALL = Symbol('releaseAll');


const _factoryKeyed = new WeakMap();
const _factoryIndexed = new WeakMap();

const _value = new WeakMap();
const _notifier = new WeakMap();



/**
 * Returns a getter
 * @param {KeyedObservable} ins - The instance
 * @param {String} name - The property name
 * @returns {Function}
 * @private
 */
function _createGetter(ins, name) {
	return () => _value.get(ins)[name];
}

/**
 * Returns an observable setter
 * @param {KeyedObservable} ins - The instance
 * @param {String} name - The property name
 * @returns {Function}
 * @private
 */
function _createSetter(ins, name) {
	const notify = _notifier.get(ins);

	return now => {
		const vals = _value.get(ins);
		const was = vals[name];

		if (was === now) return;

		vals[name] = now;

		notify.queue(name, _notify.TYPE_UPDATE, now, was);
	};
}


/**
 * Adds the keys represented by source
 * @param {Object} source
 * @private
 */
function _addKeys(source) {
	const spec = {};
	const vals = _value.get(this), notify = _notifier.get(this);

	const fKeyed = _factoryKeyed.get(this);
	const fIndexed = _factoryIndexed.get(this);

	for (let prop in source) {
		if (!source.hasOwnProperty(prop)) continue;

		if (prop in vals) throw new Error(_ERROP);

		const val = source[prop];

		if (Array.isArray(val)) {
			const ins = fIndexed.call(this, prop, source[prop]);

			_notifier.get(ins).setCascadeParent(notify, prop);

			spec[prop] = {
				value : ins,
				configurable : true,
				enumerable : true
			};

			vals[prop] = _PROP_CHILD;
		}
		else if (val instanceof Object) {
			const ins = fKeyed.call(this, prop, source[prop]);

			_notifier.get(ins).setCascadeParent(notify, prop);

			spec[prop] = {
				value : ins,
				configurable : true,
				enumerable : true
			};

			vals[prop] = _PROP_CHILD;
		}
		else {
			spec[prop] = {
				get : _createGetter(this, prop),
				set : _createSetter(this, prop),
				configurable : true,
				enumerable : true
			};

			vals[prop] = source[prop];

			notify.queue(prop, _notify.TYPE_ADD, source[prop], undefined);
		}
	}

	Object.defineProperties(this, spec);
}

/**
 * Removes the keys represented by source
 * @param {Object} source
 * @private
 */
function _removeKeys(source) {
	//IMPLEMENT
}



export default class KeyedObservable {
	static Configure(source, keyed, indexed) {
		if (
			!(source instanceof Object) ||
			typeof keyed !== 'function' ||
			typeof indexed !== 'function'
		) throw new TypeError();

		const target = new this();

		_factoryKeyed.set(this, keyed);
		_factoryIndexed.set(this, indexed);

		_addKeys.call(target, source);

		return target;
	}


	constructor(source = {}) {
		if (typeof source !== 'object' || source === null) throw new TypeError();

		_factoryKeyed.set(this, (name, keys) => new KeyedObservable(keys));
		_factoryIndexed.set(this, (name, indexes) => new IndexedObservable(indexed));

		_value.set(this, {});
		_notifier.set(this, new Notifier(this));

		_addKeys.call(this, source);
	}


	[ADD_PROPS](source) {
		if (typeof source !== 'object' || source === null) throw new TypeError();

		_addKeys.call(this, source);

		return this;
	}

	[REMOVE_PROPS](source) {
		if (!Array.isArray(source)) throw new TypeError();

		_removeKeys.call(this, source);

		return this;
	}


	[OBSERVE](name, cb) {
		_notifier.get(this).addNamedListener(name, cb);

		return this;
	}

	[OBSERVE_ANY](cb) {
		_notifier.get(this).addListener(cb);

		return this;
	}

	[RELEASE](name, cb) {
		_notifier.get(this).removeNamedListener(name, cb);

		return this;
	}

	[RELEASE_ANY](cb) {
		_notifier.get(this).removeListener(cb);

		return this;
	}

	[RELEASE_ALL](name) {
		_notifier.get(this).removeAllNamedListeners(name);

		return this;
	}


	toJSON() {
		const vals = _value.get(this), res = {};

		for (let prop in vals) res[prop] = vals[prop] === _PROP_CHILD ? this[prop].toJSON() : vals[prop];

		return res;
	}
}
