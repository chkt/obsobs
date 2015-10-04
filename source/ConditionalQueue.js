import Queue from 'qee';



export default class FactoryQueue extends Queue {
	process(source, prop, val) {
		for (let fn of this) {
			const res = fn.call(source, prop, val);

			if (res !== undefined) return res;
		}

		return val;
	}
}
