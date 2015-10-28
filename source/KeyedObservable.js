import Observable, * as _observe from './BaseObservable';



const _notifier = new WeakMap();



export const ADD_PROPS = Symbol();
export const REMOVE_PROPS = Symbol();

export const OBSERVE = Symbol();
export const OBSERVE_ANY = Symbol();
export const RELEASE = Symbol();
export const RELEASE_ANY = Symbol();
export const RELEASE_ALL = Symbol();



export default class KeyedObservable extends Observable {
	constructor(source = {}) {
		if (typeof source !== 'object' || source === null) throw new TypeError();

		super();

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



_observe
	.getFactoryQueue(_observe.DEFAULT_TYPE)
	.append((prop, val) => typeof val === 'object' && val !== null ? new KeyedObservable(val) : undefined);
