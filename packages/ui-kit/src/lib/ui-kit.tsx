import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UiKitProps {}

const StyledUiKit = styled.div`
  color: pink;
`;

export function UiKit(props: UiKitProps) {
  return (
    <StyledUiKit>
      <h1>Welcome to UiKit!</h1>
    </StyledUiKit>
  );
}

export default UiKit;
