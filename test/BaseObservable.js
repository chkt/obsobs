import _assert from 'assert';

import Observable, * as _observe from '../source/BaseObservable';
import Notifier from '../source/Notifier';



const _genEmpty = function* () {};

const _genObj = function* (source) {
	for (let prop in source) {
		if (!source.hasOwnProperty(prop)) continue;

		yield [prop, source[prop]];
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
