import _assert from 'assert';

import * as _observe from '../source/BaseObservable';
import Observable from '../source/IndexedObservable';



describe('IndexedObservable', () => {
	describe('#constructor', () => {
		_observe
			.getConfiguration(Observable)
			.set({ factoryType : _observe.DEFAULT_TYPE });

		it("should create an instance", () => {
			const ins = new Observable();

			_assert(ins instanceof Observable);
		});

		it("should only accept an Array as sole arg", () => {
			_assert.throws(() => new Observable("1"), TypeError);
			_assert.throws(() => new Observable(1), TypeError);
			_assert.throws(() => new Observable(true), TypeError);
			_assert.throws(() => new Observable({}), TypeError);
			_assert.doesNotThrow(() => new Observable([]));
			_assert.throws(() => new Observable(() => 1), TypeError);
			_assert.throws(() => new Observable(Symbol()), TypeError);
		});
	});

	describe("#length", () => {
		it("should return an uint", () => {
			const ins = new Observable();

			_assert(Number.isSafeInteger(ins.length));
			_assert(ins.length >= 0);
		});

		it("should reflect the number of items", () => {
			const ins = new Observable([1, 2, 3]);

			_assert.strictEqual(ins.length, 3);
		});

		it("should not be settable", () => {
			const ins = new Observable();

			_assert.throws(() => ins.length = 1);
		});
	})

	describe("#insert", () => {
		it("should expect an uint as first argument", () => {
			const ins = new Observable();

			_assert.doesNotThrow(() => ins.insert(0));
		});

		it("should only expect an uint as first argument", () => {
			const ins = new Observable();

			_assert.throws(() => ins.insert(-1), TypeError);
			_assert.throws(() => ins.insert(0.1), TypeError);
			_assert.throws(() => ins.insert(Number.MAX_VALUE), TypeError);
			_assert.throws(() => ins.insert("0"), TypeError);
			_assert.throws(() => ins.insert(true), TypeError);
			_assert.throws(() => ins.insert({}), TypeError);
		});

		it("should require the first argument to be in range", () => {
			const ins = new Observable();

			_assert.doesNotThrow(() => ins.insert(0));
			_assert.throws(() => ins.insert(1), RangeError);
		});

		it("should accept any number of additional arguments", () => {
			const ins = new Observable();

			_assert.doesNotThrow(() => ins.insert(0));
			_assert.doesNotThrow(() => ins.insert(0, 1));
			_assert.doesNotThrow(() => ins.insert(0, 1, 2, 3));
		});

		it("should insert scalar items into the instance", () => {
			const ins = new Observable();

			ins.insert(0, 4, 5, 6);
			ins.insert(0, 1, 2, 3);

			_assert.strictEqual(ins.length, 6);
			_assert.strictEqual(ins[0], 1);
			_assert.strictEqual(ins[1], 2);
			_assert.strictEqual(ins[2], 3);
			_assert.strictEqual(ins[3], 4);
			_assert.strictEqual(ins[4], 5);
			_assert.strictEqual(ins[5], 6);
		});

		it("should insert indexed items into the instance", () => {
			const ins = new Observable();

			ins.insert(0, [1, 2, 3]);

			_assert.strictEqual(ins.length, 1);
			_assert(ins[0] instanceof Observable);
			_assert.strictEqual(ins[0].length, 3);
			_assert.strictEqual(ins[0][0], 1);
			_assert.strictEqual(ins[0][1], 2);
			_assert.strictEqual(ins[0][2], 3);
		});

		it("should be chainable", () => {
			const ins = new Observable();

			_assert.strictEqual(ins.insert(0), ins);
		});
	});

	describe("#append", () => {
		it("should accept any number of additional arguments", () => {
			const ins = new Observable();

			_assert.doesNotThrow(() => ins.append());
			_assert.doesNotThrow(() => ins.append(1));
			_assert.doesNotThrow(() => ins.append(1, 2, 3));
		});

		it("should append scalar items to the instance", () => {
			const ins = new Observable();

			ins.append(1, 2, 3);

			_assert.strictEqual(ins.length , 3);
			_assert.strictEqual(ins[0], 1);
			_assert.strictEqual(ins[1], 2);
			_assert.strictEqual(ins[2], 3);
		});

		it("should append indexed items to the instance", () => {
			const ins = new Observable();

			ins.append([1, 2, 3]);

			_assert.strictEqual(ins.length, 1);
			_assert(ins[0] instanceof Observable);
			_assert.strictEqual(ins[0].length, 3);
			_assert.strictEqual(ins[0][0], 1);
			_assert.strictEqual(ins[0][1], 2);
			_assert.strictEqual(ins[0][2], 3);
		});

		it("should be chainable", () => {
			const ins = new Observable();

			_assert.strictEqual(ins.append(), ins);
		});
	});

	describe("#remove", () => {
		it("should expect an uint as first argument", () => {
			const ins = new Observable([1]);

			_assert.doesNotThrow(() => ins.remove(0));
		});

		it("should only expect an uint as first argument", () => {
			const ins = new Observable();

			_assert.throws(() => ins.remove(-1), TypeError);
			_assert.throws(() => ins.remove(0.1), TypeError);
			_assert.throws(() => ins.remove(Number.MAX_VALUE), TypeError);
			_assert.throws(() => ins.remove("0"), TypeError);
			_assert.throws(() => ins.remove(true), TypeError);
			_assert.throws(() => ins.remove({}), TypeError);
		});

		it("should require the first argument to be in range", () => {
			const ins = new Observable([1]);

			_assert.throws(() => ins.remove(2), RangeError);
			_assert.doesNotThrow(() => ins.remove(1));
			_assert.doesNotThrow(() => ins.remove(0));
		});

		it("should accept any number of additional arguments", () => {
			const ins = new Observable([
				1,
				2,
				3,
				4
			]);

			_assert.doesNotThrow(() => ins.remove(0));
			_assert.doesNotThrow(() => ins.remove(0, 1));
			_assert.doesNotThrow(() => ins.remove(0, 2, 3, 4));
		});

		it("should remove scalar items from the instance", () => {
			const ins = new Observable([1, 2, 3]);

			ins.remove(0, 1, 2);

			_assert.strictEqual(ins.length, 1);
			_assert.strictEqual(ins[0], 3);
		});

		it("should remove indexed items from the instance", () => {
			const ins = new Observable([[1, 2, 3]]);

			ins.remove(0, 1);

			_assert.strictEqual(ins.length, 0);
			_assert(!('0' in ins));
		});

		it("should be chainable", () => {
			const ins = new Observable([1]);

			_assert.strictEqual(ins.remove(0, 1), ins);
		});
	});

	describe('#toJSON', () => {
		it("should return an array", () => {
			const ins = new Observable();

			_assert.deepStrictEqual(ins.toJSON(), []);
		});

		it("should return original scalar model if unchanged", () => {
			const model = [ 'a', 'b', 'c' ];

			_assert.deepStrictEqual(new Observable(model).toJSON(), model);
		});

		it("should return modified scalar model if changed", () => {
			const model = ['a', 'b', 'c'];

			const ins = new Observable(model);

			model[2] = 'd', ins[2] = 'd';

			_assert.deepStrictEqual(ins.toJSON(), model);
		});

		it("should return original nested model if unchanged", () => {
			const model = [[ 'a', 'b', 'c' ]];

			_assert.deepStrictEqual(new Observable(model).toJSON(), model);
		});

		it("should return modified nested model if changed", () => {
			const model = [[ 'a', 'b', 'c' ]];

			const ins = new Observable(model);

			model[0][2] = 'd', ins[0][2] = 'd';

			_assert.deepStrictEqual(ins.toJSON(), model);
		});
	});
});
