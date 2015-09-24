const _PROP_CHILD = Symbol();

const _KEY_OBSERVE = Symbol();
const _KEY_OBSERVE_ANY = Symbol();
const _KEY_RELEASE = Symbol();
const _KEY_RELEASE_ANY = Symbol();
const _KEY_RELEASE_ALL = Symbol();

const _KEY_ADD = Symbol();
const _KEY_REMOVE = Symbol();



const _factoryKeyed = new WeakMap();
const _factoryIndexed = new WeakMap();

const _attrValue = new WeakMap();
const _attrObserve = new WeakMap();
const _anyObserve = new WeakMap();



/**
 * Returns a getter
 * @param {KeyedObservable} ins - The instance
 * @param {String} name - The property name
 * @returns {Function}
 * @private
 */
function _createGetter(ins, name) {
	return () => _attrValue.get(ins)[name];
}

/**
 * Returns an observable setter
 * @param {KeyedObservable} ins - The instance
 * @param {String} name - The property name
 * @returns {Function}
 * @private
 */
function _createSetter(ins, name) {
	return now => {
		const vals = _attrValue.get(ins);
		const was = vals[name];

		if (was === now) return;

		vals[name] = now;

		_notify.call(ins, name, now, was);
	};
}


/**
 * Adds the keys represented by source
 * @param {Object} source
 * @private
 */
function _addKeys(source) {
	const spec = {};
	const vals = _attrValue.get(this);

	const fKeyed = _factoryKeyed.get(this);
	const fIndexed = _factoryIndexed.get(this);

	for (let prop in source) {
		if (!source.hasOwnProperty(prop)) continue;

		if (prop in vals) throw new Error();

		const val = source[prop];

		if (Array.isArray(val)) {
			spec[prop] = {
				value : fIndexed.call(this.constructor, prop, source[prop]),
				configurable : true,
				enumerable : true
			};

			vals[prop] = _PROP_CHILD;
		}
		else if (val instanceof Object) {
			spec[prop] = {
				value : fKeyed.call(this.constructor, prop, source[prop]),
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

			_notify.call(this, prop, source[prop], undefined);
		}
	}

	Object.defineProperties(this, spec);
}

/**
 * Removes the keys represented by source
 * @param {String[]} source
 * @private
 */
function _removeKeys(source) {
	//IMPLEMENT
}


/**
 * Calls all registered observers
 * @param {Set} cbs
 * @param {String} name - The property name
 * @param {*} now
 * @param {*} was
 * @private
 */
function _call(cbs, name, now, was) {
	if (cbs.size === 0) return;

	for (let cb of cbs) {
		try {
			cb.call(this, name, now, was);
		}
		catch (err) {
			console.error(err);		//IMPLEMENT
		}
	}
}

/**
 * Notifies all property and generic observers of changes
 * @param {String} name
 * @param {*} now
 * @param {*} was
 * @private
 */
function _notify(name, now, was) {
	const obs = _attrObserve.get(this);

	if ((name in obs)) _call.call(this, obs[name], name, now, was);

	_call.call(this, _anyObserve.get(this), name, now, was);
}



export const ADD_PROPS = _KEY_ADD;
export const REMOVE_PROPS = _KEY_REMOVE;

export const OBSERVE = _KEY_OBSERVE;
export const OBSERVE_ANY = _KEY_OBSERVE_ANY;
export const RELEASE = _KEY_RELEASE;
export const RELEASE_ANY = _KEY_RELEASE_ANY;
export const RELEASE_ALL = _KEY_RELEASE_ALL;


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

		_attrValue.set(this, {});
		_attrObserve.set(this, {});
		_anyObserve.set(this, new Set());

		_addKeys.call(this, source);
	}


	[_KEY_ADD](source) {
		if (typeof source !== 'object' || source === null) throw new TypeError();

		_addKeys.call(this, source);

		return this;
	}


	[_KEY_OBSERVE](name, cb) {
		if (
			typeof name !== 'string' || name === '' ||
			typeof cb !== 'function'
		) throw new TypeError();

		const obs = _attrObserve.get(this);

		if (!(name in obs)) obs[name] = new Set();

		obs[name].add(cb);

		return this;
	}

	[_KEY_OBSERVE_ANY](cb) {
		if (typeof cb !== 'function') throw new TypeError();

		_anyObserve.get(this).add(cb);

		return this;
	}

	[_KEY_RELEASE](name, cb) {
		if (
			typeof name !== 'string' || name === '' ||
			typeof cb !== 'function'
		) throw new TypeError();

		const obs = _attrObserve.get(this);

		if (!(name in obs)) return this;

		obs[name].delete(cb);

		if (obs[name].size === 0) delete obs[name];

		return this;
	}

	[_KEY_RELEASE_ANY](cb) {
		if (typeof cb !== 'function') throw new TypeError();

		_anyObserve.get(this).delete(cb);

		return this;
	}

	[_KEY_RELEASE_ALL](name) {
		if (typeof name !== 'string' || name === '') throw new TypeError();

		const obs = _attrObserve.get(this);

		if (name in obs) delete obs[name];

		return this;
	}


	toJSON() {
		const vals = _attrValue.get(this), res = {};

		for (let prop in vals) res[prop] = vals[prop] === _PROP_CHILD ? this[prop].toJSON() : vals[prop];

		return res;
	}
}
