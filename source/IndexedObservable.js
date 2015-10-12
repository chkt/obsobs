import Observable, * as _observe from './BaseObservable';


Observable.configure(
	_observe.DEFAULT_TYPE,
	(prop, val) => Array.isArray(val) ? new IndexedObservable(val) : undefined
);



const _length = new WeakMap();
const _notifier = new WeakMap();



function* _iterate(source) {
	if (!Array.isArray(source)) throw new TypeError();

	for (let i = 0, l = source.length; i < l; i += 1) {
		const val = source[i];

		if (val === undefined) continue;

		yield [String(i), val];
	}
}



export default class IndexedObservable extends Observable {
	constructor(source = [], type = _observe.DEFAULT_TYPE) {
		if (
			!Array.isArray(source) ||
			typeof type !== 'symbol'
		) throw new TypeError();

		super(_iterate, type);

		_length.set(this, 0);
		_notifier.set(this, _observe.getNotifier.call(this));

		if (source.length !== 0) this.append(...source);
	}


	get length() {
		return _length.get(this);
	}


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

	append(...items) {
		const len = _length.get(this);
		const add = [], ilen = items.length;

		for (let i = 0, item = items[0]; i < ilen; item = items[++i]) add[len + i] = item;

		_observe.createProperties.call(this, add);

		_length.set(this, len + ilen);

		return this;
	}

	remove(index, ...items) {
		if (!Number.isSafeInteger(index) || index < 0) throw new TypeError();

		const len = _length.get(this);
		const remove = [], move = [], ilen = items.length;

		if (index + ilen > len) throw new RangeError();

		if (ilen === 0) return this;

		for (let i = index + ilen; i < len; i += 1) move[i] = String(i - ilen);

		for (let i = 0, item = items[0]; i < ilen; item = items[++i]) remove[index + i] = item;

		console.log(remove, move);

		_observe.removeProperties.call(this, remove);
		_observe.moveProperties.call(this, move);

		_length.set(this, len - ilen);

		return this;
	}


	observe(cb) {
		_notifier.get(this).addListener(cb);

		return this;
	}

	release(cb) {
		_notifier.get(this).removeListener(cb);

		return this;
	}
}
