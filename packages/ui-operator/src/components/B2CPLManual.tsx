import { Button, Card, Checkbox, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Typography } from "antd";
import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import './style.css';
import { useOrders } from "./OrderProvider";
import { B2CPLManualApi } from '@betacall/ui-kit';
import React from "react";
import { EyeOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

enum Cards {
	Actions = 'Actions',
	Info = 'Info',
	Packages = 'Packages',
	Form = 'Form'
}

const layout: ReactGridLayout.Layouts = {
	"md": [
		{ i: Cards.Actions,  x: 0, y: 0, w: 12, h: 1, static: true },
		{ i: Cards.Info,   x: 0, y: 1, w: 12,  h: 4, static: true },
		{ i: Cards.Packages, x: 0, y: 5, w: 12,  h: 4, static: true },
		{ i: Cards.Form,  x: 0, y: 9, w: 12, h: 4, static: true }
	],
	"lg": [
		{ i: Cards.Actions,  x: 0, y: 0, w: 12, h: 1, static: true },
		{ i: Cards.Info,   x: 0, y: 1, w: 4,  h: 4, static: true },
		{ i: Cards.Packages, x: 4, y: 1, w: 4,  h: 4, static: true },
		{ i: Cards.Form,  x: 8, y: 1, w: 4, h: 4, static: true }
	]
};

const timeFromPath = ['additional_data', 'delivery_data', 'time_from'];
const timeToPath = ['additional_data', 'delivery_data', 'time_to'];
const liftTypes =  ["грузовой", "пассажирский", "нет"];

const pacakgeTableColumns: ColumnsType<B2CPLManualApi.PackageItem> = [
	{
		title: "Name",
		dataIndex: "part_name"
	},
	{
		title: "Quantity",
		dataIndex: "quantity"
	},
	{
		title: "Amount",
		dataIndex: "amount"
	}
]

export function B2CPLManual () {

	const orders = useOrders();
	const order = React.useMemo(() => {
		return orders.list[0].order as B2CPLManualApi.Order;
	}, [ orders ]);

	const [ deliveryDays, setDeliveryDays ] = React.useState<B2CPLManualApi.DeliveryDayNearest[]>([]);
	const [ denyReasons, setDenyReasons ] = React.useState<B2CPLManualApi.DenyReason[]>([]);
	const [ statusList, setStatusList ] = React.useState<B2CPLManualApi.CallStatus[]>([]);
	const [ pvzInfo, setPvzInfo ] = React.useState<B2CPLManualApi.PvzInfo[]>([]);
	const [ loading, setLoading ] = React.useState(false);

	const { delivery_zip } = order;
	const code = order.packages[0]?.code;

	React.useEffect(() => {
		const api = new B2CPLManualApi();
		Promise.all([
			api.getCallStatusList(),
			api.getDenyReasonList(),
		]).then(([ statuses, denyreasons]) => {
			for (const statusType of statuses) {
				if (statusType.call_type_id === 0) {
					setStatusList(statusType.call_status);
					break;
				}
			}
			setDenyReasons(denyreasons);
		})
	}, []);

	React.useEffect(() => {
		const api = new B2CPLManualApi();
		api.deliveryDayNearest({ code, delivery_zip }).then(data => {
			setDeliveryDays(data);
		});
	}, [ delivery_zip, code ])

	const [ form ] = Form.useForm();

	const timeStart = React.useMemo(() => {
		return new Date().toJSON();
	}, [])

	const submit = React.useCallback((values: {
		state: string,
		additional_data: object
	}) => {
		setLoading(true);
		const api = new B2CPLManualApi();
		api.deliverySetState({
			callid: order.callid,
			date_start: timeStart,
			date_end: new Date().toJSON(),
			call_statuses: [
				{
					...values,
					codes: order.packages.map(p => p.code),
				}
			]
		}).then(() => {
			orders.refresh();
		}).catch(() => {
			setLoading(false);
		});
	}, [ order, orders, timeStart ]);

	const watchDenyReason = Form.useWatch(['additional_data', 'reject_data', 'reject_reason'], form);
	const requiredComment = React.useMemo(() => {
		const reason = denyReasons.find(d => watchDenyReason === d.reject_reason);
		return reason?.required_comment ?? false;
	}, [ watchDenyReason, denyReasons ]);

	const watchDeliveryDate = Form.useWatch(['additional_data', 'delivery_data', 'delivery_date'], form);
	const deliveryIntervals = React.useMemo(() => {
		const d = deliveryDays.find(d => d.delivery_date === watchDeliveryDate);
		return d?.delivery_time ?? [];
	}, [ watchDeliveryDate, deliveryDays ])

	const setDeliveryIntervals = React.useCallback((str: string) => {
		const i: B2CPLManualApi.DeliveryDayNearestTime = JSON.parse(str);
		form.setFieldValue(timeFromPath, i.time_from);
		form.setFieldValue(timeToPath, i.time_to);
	}, [ form ]);

	const oversized = React.useMemo(() => {
		for (const p of order.packages) {
			if (p.flag_oversized)
				return true;
		}
		return false;
	}, [ order ]);

	const watchDeliveryState: B2CPLManualApi.DeliveryStatus = Form.useWatch("state", form);
	React.useEffect(() => {
		if (watchDeliveryState === "PVZ") {
			const api = new B2CPLManualApi();
			api.getPvzInfo({ code }).then(data => {
				setPvzInfo(data);
			})
		}
	}, [ watchDeliveryState, code ]);

	const allowPaymentLink = React.useMemo(() => {
		for (const p of order.packages) {
			if (p.flag_paymentlink) 
				return true;
		}
		return false;
	}, [ order ]);

	const showItems = React.useCallback((e: React.MouseEvent) => {
		const code = e.currentTarget.getAttribute('data-code');
		if (!code) return;
		const api = new B2CPLManualApi();
		const renderTable = (data: B2CPLManualApi.PackageItem[], loading: boolean) => {
			return (
				<Table
					loading={loading}
					size="small"
					columns={pacakgeTableColumns} 
					dataSource={data} 
				/>
			)
		}
		const modal = Modal.info({
			width: 600,
			mask: true,
			title: "Box: " + code,
			content: renderTable([], true)
		})
		api.getPackageItems({ code }).then(data => {
			modal.update({
				content: renderTable(data, false)
			});
		});
	}, [])

	return (
		<Form form={form} onFinish={submit} initialValues={{
			additional_data: {
				delivery_data: {
					delivery_person: order.delivery_fio,
					delivery_zip: order.delivery_zip,
					delivery_city: order.delivery_city,
					delivery_street: order.delivery_street,
					flag_lifting: false
				},
				phone: order.phone
			}
		}}>
			<ResponsiveReactGridLayout autoSize layouts={layout}>
				<Card key={Cards.Actions}>
					<Row justify='space-between' align="middle">
						<Col>
							<Typography.Title level={2}>B2CPL Manual</Typography.Title>
						</Col>
						<Col>
							<Space>
								<Button htmlType="submit" type="primary" loading={loading}>Submit</Button>
							</Space>
						</Col>
					</Row>
				</Card>
				<Card key={Cards.Info}>
					<Typography.Title level={3}>Info</Typography.Title>
					<Typography.Paragraph>
						ID Call: {order.callid}
					</Typography.Paragraph>
					<Typography.Paragraph>
						Full Name: {order.delivery_fio}
					</Typography.Paragraph>
					<Typography.Paragraph>
						City: {order.delivery_city}
					</Typography.Paragraph>
					<Typography.Paragraph>
						Address: {order.delivery_street}
					</Typography.Paragraph>
					<Typography.Paragraph>
						Phone: {order.phone} {order.phone_ext}
					</Typography.Paragraph>
					<Typography.Paragraph>
						Market: {order.client_companyid}
					</Typography.Paragraph>
					<Typography.Paragraph>
						Comment: {order.quick_comment}
					</Typography.Paragraph>
				</Card>
				<Card key={Cards.Packages} style={{ overflow: "auto" }}>
					{order.packages.map(p => {
						return (
							<React.Fragment key={p.code}>
								<Typography.Title level={4}>Box №{p.box_cnt}</Typography.Title>
								<Typography.Paragraph>
									Code: {p.code}
								</Typography.Paragraph>
								<Typography.Paragraph>
									Type: {p.delivery_type}
								</Typography.Paragraph>
								<Typography.Paragraph>
									To Pay: {p.price_topay}
								</Typography.Paragraph>
								<Typography.Paragraph>
									Script: {p.script_text}
								</Typography.Paragraph>
								<Button 
									data-code={p.code}
									onClick={showItems} 
									icon={<EyeOutlined />}>
									Items
								</Button>
							</React.Fragment>
						)
					})}
				</Card>
				<Card key={Cards.Form} style={{ overflow: "auto" }}>
					<Typography.Title level={3}>Form</Typography.Title>
					<Form.Item name='state' label="Status" rules={[{ required: true }]}>
						<Select showSearch>
							{statusList.map(s => {
								const state = s.state as B2CPLManualApi.DeliveryStatus;
								if (state === "PAYMENTLINK" && !allowPaymentLink)
									return null;
									
								return (
									<Select.Option key={s.status_name} value={s.state}>
										{s.status_name} ({s.state})
									</Select.Option>
								)
							})}
						</Select>
					</Form.Item>
					<Form.Item shouldUpdate noStyle>
						{() => {
							const state: B2CPLManualApi.DeliveryStatus = form.getFieldValue('state');
							if (state === "PAYMENTLINK") {
								return (
									<Form.Item name={['additional_data', 'phone']} label="Phone" rules={[{ required: true }]}>
										<Input />
									</Form.Item>
								)
							}
							if (state === "CALLBACK") {
								return (
									<>
										<Form.Item name={['additional_data', 'callback_data', 'callback_date']} label="Date" rules={[{ required: true }]}>
											<DatePicker />
										</Form.Item>
										<Form.Item name={['additional_data', 'callback_data', 'callback_reason']} label="Reason" rules={[{ required: true }]}>
											<Input.TextArea />
										</Form.Item>
									</>
								)
							}
							if (state === "PVZ") {
								return (
									<Form.Item name={['additional_data', 'pvz_id']} label="PVZ" rules={[{ required: true }]}>
										<Select>
											{pvzInfo.map(p => {
												return (
													<Select.Option value={p.pvz_id}>
														{p.pvz_city} {p.pvz_address}
													</Select.Option>
												)
											})}
										</Select>
									</Form.Item>
								)
							}
							
							if (state === "REJECT") {
								return (
									<>
										<Form.Item name={['additional_data', 'reject_data', 'reject_reason']} label="Cause" rules={[{ required: true }]}>
											<Select>
												{denyReasons.map(d => {
													return (
														<Select.Option key={d.reject_reason} value={d.reject_reason}>
															{d.reject_description} ({d.reject_reason})
														</Select.Option>
													)
												})}
											</Select>
										</Form.Item>
										<Form.Item 
											label="Comment" 
											name={['additional_data', 'reject_data', 'reject_comment']}
											rules={[{ required: requiredComment }]}>
											<Input.TextArea />
										</Form.Item>
									</>
								)
							}
							if (state === "DELIVERY") {
								const errors = [
									...form.getFieldError(timeFromPath),
									...form.getFieldError(timeToPath)
								]
								return (
									<>
										<Form.Item 
											name={['additional_data', 'delivery_data', 'delivery_date']}
											label="Delivery Date" 
											rules={[{ required: true }]}>
											<Select>
												{deliveryDays.map(d => {
													return (
														<Select.Option value={d.delivery_date} key={d.delivery_date}>
															{new Date(d.delivery_date).toLocaleDateString()}
														</Select.Option>
													)
												})}
											</Select>
										</Form.Item>
										<Form.Item hidden name={timeFromPath} rules={[{ required: true }]} />
										<Form.Item hidden name={timeToPath} rules={[{ required: true }]} />
										<Form.Item
											validateStatus={errors.length ? 'error' : "success" }
											help={errors} 
											label="Delivery Interval" 
											required>
											<Select
												disabled={!watchDeliveryDate}
												value={
													form.getFieldValue(timeFromPath) && 
													form.getFieldValue(timeToPath) ?
													JSON.stringify({ 
														time_from: form.getFieldValue(timeFromPath),
														time_to: form.getFieldValue(timeToPath)
													}) : null
												}
												onChange={setDeliveryIntervals}>
												{deliveryIntervals.map(i => {
													const key = `${i.time_from} - ${i.time_to}`;
													return (
														<Select.Option 
															key={key} 
															value={JSON.stringify(i)}>
															{key}
														</Select.Option>
													)
												})}
											</Select>
										</Form.Item>
										<Form.Item name={['additional_data', 'delivery_data', "delivery_person"]} label="Delivery Person" rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name={['additional_data', 'delivery_data', "delivery_city"]} label="Delivery City" rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name={['additional_data', 'delivery_data', "delivery_street"]} label="Delivery Street" rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name={['additional_data', 'delivery_data', "delivery_zip"]} label="Delivery Zip" rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										{
											oversized ?
											<>
												<Form.Item name={['additional_data', 'delivery_data', "floor"]} label="Floor" rules={[{ required: true, type: "number" }]}>
													<InputNumber/>
												</Form.Item>
												<Form.Item name={['additional_data', 'delivery_data', "lift_type"]} label="Lift Type" rules={[{ required: true }]}>
													<Select>
														{liftTypes.map(l => {
															return (
																<Select.Option value={l} key={l}>
																	{l}
																</Select.Option>
															)
														})}
													</Select>
												</Form.Item>
												<Form.Item 
													valuePropName="checked"
													name={['additional_data', 'delivery_data', "flag_lifting"]} 
													label="Lifting" 
													rules={[{ required: true, type: "boolean" }]}>
													<Checkbox />
												</Form.Item>
											</> :
											null
										}
									</>
								)
							}
							return null;
						}}
					</Form.Item>
				</Card>
			</ResponsiveReactGridLayout>
		</Form>
	)
}