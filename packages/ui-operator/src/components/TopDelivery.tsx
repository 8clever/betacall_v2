import { TDApi, DatePicker } from "@betacall/ui-kit";
import { Alert, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, TableColumnType, Typography } from "antd";
import React from "react";
import { useOrders } from "./OrderProvider"
import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import './style.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

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

const historyColumns: TableColumnType<TDApi.HistoryEvent>[] = [
	{
		title: "Date",
		key: "date",
		dataIndex: "date",
		render: (_) => {
			return new Date(_).toLocaleDateString()
		}
	},
	{
		title: "Updated By",
		key: 'updated by',
		dataIndex: "user"
	},
	{
		title: "Title",
		key: "title",
		dataIndex: ["eventType", 'name'],
	},
	{
		title: "New value",
		key: "new value",
		dataIndex: "newValue"
	},
	{
		title: "Prev value",
		key: 'prev',
		dataIndex: "prevValue"
	},
	{
		title: "Region",
		key: "region",
		dataIndex: ["region", "name"]
	},
	{
		title: "City",
		key: "city",
		dataIndex: ["city", "name"]
	},
	{
		title: "Comment",
		key: "comment",
		dataIndex: ["comment"]
	}
]

enum Cards {
	Actions = 'Actions',
	Client = 'Client',
	Order = 'Order',
	Delivery = 'Deliver',
	History = 'History'
}

const layout: ReactGridLayout.Layouts = {
	"md": [
		{ i: Cards.Actions,  x: 0, y: 0, w: 12, h: 1, static: true },
		{ i: Cards.Client,   x: 0, y: 1, w: 12,  h: 4, static: true },
		{ i: Cards.Delivery, x: 0, y: 5, w: 12,  h: 4, static: true },
		{ i: Cards.Order,    x: 0, y: 9, w: 12,  h: 4, static: true },
		{ i: Cards.History,  x: 0, y: 13, w: 12, h: 4, static: true }
	],
	"lg": [
		{ i: Cards.Actions,  x: 0, y: 0, w: 12, h: 1, static: true },
		{ i: Cards.Client,   x: 0, y: 1, w: 4,  h: 4, static: true },
		{ i: Cards.Delivery, x: 4, y: 1, w: 4,  h: 4, static: true },
		{ i: Cards.Order,    x: 8, y: 1, w: 4,  h: 4, static: true },
		{ i: Cards.History,  x: 0, y: 5, w: 12, h: 4, static: true }
	]
};

