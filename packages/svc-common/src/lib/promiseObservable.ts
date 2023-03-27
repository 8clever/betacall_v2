import { Observable } from "rxjs";

export function promiseObservable<T> (obs: Observable<T>, time = 5000, message = `Observable exceed limit: ${time}ms`): Promise<T> {
	return new Promise((res, rej) => {
		const timeout = setTimeout(() => {
			rej(new Error(message))
		}, time);

		obs.subscribe(value => {
			clearTimeout(timeout)
			res(value);
		})
	})
}