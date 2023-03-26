import { Provider } from "@betacall/ui-kit";
import React from "react";
import { Navigate } from "react-router-dom";
import { useOrders } from "./OrderProvider";

export function ProtectProvider (props: { provider: Provider, children: React.ReactNode }) {
	const orders = useOrders();

	const callOrder = React.useMemo(() => {
		return orders.list[0];
	}, [ orders ]);

	if (callOrder?.provider === props.provider)
		return props.children as JSX.Element;

	return <Navigate to="/" />
}