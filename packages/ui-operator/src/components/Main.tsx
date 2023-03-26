import { useAuth, UserApi, Provider } from "@betacall/ui-kit"
import { Button, Space, Typography } from "antd"
import React from "react";
import styled from "styled-components"
import { useSocket } from "./SocketProvider";
import { LinkOutlined, DisconnectOutlined, LogoutOutlined } from "@ant-design/icons"

export function Main () {
	const auth = useAuth();

	const { providers, toggleProvider } = useSocket();

	const connect: React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement> = React.useCallback((e) => {
		const provider = e.currentTarget.getAttribute('data-provider');
		toggleProvider(provider as Provider);
	}, [ toggleProvider ])

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