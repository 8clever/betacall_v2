import { CallApi } from "@betacall/ui-kit";
import React from "react";
import { Navigate } from "react-router-dom";

interface OrderContext {
	list: CallApi.MyOrder[],
	refresh: () => void;
}

const orderContext = React.createContext<OrderContext>({
	list: [],
	refresh: () => {/** empty */}
});

interface IProps {
	children?: React.ReactNode
}

export function OrderProvider (props: IProps) {

	const [ orders, setOrders ] = React.useState<CallApi.MyOrder[]>([]);

	const refresh = React.useCallback(() => {
		const api = new CallApi();
		api.getMyOrders().then(orders => {
			setOrders(orders)
		});
	}, []);

	React.useEffect(() => {
		refresh();
	}, [ refresh ]);

	const value = React.useMemo(() => {
		return {
			list: orders,
			refresh
		}
	}, [ orders, refresh ])

	return (
		<orderContext.Provider value={value}>
			{props.children}
		</orderContext.Provider>
	)
}

export function useOrders () {
	return React.useContext(orderContext);
}