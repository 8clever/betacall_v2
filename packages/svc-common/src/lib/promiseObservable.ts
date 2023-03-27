import { Observable } from "rxjs";

export function promiseObservable<T> (obs: Observable<T>, time = 5000): Promise<T> {
	return new Promise((res, rej) => {
		const timeout = setTimeout(() => {
			rej(new Error(`Observable exceed limit: ${time}ms`))
		}, time);

		obs.subscribe(value => {
			clearTimeout(timeout)
			res(value);
		})
	})
}