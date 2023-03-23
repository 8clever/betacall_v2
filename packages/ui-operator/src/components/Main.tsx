import { Button } from "antd"
import styled from "styled-components"

export function Main () {
	return (
		<Container>
			Wait until you receive order
			<Button type="ghost">Logout</Button>
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