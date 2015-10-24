import Observable, * as _observe from './BaseObservable';


_observe
	.getFactoryQueue(_observe.DEFAULT_TYPE)
	.append((prop, val) => typeof val === 'object' && val !== null ? new KeyedObservable(val) : undefined);



const _notifier = new WeakMap();



function* _iterate(source) {
	if (typeof source !== 'object' || source === null) throw new TypeError();

	for (let prop in source) {
		if (!source.hasOwnProperty(prop)) continue;

		yield [prop, source[prop]];
	}
}



export const ADD_PROPS = Symbol();
export const REMOVE_PROPS = Symbol();

export const OBSERVE = Symbol();
export const OBSERVE_ANY = Symbol();
export const RELEASE = Symbol();
export const RELEASE_ANY = Symbol();
export const RELEASE_ALL = Symbol();



export default class KeyedObservable extends Observable {
	constructor(source = {}, type = _observe.DEFAULT_TYPE) {
		if (
			typeof source !== 'object' || source === null ||
			typeof type !== 'symbol'
		) throw new TypeError();

		super(_observe.defaultIterator, _observe.defaultResolver, type);

		_notifier.set(this, _observe.getNotifier.call(this));

		_observe.createProperties.call(this, source);
	}


	[ADD_PROPS](source) {
		_observe.createProperties.call(this, source);

		return this;
	}

	[REMOVE_PROPS](source) {
		_observe.removeProperties.call(this, source);

		return this;
	}

	[OBSERVE](prop, cb) {
		_notifier.get(this).addNamedListener(prop, cb);

		return this;
	}

	[OBSERVE_ANY](cb) {
		_notifier.get(this).addListener(cb);

		return this;
	}

	[RELEASE](prop, cb) {
		_notifier.get(this).removeNamedListener(prop, cb);

		return this;
	}

	[RELEASE_ANY](cb) {
		_notifier.get(this).removeListener(cb);

		return this;
	}

	[RELEASE_ALL](prop) {
		_notifier.get(this).removeAllNamedListeners(prop);

		return this;
	}
}
