import { CallApi } from "@betacall/ui-kit";
import React from "react";
import { useNavigate } from "react-router-dom";

interface OrderContext {
	orders: CallApi.MyOrder[],
	refresh: () => void;
}

const orderContext = React.createContext<OrderContext>({
	orders: [],
	refresh: () => {/** empty */}
});

interface IProps {
	children?: React.ReactNode
}

export function OrderProvider (props: IProps) {

	const [ orders, setOrders ] = React.useState<CallApi.MyOrder[]>([]);

	const navigate = useNavigate();

	const refresh = React.useCallback(() => {
		const api = new CallApi();
		api.getMyOrders().then(orders => {
			setOrders(orders)
			
			if (orders.length) {
				navigate(`/provider/${orders[0].provider}`)
				return;
			}

			navigate("/");
		});
	}, [ navigate ]);

	React.useEffect(() => {
		refresh();
	}, [ refresh ]);

	const value = React.useMemo(() => {
		return {
			orders,
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