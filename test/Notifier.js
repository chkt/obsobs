import _assert from 'assert';

import Notifier from '../source/Notifier';
import * as _notify from '../source/Notifier';


const _ERRTEST = "malformed test";

const _args = [
	undefined,
	"a",
	12345,
	true,
	() => 1,
	Symbol(),
	NaN,
	null,
	{},
	[]
];


function _generateArguments(generate, expect, throwing) {
	const args = [], throws = [];
	const gl = generate.length, el = expect.length;

	for (let i = 0, il = Math.pow(el, gl); i < il; i += 1) {
		const unique = [];
		let fails = false;

		for (let j = 0; j < el; j += 1) {
			const offset = Math.trunc(i / Math.pow(gl, j)) % gl;
			const val = generate[offset];

			if (!Object.is(val, expect[j])) fails = true;

			unique.push(val);
		}

		args.push(unique);
		throws.push(fails ? throwing : false);
	}

	return [args, throws];
}

function _runsWithArguments(fn, args, throws) {
	const l = args.length;

	if (throws.length !== l) _assert.fail(_ERRTEST);

	for (let i = 0; i < l; i += 1) {
		if (throws[i] !== false) _assert.throws(() => {
			fn(...args[i]);
		}, throws[i]);
		else _assert.doesNotThrow(() => {
			fn(...args[i]);
		});
	}
}

function _isChainable(ins, prop, ...args) {
	_assert.strictEqual(ins[prop](...args), ins);
}



describe('Notifier', () => {
	describe('#constructor', () => {
		it("should create an instance", () => {
			const ins = new Notifier({});

			_assert(ins instanceof Notifier);
		});

		it("should only take an object argument", () => {
			_runsWithArguments((...args) => {
				new Notifier(...args);
			}, ..._generateArguments(_args, [_args[8]], TypeError));
		});
	});

	describe('#addListener', () => {
		it("should require a function argument", () => {
			const ins = new Notifier({});

			_runsWithArguments((...args) => {
				ins.addListener(...args);
			}, ..._generateArguments(_args, [_args[4]], TypeError));
		});

		it("should be chainable", () => {
			_isChainable(new Notifier({}), 'addListener', () => 1);
		});
	});

	describe('#addNamedListener', () => {
		it("should require a nonempty string and a function argument", () => {
			const ins = new Notifier({});

			_runsWithArguments((...args) => {
				ins.addNamedListener(...args);
			}, ..._generateArguments(_args, [_args[1], _args[4]], TypeError));
		});

		it("should be chainable", () => {
			_isChainable(new Notifier({}), 'addNamedListener', 'a', () => 1);
		});
	});

	describe('#removeListener', () => {
		it("should require a function argument", () => {
			const ins = new Notifier({});

			_runsWithArguments((...args) => {
				ins.removeListener(...args);
			}, ..._generateArguments(_args, [_args[4]], TypeError));
		});

		it("should be chainable", () => {
			_isChainable(new Notifier({}), 'removeListener', () => 1);
		});
	});

	describe('#removeNamedListener', () => {
		it("should require a nonempty string and a function argument", () => {
			const ins = new Notifier({});

			_runsWithArguments((...args) => {
				ins.removeNamedListener(...args);
			}, ..._generateArguments(_args, [_args[1], _args[4]], TypeError));
		});

		it("should be chainable", () => {
			_isChainable(new Notifier({}), 'removeNamedListener', 'a', () => 1);
		});
	});

	describe('#removeAllListeners', () => {
		it("should be chainable", () => {
			_isChainable(new Notifier({}), 'removeAllListeners');
		});
	});

	describe('#removeAllNamedListeners', () => {
		it("should require a nonempty string", () => {
			const ins = new Notifier({});

			_runsWithArguments((...args) => {
				ins.removeAllNamedListeners(...args);
			}, ..._generateArguments(_args, [_args[1]], TypeError));
		});

		it("should be chainable", () => {
			_isChainable(new Notifier({}), 'removeAllNamedListeners', 'a');
		});
	});

	describe('#queue', () => {
		it("should require name and type", () => {
			const ins = new Notifier({});
			const args = _args.slice(0);

			const fn = (...args) => {
				ins.queue(...args);
			};

			args.unshift(_notify.TYPE_ADD);

			_runsWithArguments(fn, ..._generateArguments(args, [_args[1], args[0]], TypeError));
		});

		it("should be chainable", () => {
			_isChainable(new Notifier({}), 'queue', 'a', _notify.TYPE_ADD);
		});

		it("should asynchronously notify named listeners", done => {
			const origin = {}, property = 'a', type = _notify.TYPE_UPDATE;
			const ins = new Notifier(origin);

			const nowVal = 1, wasVal = 2;

			ins
				.addNamedListener(property, (now, was, meta) => {
					if (
						now === nowVal &&
						was === wasVal &&
						meta.origin === origin &&
						meta.property === property &&
						meta.type === type
					) done();
					else done(new Error());
				})
				.queue(property, type, nowVal, wasVal);
		});

		it("should asynchronously notify unnamed listeners", done => {
			const origin = {}, property = 'a', type = _notify.TYPE_UPDATE;
			const ins = new Notifier(origin);

			const nowVal = 1, wasVal = 2;

			ins
				.addListener((now, was, meta) => {
					if (
						now === nowVal &&
						was === wasVal &&
						meta.origin === origin &&
						meta.property === property &&
						meta.type === type
					) done();
					else done(new Error());
				})
				.queue(property, type, nowVal, wasVal);
		});

		it("should notify named listeners before unnamed listeners", done => {
			let wasCalled = false;

			new Notifier({})
				.addNamedListener('a', (now, was, meta) => {
					wasCalled = true;
				})
				.addListener((now, was, meta) => {
					if (wasCalled) done();
					else done(new Error());
				})
				.queue('a', _notify.TYPE_UPDATE, 1, 2);
		});

		it("should send notifications in submission order", done => {
			let state = 'none';

			new Notifier({})
				.addListener((now, was, meta) => {
					switch (meta.type) {
						case _notify.TYPE_ADD :
							if (state !== 'none') done(new Error());
							else state = 'add';

							break;

						case _notify.TYPE_UPDATE :
							if (state !== 'add') done(new Error());
							else state = 'update';

							break;

						case _notify.TYPE_REMOVE :
							if (state !== 'update') done(new Error());
							else done();
					}
				})
				.queue('a', _notify.TYPE_ADD, 1, undefined)
				.queue('a', _notify.TYPE_UPDATE, 1, 2)
				.queue('a', _notify.TYPE_REMOVE, undefined, 2);
		});

		it("should not send notifications to synchronously released listeners", done => {
			const fn = (now, was, meta) => done(new Error());

			new Notifier({})
				.addListener(fn)
				.addNamedListener('a', fn)
				.queue('a', _notify.TYPE_UPDATE, 2, 1)
				.removeListener(fn)
				.removeNamedListener('a', fn);

			new Notifier({})
				.addListener(fn)
				.addNamedListener('a', fn)
				.queue('a', _notify.TYPE_UPDATE, 2, 1)
				.removeAllListeners()
				.removeAllNamedListeners('a');

			setTimeout(() => {
				done();
			}, 10);
		});

		it("should send notifications to delayed listeners", done => {
			new Notifier({})
				.queue('a', _notify.TYPE_UPDATE, 2 , 1)
				.addListener((now, was, meta) => done());
		});
	});
});
