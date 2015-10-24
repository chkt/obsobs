import * as _ops from 'obsops';

import Notifier, * as _notify from './Notifier';
import Queue from './ConditionalQueue';



export const DEFAULT_TYPE = Symbol('observable');
export const SET_PROPERTIES = Symbol('setProperties');


const _ERRNOINS = "not an instance";
const _ERRPROP = "invalid property manipulation";


const _factory = new Map();

const _type = new WeakMap();
const _iterator = new WeakMap();
const _resolver = new WeakMap();

const _value = new WeakMap();
const _child = new WeakMap();
const _notifier = new WeakMap();



export function* defaultIterator(source) {
	const names = Object.getOwnPropertyNames(source);

	for (let i = 0, prop = names[0]; prop !== undefined; prop = names[++i]) yield [prop, source[prop]];
}

export function defaultResolver(now, was) {
	const add = _ops.differenceByValue(now, was);
	const remove = _ops.differenceByValue(was, now);
	const update = {};

	for (let prop in remove) {
		if (prop in add) {
			update[prop] = add[prop];

			delete add[prop];
			delete remove[prop];
		}
		else if (prop in now) {
			update[prop] = _ops.difference(now[prop], remove[prop]);

			delete remove[prop];
		}
	}

	return {
		add,
		remove,
		update
	};
}



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

		_removeProperty.call(this, prop);

		Object.defineProperty(this, prop, _createProperty.call(this, prop, now));

		notify.queue(prop, _notify.TYPE_UPDATE, now, was);
	};
}


function _createProperty(prop, val) {
	const type = _type.get(this);
	const factory = getFactoryQueue(type);
	const notify = _notifier.get(this);

	if (type === undefined) throw new Error(_ERRNOINS);

	const vals = _value.get(this);

	if (prop in vals) throw new Error(_ERRPROP);

	const ins = factory.process(this, prop, val, undefined);

	if (ins instanceof BaseObservable) {
		_child.get(this)[prop] = ins;
		_notifier.get(ins).setCascadeParent(notify, prop);
	}

	vals[prop] = val;

	return {
		get : _createGetter.call(this, prop),
		set : _createSetter.call(this, prop),
		configurable : true,
		enumerable : true
	};
}

function _removeProperty(prop) {
	const vals = _value.get(this);
	const child = _child.get(this);

	if (!(prop in vals)) throw new Error(_ERRPROP);

	if (prop in child) {
		_notifier.get(child[prop]).resetCascadeParent();

		delete child[prop];
	}

	delete vals[prop];
	delete this[prop];
}

function _updateProperty(prop, val) {
	const type = _type.get(this);
	const factory = getFactoryQueue(type);
	const notify = _notifier.get(this);

	if (type === undefined) throw new Error(_ERRNOINS);

	const vals = _value.get(this);
	const child = _child.get(this);

	if (!(prop in vals)) throw new Error(_ERRPROP);

	const wasIns = prop in child ? child[prop] : undefined;
	const nowIns = factory.process(this, prop, val, wasIns);

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



export function getFactoryQueue(type) {
	if (typeof type !== 'symbol') throw new TypeError();

	if (!_factory.has(type)) _factory.set(type, new Queue());

	return _factory.get(type);
}


export function getNotifier() {
	const notify = _notifier.get(this);

	if (notify === undefined) throw new Error(_ERRNOINS);

	return notify;
}


export function createProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	const spec = {};
	const notify = _notifier.get(this);

	for (let [prop, val] of _iterator.get(this)(source)) {
		spec[prop] = _createProperty.call(this, prop, val);

		notify.queue(prop, _notify.TYPE_ADD, val, undefined);
	}

	Object.defineProperties(this, spec);
}

export function updateProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	const vals = _value.get(this);
	const child = _child.get(this);
	const notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	for (let [prop, val] of _iterator.get(this)(source)) {
		const was = vals[prop];
		const wasIns = child[prop];

		_updateProperty.call(this, prop, val);

		const nowIns = child[prop];

		if (nowIns === undefined || nowIns !== wasIns) notify.queue(prop, _notify.TYPE_UPDATE, val, was);
	}
}

export function removeProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	const vals = _value.get(this), notify = _notifier.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	for (let [prop, val] of _iterator.get(this)(source)) {
		const was = vals[prop];

		_removeProperty.call(this, prop);

		notify.queue(prop, _notify.TYPE_REMOVE, undefined, was);
	}
}

export function moveProperties(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	const spec = {};
	const vals = _value.get(this);

	if (vals === undefined) throw new TypeError(_ERRNOINS);

	const child = _child.get(this), notify = _notifier.get(this);

	for (let [origin, dest] of _iterator.get(this)(source)) {
		if (!(origin in vals) || dest in vals) throw new Error(_ERRPROP);

		spec[dest] = _createProperty.call(this, dest, vals[origin]);
		_removeProperty.call(this, origin);

		notify.queue(origin, _notify.TYPE_MOVE, dest, origin);
	}

	Object.defineProperties(this, spec);
}



export default class BaseObservable {
	static Type(type) {
		if (typeof type !== 'symbol') throw new TypeError();

		return new BaseObservable(defaultIterator, defaultResolver, type);
	}

	constructor(iterate = defaultIterator, resolve = defaultResolver, type = DEFAULT_TYPE) {
		if (
			//IMPLEMENT validate generator
			typeof resolve !== 'function' ||
			typeof type !== 'symbol'
		) throw new TypeError();

		_type.set(this, type);
		_iterator.set(this, iterate);
		_resolver.set(this, resolve);

		_value.set(this, {});
		_child.set(this, {});
		_notifier.set(this, new Notifier(this));
	}


	[SET_PROPERTIES](now) {
		if (typeof now !== 'object' || now === null) throw new TypeError();

		const was = _value.get(this);

		if (was === undefined) throw new Error(_ERRNOINS);

		const { add, remove, update, move } = _resolver.get(this).call(this, now, was);

		if (remove instanceof Object && Object.keys(remove).length !== 0) removeProperties.call(this, remove);

		if (move instanceof Object && Object.keys(move).length !== 0) moveProperties.call(this, move);

		if (update instanceof Object && Object.keys(update).length !== 0) updateProperties.call(this, update);

		if (add instanceof Object && Object.keys(add)) createProperties.call(this, add);

		return this;
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
