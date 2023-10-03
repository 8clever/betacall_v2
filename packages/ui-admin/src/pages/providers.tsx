import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ProviderApi } from "@betacall/ui-kit";
import { Button, Space, Table, TableColumnType } from "antd";
import React from "react";

function RenderActions (props: { item: ProviderApi.Provider }) {
	const { item } = props;
	return (
		<Space>
			<Button size="small" icon={<EditOutlined />} />
			{
				item.internal ? null :
				<Button size="small" danger icon={<DeleteOutlined />} />
			}
		</Space>
	)
}

const columns: TableColumnType<ProviderApi.Provider>[] = [
	{
		title: "Name",
		dataIndex: 'name'
	},
	{
		title: "Key",
		dataIndex: "key"
	},
	{
		title: "",
		width: 100,
		render: (value: ProviderApi.Provider) => <RenderActions item={value} />
	},
]

export function Providers () {

	const [ providers, setProviders ] = React.useState([]);

	React.useEffect(() => {
		const api = new ProviderApi();
		api.getProviders().then(setProviders);
	}, []);

	return (
		<>
			<Table 
				columns={columns}
				dataSource={providers}
			/>
		</>
	);
}

export default Providers;