import { Layout, Menu, MenuProps } from "antd";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LineChartOutlined, UserOutlined } from '@ant-design/icons'
import { MenuInfo } from "rc-menu/lib/interface";

interface IProps {
	children?: React.ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
	{
		icon: <LineChartOutlined />,
		key: "/",
		label: "Statistics"
	},
	{
		icon: <UserOutlined />,
		key: "/users",
		label: "Users"
	}
]

export function Base (props: IProps) {

	const location = useLocation()

	const navigate = useNavigate();

	const [ collapsed, setCollapsed ] = React.useState(true);

	const onMenuClick = React.useCallback((info: MenuInfo) => {
		if (info.key)
			navigate(info.key);
	}, [ navigate ])

	return (
		<Layout style={{ height: "100vh" }}>
			<Layout.Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
				<Menu 
					onClick={onMenuClick}
					selectedKeys={[location.pathname]}
					items={items}
					theme="dark" 
				/>
			</Layout.Sider>
			<Layout style={{ overflow: "auto" }}>
				{props.children}
			</Layout>
		</Layout>
	)
}