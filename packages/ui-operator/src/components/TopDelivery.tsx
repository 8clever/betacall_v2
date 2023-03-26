import { TDApi } from "@betacall/ui-kit";
import React from "react";
import { useOrders } from "./OrderProvider"

export function TopDelivery () {

	const orders = useOrders();

	const [ order, setOrder ] = React.useState(orders.list[0].order as TDApi.Order)

	return (
		"Development" as unknown as JSX.Element
	)
}