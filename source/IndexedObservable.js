import Observable, * as _observe from './BaseObservable';
import * as _ops from 'obsops';



const _length = new WeakMap();
const _notifier = new WeakMap();



/**
 * The IndexedObservable iteration generator
 * @param {Array} source - The source Array
 * @yields [{String}, {*}]
 * @throws {TypeError} if source is not an Array
 */
function* iterate(source) {
	if (!Array.isArray(source)) throw new TypeError();

	for (let i = 0, l = source.length; i < l; i += 1) {
		const val = source[i];

		if (val === undefined) continue;

		yield [String(i), val];
	}
}

/**
 * The IndexedObservable property update resolver
 * @param {Array} now - The new property state
 * @param {Array} was - The old property state
 * @returns {Object}
 */
function resolve(now, was) {
	const add = _ops.differenceByValue(now, was);
	const remove = _ops.differenceByValue(was, now);
	const update = {}, move = {};

	remove.forEach((item, index, source) => {
		const rel = add.indexOf(item);

		if (rel === index) {
			update[index] = add[index];

			delete add[index];
			delete remove[index];
		}
		else if (rel !== -1) {
			move[index] = rel;

			delete add[rel];
			delete remove[index];
		}
		else if (index in now) {
			update[index] = _ops.difference(now[index], remove[index]);

			delete remove[index];
		}
	});

	return {
		add,
		remove,
		update,
		move
	};
}



export default class IndexedObservable extends Observable {
	/**
	 * Creates a new instance
	 * @param {Array} source - The source Array
	 * @throws {TypeError} if source is not an Array
	 */
	constructor(source = []) {
		if (!Array.isArray(source)) throw new TypeError();

		super();

		_length.set(this, 0);
		_notifier.set(this, _observe.getNotifier.call(this));

		if (source.length !== 0) this.append(...source);
	}


	/**
	 * The length
	 * @readonly
	 */
	get length() {
		return _length.get(this);
	}


	/**
	 * Inserts new items at index
	 * @param {Uint} index - The insertion index
	 * @param {*} items - The new items
	 * @returns {IndexedObservable}
	 * @throws {TypeError} if index is not an Uint
	 * @throws {RangeError} if index is out of range
	 */
	insert(index, ...items) {
		if (!Number.isSafeInteger(index) || index < 0) throw new TypeError();

		const len = _length.get(this);

		if (index > len) throw new RangeError();

		const move = [], add = [], ilen = items.length;

		for (let i = len - 1; i > index - 1; i -= 1) move[i] = String(i + ilen);

		for (let i = 0, item = items[0]; i < ilen; item = items[++i]) add[index + i] = item;

		_observe.moveProperties.call(this, move);
		_observe.createProperties.call(this, add);

		_length.set(this, len + ilen);

		return this;
	}

	/**
	 * Appends new items
	 * @param {*} items - The new items
	 * @returns {IndexedObservable}
	 */
	append(...items) {
		const len = _length.get(this);
		const add = [], ilen = items.length;

		for (let i = 0, item = items[0]; i < ilen; item = items[++i]) add[len + i] = item;

		_observe.createProperties.call(this, add);

		_length.set(this, len + ilen);

		return this;
	}

	/**
	 * Removes items items at index
	 * @param {Uint} index - The removal index
	 * @param {*} items - The removal items
	 * @returns {IndexedObservable}
	 * @throws {TypeError} if index is not an Uint
	 * @throws {RangeError} if index + items.length is out of range
	 */
	remove(index, ...items) {
		if (!Number.isSafeInteger(index) || index < 0) throw new TypeError();

		const len = _length.get(this);
		const remove = [], move = [], ilen = items.length;

		if (index + ilen > len) throw new RangeError();

		if (ilen === 0) return this;

		for (let i = index + ilen; i < len; i += 1) move[i] = String(i - ilen);

		for (let i = 0, item = items[0]; i < ilen; item = items[++i]) remove[index + i] = item;

		_observe.removeProperties.call(this, remove);
		_observe.moveProperties.call(this, move);

		_length.set(this, len - ilen);

		return this;
	}


	/**
	 * Adds global observer cb
	 * @param {Function} cb - The observer function
	 * @returns {IndexedObservable}
	 */
	observe(cb) {
		_notifier.get(this).addListener(cb);

		return this;
	}

	/**
	 * Removes global observer cb
	 * @param {Function} cb - The observer function
	 * @returns {IndexedObservable}
	 */
	release(cb) {
		_notifier.get(this).removeListener(cb);

		return this;
	}
}



_observe
	.getFactoryQueue(_observe.DEFAULT_TYPE)
	.append((prop, val) => Array.isArray(val) ? new IndexedObservable(val) : undefined);

_observe
	.getConfiguration(IndexedObservable)
	.set({
		scalarType : Array,
		scalarIterator : iterate,
		propertyResolver : resolve
	});
