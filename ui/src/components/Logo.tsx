import type { GetProps } from 'antd';
import Icon from "@ant-design/icons";
import Logosvg from '../assets/logo.svg?react';

type CustomIconComponentProps = GetProps<typeof Icon>;

const Logo = (props: Partial<CustomIconComponentProps>) => (
    <Icon
        component={Logosvg}
        {...props}
    />
);
export default Logo;