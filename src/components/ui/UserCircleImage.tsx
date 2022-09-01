import { Image } from 'react-bootstrap';
import styled from 'styled-components';

interface UserCircleImageProps {
  width?: string;
  height?: string;
}

const UserCircleImage = styled(Image) <UserCircleImageProps>`
  width: ${(props) => props.height};
  height: ${(props) => props.height};
`;

UserCircleImage.defaultProps = {
  width: '',
  height: '',
};

export default UserCircleImage;
