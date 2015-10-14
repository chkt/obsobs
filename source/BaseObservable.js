import Notifier, * as _notify from './Notifier';
import Queue from './ConditionalQueue';



export const DEFAULT_TYPE = Symbol('observable');


const _ERRNOINS = "not an instance";
const _ERRPROP = "invalid property manipulation";


const _factory = new Map();

const _type = new WeakMap();
const _iterator = new WeakMap();

const _value = new WeakMap();
const _child = new WeakMap();
const _notifier = new WeakMap();



function _createGetter(prop) {
	const child = _child.get(this), vals = _value.get(this);

	return () => prop in child ? child[prop] : vals[prop];
}

function _createSetter(prop) {
	const notify = _notifier.get(this);
	const vals = _value.get(this);

	return now => {
		const was = vals[prop];

		if (was === now) return;

		_removeProperty.call(this, prop, null);
		_createProperty.call(this, prop, now);

		notify.queue(prop, _notify.TYPE_UPDATE, now, was);
	};
}

function _createProperty(prop, val) {
	const type = _type.get(this);

	if (type === undefined) throw new Error(_ERRNOINS);

	const factory = _factory.get(type);
	const notify = _notifier.get(this);

	const ins = factory.process(this, prop, val);

	if (ins instanceof BaseObservable) {
		_child.get(this)[prop] = ins;
		_notifier.get(ins).setCascadeParent(notify, prop);
	}

	_value.get(this)[prop] = val;

	return {
		get : _createGetter.call(this, prop),
		set : _createSetter.call(this, prop),
		configurable : true,
		enumerable : true
	};
}

function _removeProperty(prop, val) {
	const child = _child.get(this);

	if (prop in child) {
		_notifier.get(child[prop]).resetCascadeParent();

		delete child[prop];
	}

	delete _value.get(this)[prop];
	delete this[prop];
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
	const vals = _value.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	const child = _child.get(this), notify = _notifier.get(this);

	for (let [origin, dest] of _iterator.get(this)(source)) {
		if (!(origin in vals) || dest in vals) throw new Error(_ERRPROP);

		spec[dest] = _createProperty.call(this, dest, vals[origin]);
		_removeProperty.call(this, origin, null);

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
		_child.set(this, {});
		_notifier.set(this, new Notifier(this));
	}


	*[Symbol.iterator]() {
		const vals = _value.get(this);

		for (let prop in vals) yield [prop, vals[prop]];
	}


	toJSON() {
		const child  = _child.get(this);
		const vals = _value.get(this)
		const res = {};

		for (let prop in vals) res[prop] = prop in child ? child[prop].toJSON() : vals[prop];

		return res;
	}
}
