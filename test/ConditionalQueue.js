import _assert from 'assert';

import Observable, * as _observe from '../source/BaseObservable';
import Queue from '../source/ConditionalQueue';



describe("ConditionalQueue", () => {
	describe('#process', () => {
		it("should accept an Object as first, a nonempty string as second and any value as third arg", () => {
			const obs = new Observable(function* () {}(), _observe.DEFAULT_TYPE);
			const ins = new Queue();

			_assert.doesNotThrow(() => ins.process({}, 'foo', "1"));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', "1"));
		});

		it("should only accept an Object as first arg", () => {
			const ins = new Queue();

			_assert.throws(() => ins.process(true, 'foo', "1"));
			_assert.throws(() => ins.process(1, 'foo', "1"));
			_assert.throws(() => ins.process("1", 'foo', "1"));
			_assert.throws(() => ins.process(null, 'foo', "1"));
		});

		it("should only accept a nonempty string as second arg", () => {
			const obs = new Observable(function* () {}, _observe.DEFAULT_TYPE);
			const ins = new Queue();

			_assert.throws(() => ins.process(obs, 1, "1"), TypeError);
			_assert.throws(() => ins.process(obs, true, "1"), TypeError);
			_assert.throws(() => ins.process(obs, "", "1"), TypeError);
			_assert.throws(() => ins.process(obs, null, "1"), TypeError);
		});

		it("should accept any value as third argument", () => {
			const obs = new Observable(function* () {}, _observe.DEFAULT_TYPE);
			const ins = new Queue();

			_assert.doesNotThrow(() => ins.process(obs, 'foo', true));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', 1));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', "1"));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', null));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', undefined));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', {}));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', NaN));
			_assert.doesNotThrow(() => ins.process(obs, 'foo', Symbol()));
		});

		it("should return the return value of the first function that does not return undefined", () => {
			function fna(source, prop, value) {}
			function fnb(source, prop, value) {
				return 1;
			}
			function fnc(source, prop, value) {
				return 2;
			}

			const obs = new Observable(function* () {}(), _observe.DEFAULT_TYPE);
			const ins = new Queue(fna, fnb, fnc);

			_assert.strictEqual(ins.process(obs, 'foo', 0), 1);
		});

		it("should return the value if no function does not return undefined", () => {
			function fna() {}
			function fnb() {}
			function fnc() {}

			const obs = new Observable(function* (){}(), _observe.DEFAULT_TYPE);
			const ins = new Queue(fna, fnb, fnc);

			_assert.strictEqual(ins.process(obs, 'foo', 0), 0);
		});
	});
});
