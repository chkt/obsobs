export const TYPE_MOVE = 0b000;
export const TYPE_ADD = 0b001;
export const TYPE_REMOVE = 0b010;
export const TYPE_UPDATE =  0b011;

export const FLAG_CASCADE = 0b100;


const _TYPES = Object.freeze([
	TYPE_MOVE,
	TYPE_ADD,
	TYPE_REMOVE,
	TYPE_UPDATE
]);



const _qIns = [];
const _qProp = [];
const _qType = [];
const _qNow = [];
const _qWas = [];

let _timeout = 0;


const _origin = new WeakMap();

const _observeProp = new WeakMap();
const _observeAny = new WeakMap();

const _parent = new WeakMap();
const _parentProp = new WeakMap();



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
	for (let cb of cbs) {
		try {
			cb.call(this, now, was, meta);
		}
		catch (err) {
			console.error(err);
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
	const meta = Object.freeze({
		origin : _origin.get(source),
		property,
		type,
		path : []
	});

	for (
		let target = source, prop = property;
		target !== undefined;
		[target, prop] = [_parent.get(target), _parentProp.get(target)]
	) {
		const origin = _origin.get(target);
		const cbsProp = _observeProp.get(target);
		const cbsAny = _observeAny.get(target);

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

	const len = _qIns.length;
	const qIns = _qIns.splice(0, len);
	const qProp = _qProp.splice(0, len);
	const qType = _qType.splice(0, len);
	const qNow = _qNow.splice(0, len);
	const qWas = _qWas.splice(0, len);

	for (let i = 0; i < len; i += 1) _notify(qIns[i], qProp[i], qType[i], qNow[i], qWas[i]);
}



export default class Notifier {
	constructor(source) {
		if (typeof source !== 'object' || source === null) throw new TypeError();

		_origin.set(this, source);

		_observeProp.set(this, {});
		_observeAny.set(this, new Set());
	}


	setCascadeParent(source, prop) {
		if (
			_origin.get(source) === undefined ||
			typeof prop !== 'string' || prop === ''
		) throw new TypeError();

		_parent.set(this, source);
		_parentProp.set(this, prop);
	}

	resetCascadeParent() {
		_parent.delete(this);
		_parentProp.delete(this);
	}


	addListener(cb) {
		if (typeof cb !== 'function') throw new TypeError();

		_observeAny.get(this).add(cb);

		return this;
	}

	addNamedListener(prop, cb) {
		if (
			typeof prop !== 'string' || prop === '' ||
			typeof cb !== 'function'
		) throw new TypeError();

		const obs = _observeProp.get(this);

		if (!(prop in obs)) obs[prop] = new Set();

		obs[prop].add(cb);

		return this;
	}

	removeListener(cb) {
		if (typeof cb !== 'function') throw new TypeError();

		_observeAny.get(this).delete(cb);

		return this;
	}

	removeNamedListener(prop, cb) {
		if (
			typeof prop !== 'string' || prop === '' ||
			typeof cb !== 'function'
		) throw new TypeError();

		const obs = _observeProp.get(this);

		if (!(prop in obs)) return this;

		const cbs = obs[prop];

		cbs.delete(cb);

		if (cbs.size === 0) delete obs[prop];

		return this;
	}

	removeAllListeners() {
		_observeAny.get(this).clear();

		return this;
	}

	removeAllNamedListeners(prop) {
		if (typeof prop !== 'string' || prop === '') throw new TypeError();

		const obs = _observeProp.get(this);

		if (prop in obs) delete obs[prop];

		return this;
	}


	queue(name, type, now, was) {
		if (
			typeof name !== 'string' || name === '' ||
			!_isNotificationType(type)
		) throw new TypeError();

		_qIns.push(this);
		_qProp.push(name);
		_qType.push(type);
		_qNow.push(now);
		_qWas.push(was);

		if (_timeout === 0) _timeout = setTimeout(_process, 0);

		return this;
	}
}
