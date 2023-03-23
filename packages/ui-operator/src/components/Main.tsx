import { useAuth, UserApi } from "@betacall/ui-kit"
import { Button, Typography } from "antd"
import styled from "styled-components"

export function Main () {
	const auth = useAuth();

	return (
		<Container>
			<Typography.Title level={3}>
				Hello {auth.user?.login}
			</Typography.Title>
			<Typography.Text>
				Wait until you receive order
			</Typography.Text>
			<div>
				<Button onClick={UserApi.Logout} type="link">
					Logout
				</Button>
			</div>
		</Container>
	)
}

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`