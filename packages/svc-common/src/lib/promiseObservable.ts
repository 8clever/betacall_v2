import { Observable } from "rxjs";

export function promiseObservable<T> (obs: Observable<T>): Promise<T> {
	return new Promise((res, rej) => {
		const timeout = setTimeout(() => {
			rej(new Error("Observable exceed limit: 5000ms"))
		}, 5000);

		obs.subscribe(value => {
			clearTimeout(timeout)
			res(value);
		})
	})
}