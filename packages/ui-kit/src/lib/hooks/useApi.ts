import React from "react";

type AsyncFunction<P, R extends object = object> = (params: P) => Promise<R>;

type Constructor<T extends object> = new () => T;

export function useApi<T extends object, C extends Constructor<T>> (cl: C) {
	return React.useMemo(() => new cl(), []) as InstanceType<C>;
}

export function useControlledRequest<Params, Res extends object = object,>
(fn: AsyncFunction<Params, Res>, filter: Params, disabled = false) {
	const [ state, setState ] = React.useState<Res>();

	const [ loading, setLoading ] = React.useState(false);

	const loadData = React.useCallback(async () => {
		setLoading(true)
		try {
			const data = await fn(filter);
			setState(data);
		} finally {
			setLoading(false);
		}
	}, [ filter ])

	React.useEffect(() => {
		if (disabled) return;
		loadData()
	}, [ loadData, disabled ]);

	return {
		loading,
		state,
		setState,
		loadData
	}
}

export function useRequest<Params, Res extends object = object> 
(fn: AsyncFunction<Params, Res>, initialFilter = {} as Params, disabled = false) {
	
	const [ filter, setFilter ] = React.useState(initialFilter);
	
	const data = useControlledRequest(fn, filter, disabled);

	return {
		...data,
		filter,
		setFilter
	}
}
