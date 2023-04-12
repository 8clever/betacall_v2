import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from "antd";
import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import './style.css';
import { useOrders } from "./OrderProvider";
import { B2CPLManualApi } from '@betacall/ui-kit';
import React from "react";

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
		{ i: Cards.Info,   x: 0, y: 1, w: 12,  h: 3, static: true },
		{ i: Cards.Packages, x: 0, y: 4, w: 12,  h: 3, static: true },
		{ i: Cards.Form,  x: 0, y: 7, w: 12, h: 3, static: true }
	],
	"lg": [
		{ i: Cards.Actions,  x: 0, y: 0, w: 12, h: 1, static: true },
		{ i: Cards.Info,   x: 0, y: 1, w: 4,  h: 3, static: true },
		{ i: Cards.Packages, x: 4, y: 1, w: 4,  h: 3, static: true },
		{ i: Cards.Form,  x: 8, y: 1, w: 4, h: 3, static: true }
	]
};

const timeFromPath = ['additional_data', 'delivery_data', 'time_from'];
const timeToPath = ['additional_data', 'delivery_data', 'time_to']

export function B2CPLManual () {

	const orders = useOrders();
	const order = orders.list[0].order as B2CPLManualApi.Order;

	const [ deliveryDays, setDeliveryDays ] = React.useState<B2CPLManualApi.DeliveryDayNearest[]>([]);
	const [ denyReasons, setDenyReasons ] = React.useState<B2CPLManualApi.DenyReason[]>([]);
	const [ statusList, setStatusList ] = React.useState<B2CPLManualApi.CallStatus[]>([]);

	const { delivery_zip } = order;
	const code = order.packages[0].code;

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
		const api = new B2CPLManualApi();
		api.deliverySetState({
			callid: order.callid,
			time_start: timeStart,
			time_end: new Date().toJSON(),
			call_statuses: [
				{
					...values,
					codes: order.packages.map(p => p.code),
				}
			]
		}).then(() => {
			orders.refresh();
		});
	}, [ order, timeStart ]);

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

	return (
		<Form form={form} onFinish={submit}>
			<ResponsiveReactGridLayout autoSize layouts={layout}>
				<Card key={Cards.Actions}>
					<Row justify='space-between' align="middle">
						<Col>
							<Typography.Title level={2}>B2CPL Manual</Typography.Title>
						</Col>
						<Col>
							<Space>
								<Button htmlType="submit" type="primary">Submit</Button>
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
									{p.script_text}
								</Typography.Paragraph>
							</React.Fragment>
						)
					})}
				</Card>
				<Card key={Cards.Form}>
					<Typography.Title level={3}>Form</Typography.Title>
					<Form.Item name='state' label="Status" rules={[{ required: true }]}>
						<Select showSearch>
							{statusList.map(s => {
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
							const state = form.getFieldValue('state');
							if (state === "REJECT") {
								return (
									<>
										<Form.Item name={['additional_data', 'reject_data', 'reject_reason']} label="Cause">
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