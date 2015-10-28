# obsobs

Nested observables

## Install

```sh
$ npm install obsobs
```

## Use

```js
import KeyedObservable from 'obsobs/KeyedObservable';


let sourceObject = {
	a : 1,
	b : {
		a : 1,
		b : 2
	}
}

let observable = new KeyedObservable(sourceObject);

observable[KeyedObservable.OBSERVE]('a', (now, was, meta) => {
	if (meta.type === meta.UPDATE) doSomething();
});

observable.a = 2;
```

## Extend

```js
import Observable, * as observable from 'obsobs/BaseObservable';


const myType = Symbol();


export default class MyObservable extends Observable {
	constructor() {
		super();

		//additional initialization code
	}

	//public api
}


observable
	.getFactoryQueue(myType)
	.append(myChildInstanceFactory);

observable
	.getConfiguration(MyObservable)
	.set({
		factoryType : myType,
		scalar : Object
		scalarIterator : myIterationGenerator,
		propertyResolver : myResolver,
	});
```