export function TopDelivery () {

	const orders = useOrders();

	const order = orders.list[0].order as TDApi.Order;
	const id = order.orderIdentity.orderId;

	const [ form ] = Form.useForm();

	const [ quota, setQuota ] = React.useState<TDApi.Quota[]>([]);

	const [ pickupPoints, setPickupPoints ] = React.useState<TDApi.PickupPoint[]>([]);

	const [ desiredDateDelivery, setDesiredDateDelivery ] = React.useState<Date | null>( 
		order.desiredDateDelivery?.date ?
		new Date(order.desiredDateDelivery.date) :
		null
	);

	const [ desiredTimeIntervals, setDesiredTimeIntervals ] = React.useState<string | null>(
		desiredDateDelivery ? 
		null : 
		intervalsToString(order.desiredDateDelivery.timeInterval)
	);

	const [ pickupId, setPickupId ] = React.useState<string | null>(null);

	const [ history, setHistory ] = React.useState<TDApi.History[]>([]);

	const [ denyReasons, setDenyReasons ] = React.useState<Record<number, string>>({});

	React.useEffect(() => {
		const api = new TDApi();
		Promise.all([
			api.getNearDeliveryDatesIntervals({ id: id.toString() }),
			api.getHistory({ orderId: id.toString() }),
			api.getDenyReasons()
		]).then(([ intervals, history, reasons ]) => {
			setQuota(intervals);
			setHistory(history);
			setDenyReasons(reasons);
		});
	}, [ id ]);

	React.useEffect(() => {
		const api = new TDApi();
		api.getPickupPoints({ partnerId: order.partnerExecutor.id.toString() }).then(data => {
			setPickupPoints(data);
		});
	}, [ order.partnerExecutor.id ])

	const disabledDates = React.useCallback((date: Date) => {
		const current = date.toLocaleDateString();
		for (const q of quota) {
			const date = new Date(q.date).toLocaleDateString();
			if (date === current) return false;
		}
		return true;
	}, [ quota ]);

	const timeIntervals = React.useMemo(() => {
		if (!desiredDateDelivery) return null;

		const current = desiredDateDelivery.toLocaleDateString();
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
	}, [ desiredDateDelivery, form ])

	React.useEffect(() => {
		const value = desiredTimeIntervals ? intervalsParse(desiredTimeIntervals) : null;
		form.setFieldValue(['desiredDateDelivery', "timeInterval",], value);
	}, [ desiredTimeIntervals, form ]);

	const watchDeliveryType: TDApi.PickupType = Form.useWatch("deliveryType", form);

	const isWarningMarket = React.useMemo(() => {
		return warningMarkets.includes(order.orderUrl);
	}, [ order.orderUrl ]);

	const endOfStorageDate = React.useMemo(() => {
		if (!order.endOfStorageDate) return "";
		return new Date(order.endOfStorageDate).toLocaleDateString();
	}, [ order.endOfStorageDate ]);

	const doneOrder = React.useCallback(() => {
		const order: TDApi.Order = form.getFieldsValue();
		const api = new TDApi();
		if (order.deliveryType === TDApi.PickupType.PICKUP) {
			api.doneOrderPickup(order, Number(pickupId)).then(() => {
				orders.refresh()
			});
			return;
		}

		api.doneOrder({
			...order,
			desiredDateDelivery: {
				date: desiredDateDelivery?.toJSON() as string,
				timeInterval: intervalsParse(desiredTimeIntervals as string)
			}
		}).then(() => {
			orders.refresh()
		})
	}, [ form, orders, pickupId, desiredDateDelivery, desiredTimeIntervals ]);

	const denyOrder = React.useCallback(() => {
		const order: TDApi.Order = form.getFieldsValue();
		const api = new TDApi();
		api.denyOrder(order).then(() => {
			orders.refresh()
		});
	}, []);

	const [ denyModal, setDenyModal ] = React.useState(false);
	const toggleDenyModal = React.useCallback(() => {
		setDenyModal(state => !state);
	}, []);

	const watchDenyReasonId = Form.useWatch(['denyParams', 'reason', 'id'], form);

	const undercallOrder = React.useCallback(() => {
		const order: TDApi.Order = form.getFieldsValue();
		const api = new TDApi();
		api.underCall(order).then(() => {
			orders.refresh();
		})
	}, [ form, orders ]);

	const [ replaceCallDate, setReplaceDate ] = React.useState<Date | null>(null);

	const replaceDate = React.useCallback(() => {
		if (!replaceCallDate) return;
		const order: TDApi.Order = form.getFieldsValue();
		const api = new TDApi();
		api.replaceCall(order, replaceCallDate).then(() => {
			orders.refresh();
		});
	}, [ replaceCallDate, form, orders ]);

	const disabledReplaceDates = React.useCallback((date: Date) => {
		const now = new Date().valueOf();
		return date.valueOf() < now;
	}, []);

	const [ replaceDateModal, setReplaceDateModal ] = React.useState(false);
	const toggleReplaceDateModal = React.useCallback(() => {
		setReplaceDateModal(state => !state);
	}, []);

	return (
		<Form form={form} initialValues={order}>
			<ResponsiveReactGridLayout layouts={layout}>
				<Card key={Cards.Actions}>
					<Row justify='space-between' align="middle">
						<Col>
							<Typography.Title level={2}>Top Delivery</Typography.Title>
						</Col>
						<Col>
							<Space>
								<Button type="primary" onClick={doneOrder}>Done</Button>
								<Button danger onClick={toggleDenyModal}>Deny</Button>
								<Modal 
									title="Deny"
									okText="Confirm"
									okButtonProps={{ danger: true, disabled: !watchDenyReasonId }} 
									open={denyModal} 
									onOk={denyOrder} 
									onCancel={toggleDenyModal}>
									<Form.Item label="Cause" name={['denyParams', 'reason', 'id']}>
										<Select>
											<Select.Option value={0}>Empty</Select.Option>
											{Object.entries(denyReasons).map(([ id, reason ]) => {
												return <Select.Option key={Number(id)} value={Number(id)}>
													{reason}
												</Select.Option>
											})}
										</Select>
									</Form.Item>
								</Modal>
								<Button onClick={undercallOrder}>Undercall</Button>
								<Button onClick={toggleReplaceDateModal}>Replace call</Button>
								<Modal
									okButtonProps={{ disabled: !replaceCallDate }}
									open={replaceDateModal}
									onCancel={toggleReplaceDateModal}
									onOk={replaceDate}
									title={"Replace call"}>
									<Form.Item label="Date">
										<DatePicker
											disabledDate={disabledReplaceDates}
											value={replaceCallDate} 
											onChange={setReplaceDate} />
									</Form.Item>
								</Modal>
							</Space>
						</Col>
					</Row>
				</Card>
				<Card key={Cards.Client}>
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
				<Card key={Cards.Delivery}>
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
							{Object.values(TDApi.PickupType).map(p => {
								return <Select.Option key={p} value={p}>
									{p}
								</Select.Option>
							})}
						</Select>
					</Form.Item>
					{
						watchDeliveryType === TDApi.PickupType.PICKUP ?
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
				<Card key={Cards.Order}>
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
					<Form.Item label="End of storage date">
						<Input value={endOfStorageDate} readOnly />
					</Form.Item>
					<Form.Item label="Full order price">
						<Input value={order.clientFullCost + " р."} readOnly/>
					</Form.Item>
					<Button 
						target="_blank"
						type="link" href={`https://is.topdelivery.ru/pages/order.php?id=${order.orderIdentity.orderId}`}>
						Top Delivery
					</Button>
				</Card>
				<Card key={Cards.History}>
					<Typography.Title level={3}>History</Typography.Title>
					<Table
						scroll={{ x: true, y: 400 }}
						columns={historyColumns}
						dataSource={(history?.[0]?.events || []).concat().reverse()}
					/>
				</Card>
			</ResponsiveReactGridLayout>
		</Form>
	)
}