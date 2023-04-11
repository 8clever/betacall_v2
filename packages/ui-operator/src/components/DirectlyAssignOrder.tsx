import { CallApi, Provider } from "@betacall/ui-kit"
import { Button, Form, Input, Select, Typography } from "antd"
import React from "react";
import { useOrders } from "./OrderProvider";

export function DirectlyAssignOrder () {

	const [ form ] = Form.useForm();

	const orders = useOrders();

	const assignOrder = React.useCallback(async (values: { provider: Provider, id: string }) => {
		const api = new CallApi();
		await api.assignOrder(values);
		orders.refresh()
	}, [ orders ]);

	return (
		<>
			<Typography.Text>
				You can directly assign order if need
			</Typography.Text>
			<Form form={form} onFinish={assignOrder} layout='inline'>
				<Form.Item 
					name="provider"
					label="Provider"
					rules={[{ required: true }]}>
					<Select style={{ minWidth: 150 }}>
						{Object.values(Provider).map(p => {
							return (
								<Select.Option key={p} value={p}>
									{p}
								</Select.Option>
							)
						})}
					</Select>
				</Form.Item>
				<Form.Item 
					name="id"
					label='Order ID'
					rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">Send</Button>
				</Form.Item>
			</Form>
		</>
	)
}