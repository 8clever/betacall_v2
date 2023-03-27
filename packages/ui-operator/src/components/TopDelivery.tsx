import { TDApi } from "@betacall/ui-kit";
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from "antd";
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

export function TopDelivery () {

	const orders = useOrders();

	const order = orders.list[0].order as TDApi.Order;
	const id = order.orderIdentity.orderId;

	const [ form ] = Form.useForm();

	const [ quota, setQuota ] = React.useState<TDApi.Quota[]>([]);

	const [ desiredDateDelivery, setDesiredDateDelivery ] = React.useState<any>(order.desiredDateDelivery.date);

	const [ desiredTimeIntervals, setDesiredTimeIntervals ] = React.useState<string | null>(desiredDateDelivery ? null : intervalsToString(order.desiredDateDelivery.timeInterval));

	React.useEffect(() => {
		const api = new TDApi();
		api.getNearDeliveryDatesIntervals({ id: id.toString() }).then(data => {
			setQuota(data);
		});
	}, [ id ]);

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
						<Card>
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
						<Card>
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
						</Card>
					</Col>
					<Col></Col>
				</Row>
			</Form>
		</Container>
	)
}

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	padding: ${padding}px;
`