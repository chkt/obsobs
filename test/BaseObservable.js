import _assert from 'assert';

import Observable, * as _observe from '../source/BaseObservable';
import Notifier, * as _notify from '../source/Notifier';



const _genEmpty = function* () {};

const _genObj = function* (source) {
	for (let prop in source) {
		if (!source.hasOwnProperty(prop)) continue;

		yield [prop, source[prop]];
	}
};

const _factType = Symbol();

const _factObs = function(prop, val, target) {
	if (typeof val === 'object' && val !== null) {
		if (!(target instanceof Observable)) target = new Observable(_genObj, _factType);

		target[_observe.SET_PROPERTIES](val);

		return target;
	}
};



describe('getNotifier', () => {
	it("expects this to be an observable", () => {
		const ins = new Observable(_genEmpty, _observe.DEFAULT_TYPE);

		_assert.throws(() => _observe.getNotifier(), Error);
		_assert.throws(() => _observe.getNotifier.call(null), Error);
		_assert.doesNotThrow(() => _observe.getNotifier.call(ins));
	});

	it("returns the notifier associated with an observable", done => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		const notify = _observe.getNotifier.call(ins);

		_observe.createProperties.call(ins, { a : 1 });

		notify.addListener((now, was, meta) => done());
	});
});

describe('createProperties', () => {
	it("expects this to be an observable", () => {
		const ins = new Observable(_genEmpty, _observe.DEFAULT_TYPE);

		_assert.throws(() => _observe.createProperties(), Error);
		_assert.throws(() => _observe.createProperties.call(null), Error);
		_assert.doesNotThrow(() => _observe.createProperties.call(ins));
	});

	it("creates properties from a source object", () => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		_observe.createProperties.call(ins, { a : 1 });
		_assert.strictEqual(ins.a, 1);
	});

	it("does not allow creating duplicate properties", () => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		_assert.doesNotThrow(() => _observe.createProperties.call(ins, { a : 1 }));
		_assert.throws(() => _observe.createProperties.call(ins, { a : 1 }), Error);
	});
});

describe('removeProperties', () => {
	it("expects this to be an observable", () => {
		const ins = new Observable(_genEmpty, _observe.DEFAULT_TYPE);

		_assert.throws(() => _observe.removeProperties(), Error);
		_assert.throws(() => _observe.removeProperties.call(null), Error);
		_assert.doesNotThrow(() => _observe.removeProperties.call(ins, {}));
	});

	it("removes properties from a source object", () => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		_observe.createProperties.call(ins, { a : 1 });

		_assert.doesNotThrow(() => _observe.removeProperties.call(ins, { a : 1 }));
		_assert(!('a' in ins));
	});

	it("does not allow removing noexistant properties", () => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		_assert.throws(() => _observe.removeProperties.call(ins, { a : 1 }), Error);
	});
});

describe('moveProperties', () => {
	it("expects this to be an observable", () => {
		const ins = new Observable(_genEmpty, _observe.DEFAULT_TYPE);

		_assert.throws(() => _observe.moveProperties(), Error);
		_assert.throws(() => _observe.moveProperties.call(null), Error);
		_assert.doesNotThrow(() => _observe.moveProperties.call(ins));
	});

	it("moves properties of a source object", () => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		_observe.createProperties.call(ins, { a : 1 });

		_assert.doesNotThrow(() => _observe.moveProperties.call(ins, { a : 'b' }));
		_assert.strictEqual(ins.b, 1);
	});

	it("does not allow moving nonexistant properties", () => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		_assert.throws(() => _observe.moveProperties.call(ins, { a : 'b' }), Error);
	});

	it("does not allow moving to existing properties", () => {
		const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

		_observe.createProperties.call(ins, { a : 1, b : 2 });

		_assert.throws(() => _observe.moveProperties.call(ins, { a : 'b' }), Error);
	});
});


