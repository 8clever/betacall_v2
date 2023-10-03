import { Spin } from "antd"
import styled from "styled-components"

const Container = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Loading = () => {
  return (
    <Container>
      <Spin size='large' />
    </Container>
  )
}