import _assert from 'assert';

import * as _notify from '../source/Notifier.js';
import Observable, {
	ADD_PROPS,
	REMOVE_PROPS,
	OBSERVE,
	OBSERVE_ANY,
	RELEASE,
	RELEASE_ANY,
	RELEASE_ALL
} from '../source/KeyedObservable';



describe('KeyedObservable', () => {
	describe('#constructor', () => {
		it("should create an instance", () => {
			const ins = new Observable();

			_assert(ins instanceof Observable);
		});

		it("should take an object argument", () => {
			const ins = new Observable({
				a : 1
			});

			_assert(ins instanceof Observable);
		});

		it("should only take an object argument", () => {
			_assert.throws(() => new Observable("1"), TypeError);
			_assert.throws(() => new Observable(1), TypeError);
			_assert.throws(() => new Observable(true), TypeError);
			_assert.throws(() => new Observable(() => 1), TypeError);
			_assert.throws(() => new Observable(Symbol()), TypeError);
			_assert.throws(() => new Observable(NaN), TypeError);
			_assert.throws(() => new Observable(null), TypeError);
		});
	});

	describe('#[ADD_PROPS]', () => {
		it("should expect an object", () => {
			const ins = new Observable();

			_assert.throws(() => ins[ADD_PROPS](), TypeError);
			_assert.throws(() => ins[ADD_PROPS]("1"), TypeError);
			_assert.throws(() => ins[ADD_PROPS](1), TypeError);
			_assert.throws(() => ins[ADD_PROPS](true), TypeError);
			_assert.throws(() => ins[ADD_PROPS](() => {}), TypeError);
			_assert.doesNotThrow(() => ins[ADD_PROPS]({}));
		});

		it("should be chainable", () => {
			const ins = new Observable();

			_assert.strictEqual(ins[ADD_PROPS]({}), ins);
		});

		it("should add scalar properties", () => {
			const ins = new Observable();

			ins[ADD_PROPS]({
				a : "1",
				b : 1,
				c : true,
				d : null,
				e : NaN
			});

			_assert.strictEqual(ins.a, "1");
			_assert.strictEqual(ins.b, 1);
			_assert.strictEqual(ins.c, true);
			_assert.strictEqual(ins.d, null);
			_assert(Number.isNaN(ins.e));
		});

		it("should add keyed child objects", () => {
			const ins = new Observable();

			ins[ADD_PROPS]({
				a : {
					a : 1,
					b : 2,
					c : 3
				}
			});

			_assert.strictEqual(ins.a.a, 1);
			_assert.strictEqual(ins.a.b, 2);
			_assert.strictEqual(ins.a.c, 3);
		});

		it("should add indexed child objects");
	});

	describe('#[OBSERVE]', () => {
		it("should expect a string and a function", () => {
			const ins = new Observable({ a : 1 });

			function fna() {}

			_assert.throws(() => ins[OBSERVE](), TypeError);
			_assert.throws(() => ins[OBSERVE](1), TypeError);
			_assert.throws(() => ins[OBSERVE]('', fna), TypeError);
			_assert.throws(() => ins[OBSERVE]('a'), TypeError);
			_assert.throws(() => ins[OBSERVE]('a', 1), TypeError);
			_assert.doesNotThrow(() => ins[OBSERVE]('a', fna));
		});

		it("should be chainable", () => {
			const ins = new Observable({ a : 1});

			function fna() {}

			_assert.strictEqual(ins[OBSERVE]('a', fna), ins);
		});

		it("should observe property creation", done => {
			const ins = new Observable();

			ins[OBSERVE]('a', (now, was, meta) => {
				if (
					now === 1 &&
					was === undefined &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_ADD &&
					meta.origin === ins
				) done();
				else done(new Error());
			});

			ins[ADD_PROPS]({ a : 1 });
		});

		it("should observe property creation during construction", done => {
			const ins = new Observable({ a : 1 });

			ins[OBSERVE]('a', (now, was, meta) => {
				if (
					now === 1 &&
					was === undefined &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_ADD &&
					meta.origin === ins
				) done();
				else done(new Error());
			});
		});

		it("should observe changes to atomic properties", done => {
			const ins = new Observable({ a : "1" });

			ins[OBSERVE]('a', (now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 1 &&
					was === "1" &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_UPDATE &&
					meta.origin === ins
				) done();
				else done(new Error());
			});

			ins.a = 1;
		});

		it("should observe changes to keyed child objects", done => {
			const ins = new Observable({ a : { b : 1 }});

			ins[OBSERVE]('a', (now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 2 &&
					was === 1 &&
					meta.property === 'b' &&
					meta.type === _notify.TYPE_UPDATE &&
					meta.origin === ins.a
				) done();
				else done(new Error());
			});

			ins.a.b = 2;
		});

		it("should observe property destruction");

		it("should observe changes to indexed child objects");

		it("should operate asynchronously", done => {
			const ins =  new Observable({ a : 1 });
			let sync = true;

			ins[OBSERVE]('a', (now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 2 &&
					was === 1 &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_UPDATE &&
					meta.origin === ins &&
					!sync
				) done();
				else done(new Error());
			});

			ins.a = 2;
			sync = false;
		});
	});

	describe('#[OBSERVE_ANY]', () => {
		it("should expect a function", () => {
			const ins = new Observable({ a : 1 });

			function fna() {}

			_assert.throws(() => ins[OBSERVE_ANY](), TypeError);
			_assert.throws(() => ins[OBSERVE_ANY](1), TypeError);
			_assert.throws(() => ins[OBSERVE_ANY]('', fna), TypeError);
			_assert.throws(() => ins[OBSERVE_ANY]({}), TypeError);
			_assert.doesNotThrow(() => ins[OBSERVE_ANY](fna));
		});

		it("should be chainable", () => {
			const ins = new Observable({ a : 1 });

			function fna() {}

			_assert.strictEqual(ins[OBSERVE_ANY](fna), ins);
		});

		it("should observe property creation", done => {
			const ins = new Observable();

			ins[OBSERVE_ANY]((now, was, meta) => {
				if (
					now === 1 &&
					was === undefined &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_ADD &&
					meta.origin === ins
				) done();
				else done(new Error());
			});

			ins[ADD_PROPS]({ a : 1 });
		});

		it("should observe property creation during construction", done => {
			const ins = new Observable({ a : 1 });

			ins[OBSERVE_ANY]((now, was, meta) => {
				if (
					now === 1 &&
					was === undefined &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_ADD &&
					meta.origin === ins
				) done();
				else done(new Error());
			});
		});

		it("should observe changes to atomic properties", done => {
			const ins = new Observable({ a : "1" });

			ins[OBSERVE_ANY]((now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 1 &&
					was === "1" &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_UPDATE &&
					meta.origin === ins
				) done();
				else done(new Error());
			});

			ins.a = 1;
		});

		it("should observe changes to keyed child objects", done => {
			const ins = new Observable({ a : { b : 1 }});

			ins[OBSERVE_ANY]((now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 2 &&
					was === 1 &&
					meta.property === 'b' &&
					meta.type === _notify.TYPE_UPDATE &&
					meta.origin === ins.a
				) done();
				else done(new Error());
			});

			ins.a.b = 2;
		});

		it("should observe property destruction");

		it("should observe changes to indexed child objects");

		it("should operate asynchronously", done => {
			const ins = new Observable({ a : 1 });
			let sync = true;

			ins[OBSERVE_ANY]((now, was, meta) => {
				if (meta.type === _notify.TYPE_ADD) return;
				else if (
					now === 2 &&
					was === 1 &&
					meta.property === 'a' &&
					meta.type === _notify.TYPE_UPDATE &&
					meta.origin === ins &&
					!sync
				) done();
				else done(new Error());
			});

			ins.a = 2;
			sync = false;
		});
	});

	describe('#[RELEASE]', () => {
		it("should expect a string and a function", () => {
			const ins = new Observable({ a : 1 });

			function fna() {}

			_assert.throws(() => ins[RELEASE](), TypeError);
			_assert.throws(() => ins[RELEASE](1), TypeError);
			_assert.throws(() => ins[RELEASE]('', fna), TypeError);
			_assert.throws(() => ins[RELEASE]('a'), TypeError);
			_assert.throws(() => ins[RELEASE]('a', 1), TypeError);
			_assert.doesNotThrow(() => ins[RELEASE]('a', fna));
		});

		it("should be chainable", () => {
			const ins = new Observable({ a : 1});

			function fna() {}

			_assert.strictEqual(ins[RELEASE]('a', fna), ins);
		});
	});

	describe('#[RELEASE_ANY]', () => {
		it("should expect a function", () => {
			const ins = new Observable({ a : 1 });

			function fna() {}

			_assert.throws(() => ins[RELEASE_ANY](), TypeError);
			_assert.throws(() => ins[RELEASE_ANY](1), TypeError);
			_assert.throws(() => ins[RELEASE_ANY]('', fna), TypeError);
			_assert.throws(() => ins[RELEASE_ANY]({}), TypeError);
			_assert.doesNotThrow(() => ins[RELEASE_ANY](fna));
		});

		it("should be chainable", () => {
			const ins = new Observable({ a : 1 });

			function fna() {}

			_assert.strictEqual(ins[RELEASE_ANY](fna), ins);
		});
	});

	describe('#toJSON', () => {
		it("should return an object", () => {
			const ins = new Observable();

			_assert.deepStrictEqual(ins.toJSON(), {});
		});

		it("should return original scalar model if unchanged", () => {
			const model = {
				a : 1,
				b : 2,
				c : 3
			};

			_assert.deepStrictEqual(new Observable(model).toJSON(), model);
		});

		it("should return modified scalar model if changed", () => {
			const model = {
				a : 1,
				b : 2,
				c : 3
			};

			const ins = new Observable(model);

			model.c = 4, ins.c = 4;

			_assert.deepStrictEqual(ins.toJSON(), model);
		});

		it("should return original nested model if unchanged", () => {
			const model = {
				a : {
					a : 1,
					b : 2,
					c : 3
				}
			};

			_assert.deepStrictEqual(new Observable(model).toJSON(), model);
		});

		it("should return modified nested model if changed", () => {
			const model = {
				a : {
					a : 1,
					b : 2,
					c : 3
				}
			};

			const ins = new Observable(model);

			model.a.c = 4, ins.a.c = 4;

			_assert.deepStrictEqual(ins.toJSON(), model);
		});
	});
});
