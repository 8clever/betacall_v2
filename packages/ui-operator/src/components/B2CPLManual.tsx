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
		{ i: Cards.Form,  x: 0, y: 8, w: 12, h: 3, static: true }
	],
	"lg": [
		{ i: Cards.Actions,  x: 0, y: 0, w: 12, h: 1, static: true },
		{ i: Cards.Info,   x: 0, y: 1, w: 4,  h: 3, static: true },
		{ i: Cards.Packages, x: 4, y: 1, w: 4,  h: 3, static: true },
		{ i: Cards.Form,  x: 8, y: 1, w: 4, h: 3, static: true }
	]
};

export function B2CPLManual () {

	const orders = useOrders();
	const order = orders.list[0].order as B2CPLManualApi.Order;

	return (
		<Form>
			<ResponsiveReactGridLayout autoSize layouts={layout}>
				<Card key={Cards.Actions}>
					<Row justify='space-between' align="middle">
						<Col>
							<Typography.Title level={2}>B2CPL Manual</Typography.Title>
						</Col>
						<Col>
							<Space>
								<Button type="primary">Submit</Button>
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
					<Form.Item label="Status">
						<Select />
					</Form.Item>
					<Form.Item label="Delivery Date">
						<DatePicker />
					</Form.Item>
					<Form.Item label="Delivery Interval">
						<Select />
					</Form.Item>
					<Form.Item label="Comment">
						<Input />
					</Form.Item>
					<Form.Item label="Deny Cause">
						<Select />
					</Form.Item>
				</Card>
			</ResponsiveReactGridLayout>
		</Form>
	)
}