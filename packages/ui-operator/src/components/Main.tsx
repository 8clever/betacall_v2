import { useAuth, UserApi, Provider, CallApi } from "@betacall/ui-kit"
import { Button, Space, Typography, notification } from "antd"
import React from "react";
import styled from "styled-components"
import { useSocket } from "./SocketProvider";
import { LinkOutlined, DisconnectOutlined, LogoutOutlined, StepForwardOutlined } from "@ant-design/icons"
import { useOrders } from "./OrderProvider";
import { Navigate } from "react-router-dom";

export function Main () {
	const auth = useAuth();

	const orders = useOrders();

	const { providers, toggleProvider } = useSocket();

	const connect: React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement> = React.useCallback((e) => {
		const provider = e.currentTarget?.closest('[data-provider]')?.getAttribute('data-provider');
		if (!provider) return;
		toggleProvider(provider as Provider);
	}, [ toggleProvider ])

	const assignNextOrder = React.useCallback(async (e: React.MouseEvent) => {
		const provider = e.currentTarget?.closest('[data-provider]')?.getAttribute('data-provider') as Provider;
		if (!provider) return;
		const api = new CallApi();
		const data = await api.assignNextOrder({ provider });
		if (data.result)
			return orders.refresh();

		notification.warning({
			message: `${provider}: Queue is empty`,
		})
	}, [ orders ]);

	if (orders.list.length)
		return <Navigate to={`/provider/${orders.list[0].provider}`}/>

	return (
		<Container>
			<Space direction="vertical" size="large" style={{ textAlign: "center" }}>
				<Typography.Title level={3}>
					Hello {auth.user?.login}
				</Typography.Title>
				<Typography.Text>
					Subscribe to provider channel or start calling manually
				</Typography.Text>
				<Space size="large">
					{Object.values(Provider).map(p => {
						const isConnected = providers.has(p);
						return (
							<Space data-provider={p} key={p}>
								<Typography.Text>
									{p}
								</Typography.Text>
								{
									p.includes("manual") ? null :
									<Button 
										type={isConnected ? 'primary' : "ghost" }
										icon={isConnected ? <LinkOutlined /> : <DisconnectOutlined />}
										onClick={connect}
										danger={!isConnected} /> 
								}
								<Button 
									onClick={assignNextOrder}
									icon={<StepForwardOutlined />} 
									shape="circle" 
								/>
							</Space>
						)
					})}
				</Space>
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