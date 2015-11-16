import Observable, * as _observe from './BaseObservable';



const _notifier = new WeakMap();



/**
 * The addProperties symbol
 * @type {Symbol}
 */
export const ADD_PROPS = Symbol();
/**
 * The removeProperties symbol
 * @type {Symbol}
 */
export const REMOVE_PROPS = Symbol();

/**
 * The observeProperty symbol
 * @type {Symbol}
 */
export const OBSERVE = Symbol();
/**
 * The observeAny symbol
 * @type {Symbol}
 */
export const OBSERVE_ANY = Symbol();
/**
 * The releaseProperty symbol
 * @type {Symbol}
 */
export const RELEASE = Symbol();
/**
 * The releaseAny symbol
 * @type {Symbol}
 */
export const RELEASE_ANY = Symbol();
/**
 * The releaseAll symbol
 * @type {Symbol}
 */
export const RELEASE_ALL = Symbol();



export default class KeyedObservable extends Observable {
	/**
	 * Creates a new instance
	 * @param {Object} [source={}] - The source object
	 * @throws {TypeErrror} if source is not an object
	 */
	constructor(source = {}) {
		if (typeof source !== 'object' || source === null) throw new TypeError();

		super();

		_notifier.set(this, _observe.getNotifier.call(this));

		_observe.createProperties.call(this, source);
	}


	/**
	 * Adds the properties represented by source
	 * @param {Object} source - The source object
	 * @returns {KeyedObservable}
	 */
	[ADD_PROPS](source) {
		_observe.createProperties.call(this, source);

		return this;
	}

	/**
	 * Removes the properties represented by source
	 * @param {Object} source - The source object
	 * @returns {KeyedObservable}
	 */
	[REMOVE_PROPS](source) {
		_observe.removeProperties.call(this, source);

		return this;
	}

	/**
	 * Adds observer cb to property prop
	 * @param {String} prop - The property name
	 * @param {Function} cb - The observer function
	 * @returns {KeyedObservable}
	 */
	[OBSERVE](prop, cb) {
		_notifier.get(this).addNamedListener(prop, cb);

		return this;
	}

	/**
	 * Adds global observer cb
	 * @param {Function} cb - The observer function
	 * @returns {KeyedObservable}
	 */
	[OBSERVE_ANY](cb) {
		_notifier.get(this).addListener(cb);

		return this;
	}

	/**
	 * Removes observer cb from property prop
	 * @param {String} prop - The property name
	 * @param {Function} cb - The observer function
	 * @returns {KeyedObservable}
	 */
	[RELEASE](prop, cb) {
		_notifier.get(this).removeNamedListener(prop, cb);

		return this;
	}

	/**
	 * Removes global observer cb
	 * @param {Function} cb - The observer function
	 * @returns {KeyedObservable}
	 */
	[RELEASE_ANY](cb) {
		_notifier.get(this).removeListener(cb);

		return this;
	}

	/**
	 * Removes all observers from property prop
	 * @param {String} prop - The property name
	 * @returns {KeyedObservable}
	 */
	[RELEASE_ALL](prop) {
		_notifier.get(this).removeAllNamedListeners(prop);

		return this;
	}
}



_observe
	.getFactoryQueue(_observe.DEFAULT_TYPE)
	.append((prop, val) => typeof val === 'object' && val !== null ? new KeyedObservable(val) : undefined);
