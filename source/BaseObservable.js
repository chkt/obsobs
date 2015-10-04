import Notifier, * as _notify from './Notifier';
import Queue from './ConditionalQueue';



export const DEFAULT_TYPE = Symbol('observable');


const _ERRNOINS = "not an instance";
const _ERRPROP = "invalid property manipulation";

const _CHILD = Symbol('child');


const _factory = new Map();

const _type = new WeakMap();
const _iterator = new WeakMap();
const _value = new WeakMap();
const _notifier = new WeakMap();



function _createGetter(prop) {
	return () => _value.get(this)[prop];
}

function _createSetter(prop) {
	const notify = _notifier.get(this);
	const vals = _value.get(this);

	return now => {
		const was = vals[prop];

		if (was === now) return;

		vals[prop] = now;

		notify.queue(prop, _notify.TYPE_UPDATE, now, was);
	};
}

function _createProperty(prop, val) {
	const type = _type.get(this);

	if (type === undefined) throw new Error(_ERRNOINS);

	const factory = _factory.get(type);
	const notify = _notifier.get(this);

	const ret = factory.process(this, prop, val);

	if (ret instanceof BaseObservable) {
		_notifier.get(ret).setCascadeParent(notify, prop);
		_value.get(this)[prop] = _CHILD;

		return {
			value : ret,
			configurable : true,
			enumerable : true
		};
	}
	else {
		_value.get(this)[prop] = val;

		return {
			get : _createGetter.call(this, prop),
			set : _createSetter.call(this, prop),
			configurable : true,
			enumerable : true
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


function* _iterate(vals) {
	for (let prop in vals) yield [prop, vals[prop]];
}


export function getNotifier() {
	const notify = _notifier.get(this);

	if (notify === undefined) throw new Error(_ERRNOINS);

	return notify;
}


export function createProperties(source) {
	const spec = {};
	const vals = _value.get(this), notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	for (let [prop, val] of _iterator.get(this)(source)) {
		if (prop in vals) throw new Error(_ERRPROP);

		spec[prop] = _createProperty.call(this, prop, val);

		notify.queue(prop, _notify.TYPE_ADD, val, undefined);
	}

	Object.defineProperties(this, spec);
}

export function removeProperties(source) {
	const vals = _value.get(this), notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	for (let [prop, val] of _iterator.get(this)(source)) {
		if (!(prop in vals)) throw new Error(_ERRPROP);

		const was = vals[prop];

		_removeProperty.call(this, prop, val);

		if (!(prop in this)) notify.queue(prop, _notify.TYPE_REMOVE, undefined, was);
	}
}

export function moveProperties(source) {
	const spec = {};
	const vals = _value.get(this), notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	for (let [origin, dest] of _iterator.get(this)(source)) {
		if (this[origin] === _CHILD) {
			spec[dest] = Object.getOwnPropertyDescriptor(this, origin);
			vals[dest] = _CHILD;

			delete this[origin];
			delete vals[origin];
		}
		else {
			_createProperty(dest, vals[origin]);
			_removeProperty(origin);
		}

		notify.queue(origin, _notify.TYPE_MOVE, dest, origin);
	}

	Object.defineProperties(this, spec);
}



export default class BaseObservable {
	static configure(type, ...factory) {
		if (typeof type !== 'symbol') throw new TypeError();

		if (!_factory.has(type)) _factory.set(type, new Queue());

		_factory.get(type).append(...factory);

		return this;
	}


	constructor(iterate, type) {
		if (
			//IMPLEMENT validate generator
			typeof type !== 'symbol'
		) throw new TypeError();

		_type.set(this, type);
		_iterator.set(this, iterate);
		_value.set(this, {});
		_notifier.set(this, new Notifier(this));
	}


	[Symbol.iterator]() {
		return _iterate.call(this, _value.get(this));
	}


	toJSON() {
		const vals = _value.get(this), res = {};

		for (let prop in vals) res[prop] = vals[prop] === _CHILD ? this[prop].toJSON() : vals[prop];

		return res;
	}
}