describe('BaseObservable', () => {
	describe('.configure', () => {
		it("should accept a generator as first arg");

		it("should only accept a symbol as second arg");

		it("should accept any number of functions as additional arguments");

		it("should only accept functions as additional arguments");

		it("should be chainable");
	});

	describe('#constructor', () => {
		it("should accept an iterator as first and a symbol as second arg", () => {
			_assert.doesNotThrow(() => new Observable(_genEmpty, Symbol()));
		});

		it("should only accept an iterator as first arg");

		it("should only accept a symbol as second arg", () => {
			_assert.throws(() => new Observable(_genEmpty, 'foo'), TypeError);
			_assert.throws(() => new Observable(_genEmpty, {}), TypeError);
			_assert.throws(() => new Observable(_genEmpty, () => 1), TypeError);
		});

		it("should return an instance", () => {
			const ins = new Observable(_genEmpty, Symbol());

			_assert(ins instanceof Observable);
		});
	});


	describe('#[SET_PROPERTIES]', () => {
		it("should accept an object argument", () => {
			const ins = new Observable(_genEmpty);

			_assert.doesNotThrow(() => ins[_observe.SET_PROPERTIES]({}));
		});

		it("should only accept an object argument", () => {
			const ins = new Observable(_genEmpty());
			const set = _observe.SET_PROPERTIES;

			_assert.throws(() => ins[set](true), TypeError);
			_assert.throws(() => ins[set](1), TypeError);
			_assert.throws(() => ins[set]("1"), TypeError);
			_assert.throws(() => ins[set](null), TypeError);
			_assert.throws(() => ins[set](() => 1), TypeError);
			_assert.throws(() => ins[set](Symbol()), TypeError);
		});

		it("should add scalar properties to the instance", () => {
			const ins = new Observable(_genObj);

			ins[_observe.SET_PROPERTIES]({
				a : 1,
				b : 2,
				c : 3
			});

			_assert.strictEqual(ins.a, 1);
			_assert.strictEqual(ins.b, 2);
			_assert.strictEqual(ins.c, 3);
		});

		it("should update scalar properties on the instance", () => {
			const ins = new Observable(_genObj);
			const set = _observe.SET_PROPERTIES;

			ins[set]({
				a : 1
			});

			ins[set]({
				a : 2
			});

			_assert.strictEqual(ins.a, 2);
		});

		it("should remove scalar properties from the instance", () => {
			const ins = new Observable(_genObj);
			const set = _observe.SET_PROPERTIES;

			ins[set]({
				a : 1,
				b : 2,
				c : 3
			});

			ins[set]({});

			_assert(!('a' in ins));
			_assert(!('b' in ins));
			_assert(!('c' in ins));
		});

		it("should add nested properties to the instance", () => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);

			ins[_observe.SET_PROPERTIES]({
				a : {
					a : 1,
					b : 2,
					c : 3
				}
			});

			_assert(ins.a instanceof Observable);
			_assert.strictEqual(ins.a.a, 1);
			_assert.strictEqual(ins.a.b, 2);
			_assert.strictEqual(ins.a.c, 3);
		});

		it("should update nested properties on the instance", () => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);
			const set = _observe.SET_PROPERTIES;

			ins[set]({
				a : {
					a : 1
				}
			});

			const was = ins.a;

			ins[set]({
				a : {
					a : 2
				}
			});

			_assert(ins.a instanceof Observable);
			_assert.strictEqual(ins.a, was);
			_assert.strictEqual(ins.a.a, 2);
		});

		it("should mutate properties from scalar to nested", () => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);
			const set = _observe.SET_PROPERTIES;

			ins[set]({ a : 1 });
			ins[set]({ a : { a : 1 }});

			_assert(ins.a instanceof Observable);
			_assert.strictEqual(ins.a.a, 1);
		});

		it("should mutate properties from nested to scalar", () => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);
			const set = _observe.SET_PROPERTIES;

			ins[set]({ a : { a : 1 }});
			ins[set]({ a : 1 });

			_assert.strictEqual(ins.a, 1);
		});

		it("should remove nested properties from the instance", () => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);
			const set = _observe.SET_PROPERTIES;

			ins[set]({
				a : {
					a : 1
				}
			});

			ins[set]({ a : {}});

			_assert(ins.a instanceof Observable);
			_assert(!('a' in ins.a));
		});

		it("should notify when creating scalar properties", done => {
			const ins = new Observable(_genObj);

			ins[_observe.SET_PROPERTIES]({ a : 1 });

			_observe.getNotifier.call(ins).addListener((now, was, meta) => {
				if (
					now === 1 &&
					was === undefined &&
					meta.type === _notify.TYPE_ADD
				) done();
				else done(new Error());
			});
		});

		it("should notify when updating scalar properties", done => {
			const ins = new Observable(_genObj);
			const set = _observe.SET_PROPERTIES;

			ins[set]({ a : 1 });
			ins[set]({ a : 2 });

			_observe.getNotifier.call(ins).addListener((now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 2 &&
					was === 1 &&
					meta.type === _notify.TYPE_UPDATE
				) done();
				else done(new Error());
			});
		});

		it("should notify when removing scalar properties", done => {
			const ins = new Observable(_genObj);
			const set = _observe.SET_PROPERTIES;

			ins[set]({ a : 1});
			ins[set]({});

			_observe.getNotifier.call(ins).addListener((now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === undefined &&
					was === 1 &&
					meta.type === _notify.TYPE_REMOVE
				) done();
				else done(new Error());
			});
		});

		it("should notify when creating nested properties", done => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);

			ins[_observe.SET_PROPERTIES]({
				a : {
					a : 1
				}
			});

			_observe.getNotifier.call(ins).addListener((now, was, meta) => {
				if (meta.path.length === 1) return;
				else if (
					now === 1 &&
					was === undefined &&
					meta.type === _notify.TYPE_ADD
				) done();
				else done(new Error());
			});
		});

		it("should notify when updating nested properties", done => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);
			const set = _observe.SET_PROPERTIES;

			ins[set]({
				a : {
					a : 1
				}
			});

			ins[set]({
				a : {
					a : 2
				}
			});

			_observe.getNotifier.call(ins).addListener((now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 2 &&
					was === 1 &&
					meta.type === _notify.TYPE_UPDATE
				) done();
				else done(new Error());
			});
		});

		it("should notify when removing nested properties", done => {
			Observable.configure(_factType, _factObs);

			const ins = new Observable(_genObj, _factType);
			const set = _observe.SET_PROPERTIES;

			ins[set]({
				a : {
					a : 1
				}
			});

			ins[set]({ a : {}});

			_observe.getNotifier.call(ins).addListener((now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === undefined &&
					was === 1 &&
					meta.type === _notify.TYPE_REMOVE
				) done();
				else done(new Error());
			});
		});

		it("should be chainable", () => {
			const ins = new Observable(_genObj);

			_assert.strictEqual(ins[_observe.SET_PROPERTIES]({}), ins);
		});
	});


	describe('#[Symbol.iterator]', () => {
		it("should return an iterator", () => {
			const ins = new Observable(_genEmpty, Symbol());
			const iterator = ins[Symbol.iterator]();

			_assert(typeof iterator === 'object');
			_assert(iterator !== null);
			_assert(typeof iterator.next === 'function');
		});

		it("should iterate over all property values", () => {
			const ins = new Observable(_genObj, _observe.DEFAULT_TYPE);

			_observe.createProperties.call(ins, {
				a : 1,
				b : 2,
				c : 3
			});

			for (let [prop, val] of ins) {
				if (prop === 'a') _assert.strictEqual(val, 1);
				else if (prop === 'b') _assert.strictEqual(val, 2);
				else if (prop === 'c') _assert.strictEqual(val, 3);
			}
		});
	});

	describe('#toJSON', () => {});
});
