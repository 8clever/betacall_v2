import { Button, Card, Divider, Form, Input, Layout, Typography } from "antd";
import styled from "styled-components";
import React from "react";
import { UserApi } from "@betacall/ui-kit";
import qs from 'querystring';
import { LoginOutlined } from '@ant-design/icons'

export function SignIn () {

	const onFinish = React.useCallback(async (values: UserApi.SignIn) => {
		const userApi = new UserApi();
		await userApi.signin(values)
		const query = qs.parse(window.location.search.slice(1));
		const backUrl = query.backUrl as string || "/";
		window.location.href = backUrl;
	}, []);

	return (
		<Layout>
			<Container>
				<Card bordered>
					<Form 
						onFinish={onFinish}
					>
						<Typography.Title>
							Welcome to Betacall
						</Typography.Title>
						<Divider />
						<Form.Item
							name='username'
							required 
							rules={[{ required: true, message: 'Please input your username!' }]}
							label='Login'>
							<Input />
						</Form.Item>
						<Form.Item 
							required
							name="password"
							rules={[{ required: true, message: 'Please input your password!' }]}
							label="Password">
							<Input.Password />
						</Form.Item>
						<Divider />
						<Form.Item style={{ textAlign: "center" }}>
							<Button 
								icon={<LoginOutlined />}
								size="large" 
								type="link" 
								htmlType="submit">
								Sign In
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Container>
		</Layout>
	)
}

const Container = styled.div`
	display: flex;
	align-items: center;
	height: 100vh;
	width: 100vw;
	justify-content: center;
`