import { useAuth, UserApi, Provider, CallApi } from "@betacall/ui-kit"
import { Button, Form, Input, Select, Space, Typography } from "antd"
import React from "react";
import styled from "styled-components"
import { useSocket } from "./SocketProvider";
import { LinkOutlined, DisconnectOutlined, LogoutOutlined } from "@ant-design/icons"
import { useOrders } from "./OrderProvider";
import { Navigate } from "react-router-dom";

export function Main () {
	const auth = useAuth();

	const orders = useOrders();

	const { providers, toggleProvider } = useSocket();

	const connect: React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement> = React.useCallback((e) => {
		const provider = e.currentTarget.getAttribute('data-provider');
		toggleProvider(provider as Provider);
	}, [ toggleProvider ])

	const [ form ] = Form.useForm();

	const assignOrder = React.useCallback(async (values: { provider: Provider, id: string }) => {
		const api = new CallApi();
		await api.assignOrder(values);
		orders.refresh()
	}, [ orders ])

	if (orders.list.length)
		return <Navigate to={`/provider/${orders.list[0].provider}`}/>

	return (
		<Container>
			<Space direction="vertical" size="large" style={{ textAlign: "center" }}>
				<Typography.Title level={3}>
					Hello {auth.user?.login}
				</Typography.Title>
				<Typography.Text>
					Firstly you need connect to provider and wait until you receive order
				</Typography.Text>
				<Space>
					{Object.values(Provider).map(p => {
						const isConnected = providers.has(p);
						return (
							<Button 
								key={p}
								type={isConnected ? 'primary' : "ghost" }
								icon={isConnected ? <LinkOutlined /> : <DisconnectOutlined />}
								onClick={connect}
								data-provider={p} 
								danger={!isConnected}>
								{p}
							</Button>
						)
					})}
				</Space>
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
				<Button 
					icon={<LogoutOutlined />}
					size="large"
					onClick={UserApi.Logout} 
					type="link">
					Logout
				</Button>
			</Space>
		</Container>
	)
}

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
`