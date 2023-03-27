import { TDApi } from "@betacall/ui-kit";
import { Alert, Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from "antd";
import React from "react";
import styled from "styled-components";
import { useOrders } from "./OrderProvider"

const padding = 5;

const intDelimeter = " - ";

const intervalsToString = (int: TDApi.TimeInterval) => {
	return `${int.bTime}${intDelimeter}${int.eTime}`;
}

const intervalsParse = (int: string) => {
	const [ bTime, eTime ] = int.split(intDelimeter);
	return {
		bTime,
		eTime
	}
}

const warningMarkets = [
	"homshoppingrasha",
	"hsr24.ru"
]

export function TopDelivery () {

	const orders = useOrders();

	const order = orders.list[0].order as TDApi.Order;
	const id = order.orderIdentity.orderId;

	const [ form ] = Form.useForm();

	const [ quota, setQuota ] = React.useState<TDApi.Quota[]>([]);

	const [ pickupPoints, setPickupPoints ] = React.useState<TDApi.PickupPoint[]>([]);

	const [ desiredDateDelivery, setDesiredDateDelivery ] = React.useState<any>(order.desiredDateDelivery.date);

	const [ desiredTimeIntervals, setDesiredTimeIntervals ] = React.useState<string | null>(desiredDateDelivery ? null : intervalsToString(order.desiredDateDelivery.timeInterval));

	const [ pickupId, setPickupId ] = React.useState<string | null>(null);

	React.useEffect(() => {
		const api = new TDApi();
		api.getNearDeliveryDatesIntervals({ id: id.toString() }).then(data => {
			setQuota(data);
		});
	}, [ id ]);

	React.useEffect(() => {
		const api = new TDApi();
		api.getPickupPoints({ partnerId: order.partnerExecutor.id.toString() }).then(data => {
			setPickupPoints(data);
		});
	}, [ order.partnerExecutor.id ])

	const disabledDates = React.useCallback((date: any) => {
		const current = new Date(date.valueOf()).toLocaleDateString();
		for (const q of quota) {
			const date = new Date(q.date).toLocaleDateString();
			if (date === current) return false;
		}
		return true;
	}, [ quota ]);

	const timeIntervals = React.useMemo(() => {
		if (!desiredDateDelivery) return null;

		const current = new Date(desiredDateDelivery.valueOf()).toLocaleDateString();
		for (const q of quota) {
			const data = new Date(q.date).toLocaleDateString();
			if (current === data)
				return q
		}
		return null;
	}, [ desiredDateDelivery, quota ])

	React.useEffect(() => {
		const value = desiredDateDelivery ? new Date(desiredDateDelivery.valueOf()).toJSON() : null;
		form.setFieldValue(["desiredDateDelivery", "date"], value);
	}, [ desiredDateDelivery ])

	React.useEffect(() => {
		const value = desiredTimeIntervals ? intervalsParse(desiredTimeIntervals) : null;
		form.setFieldValue(['desiredDateDelivery', "timeInterval",], value);
	}, [ desiredTimeIntervals ]);

	const watchDeliveryType = Form.useWatch("deliveryType", form);

	const isWarningMarket = React.useMemo(() => {
		return warningMarkets.includes(order.orderUrl);
	}, [ order.orderUrl ]);

	const endOfStorageDate = React.useMemo(() => {
		if (!order.endOfStorageDate) return "";
		return new Date(order.endOfStorageDate).toLocaleDateString();
	}, [ order.endOfStorageDate ])

	return (
		<Container>
			<Form form={form} initialValues={order}>
				<Card style={{ marginBottom: padding }}>
					<Row justify='space-between' align="middle">
						<Col>
							<Typography.Title level={2}>Top Delivery</Typography.Title>
						</Col>
						<Col>
							<Space>
								<Button type="primary">Done</Button>
								<Button danger>Deny</Button>
								<Button>Undercall</Button>
								<Button>Replace call</Button>
							</Space>
						</Col>
					</Row>
				</Card>
				<Row gutter={padding}>
					<Col>
						<Card style={{ marginBottom: padding }}>
							<Typography.Title level={3}>Client</Typography.Title>
							<Form.Item label="Name" name={["clientInfo", "fio"]}>
								<Input />
							</Form.Item>
							<Form.Item label="Phone" name={["clientInfo", "phone"]}>
								<Input />
							</Form.Item>
							<Form.Item label="E-Mail" name={["clientInfo", "email"]}>
								<Input />
							</Form.Item>
							<Form.Item label="Comment" name={["clientInfo", "comment"]}>
								<Input.TextArea />
							</Form.Item>
						</Card>
					</Col>
					<Col>
						<Card style={{ marginBottom: padding }}>
							<Typography.Title level={3}>Delivery</Typography.Title>
							<Form.Item label="Date">
								<DatePicker 
									value={desiredDateDelivery}
									onChange={setDesiredDateDelivery}
									disabledDate={disabledDates}
								/>
							</Form.Item>
							{
								desiredDateDelivery ?
								<Form.Item label="Time Intervals">
									<Select
										onChange={setDesiredTimeIntervals}
										value={desiredTimeIntervals}
										disabled={!timeIntervals?.quotas?.available}>
										{timeIntervals?.timeInterval.map((i, idx) => {
											const value = intervalsToString(i);
											return <Select.Option key={idx} value={value}>
												{value}
											</Select.Option>
										})}
									</Select>
								</Form.Item> :
								null
							}
							<Form.Item label="Region" name={["deliveryAddress", "region"]}>
								<Input readOnly />
							</Form.Item>
							<Form.Item label="City" name={["deliveryAddress", "city"]}>
								<Input readOnly />
							</Form.Item>
							<Form.Item label="Zip" name={["deliveryAddress", "inCityAddress", "zipcode"]}>
								<Input />
							</Form.Item>
							<Form.Item label="Address" name={["deliveryAddress", "inCityAddress", "address"]}>
								<Input.TextArea />
							</Form.Item>
							<Form.Item label="Type" name={["deliveryType"]}>
								<Select>
									<Select.Option value="PICKUP">PICKUP</Select.Option>
									<Select.Option value="COURIER">COURIER</Select.Option>
								</Select>
							</Form.Item>
							{
								watchDeliveryType === "PICKUP" ?
								<Form.Item label="Pickup Point">
									<Select value={pickupId} onChange={setPickupId}>
										{pickupPoints.map(p => {
											return (
												<Select.Option key={p.locationId} value={p.locationId}>
													{p.cityOfLocation} {p.addressOfLocation}
												</Select.Option>
											)
										})}
									</Select>
								</Form.Item> : null
							}
						</Card>
					</Col>
					<Col style={{ marginBottom: padding }}>
						<Card>
							<Typography.Title level={3}>Order</Typography.Title>
							<Form.Item label="Order ID" name={["orderIdentity", "orderId"]}>
								<Input readOnly />
							</Form.Item>
							<Form.Item label="Bar Code" name={["orderIdentity", "barcode"]}>
								<Input readOnly />
							</Form.Item>
							<Form.Item label="In Market" name={["orderIdentity", "webshopNumber"]}>
								<Input readOnly />
							</Form.Item>
							<Form.Item label="Status" name={["status", "name"]}>
								<Input readOnly />
							</Form.Item>
							<Form.Item label="Work status" name={["workStatus", "name"]}>
								<Input readOnly />
							</Form.Item>
							<Form.Item label="Market name" name={["orderUrl"]}>
								<Input readOnly />
							</Form.Item>
							{
								isWarningMarket ?
								<Alert message="You should use other script for this market." type="warning" /> :
								null
							}
							<Button 
								target="_blank"
								type="link" href={`https://is.topdelivery.ru/pages/order.php?id=${order.orderIdentity.orderId}`}>
								Top Delivery
							</Button>
							<Form.Item label="End of storage date">
								<Input value={endOfStorageDate} readOnly />
							</Form.Item>
							<Form.Item label="Full order price">
								<Input value={order.clientFullCost + " р."} readOnly/>
							</Form.Item>
						</Card>
					</Col>
				</Row>
			</Form>
		</Container>
	)
}

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	padding: ${padding}px;
	overflow: auto;
`