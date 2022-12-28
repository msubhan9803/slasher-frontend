import { Image } from 'react-bootstrap';
import styled from 'styled-components';

interface UserCircleImageProps {
  size?: string;
}

const UserCircleImage = styled(Image) <UserCircleImageProps>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  border-radius: 50%;
  object-fit: cover;
`;

UserCircleImage.defaultProps = {
  size: '3.125rem',
};

export default UserCircleImage;
