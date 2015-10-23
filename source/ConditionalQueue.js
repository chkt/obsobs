import Queue from 'qee';



export default class FactoryQueue extends Queue {
	process(source, prop, val, target) {
		if (
			typeof source !== 'object' || source === null ||
			typeof prop !== 'string' || prop === ''
		) throw new TypeError();

		for (let fn of this) {
			const res = fn.call(source, prop, val, target);

			if (res !== undefined) return res;
		}

		return null;
	}
}
