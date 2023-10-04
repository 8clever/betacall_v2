import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ProviderApi, useApi, useModal, useRequest } from "@betacall/ui-kit";
import { Button, Space, Table, TableColumnType } from "antd";
import React from "react";
import { ProviderEdit } from "../components/ProviderEdit";
import styled from "styled-components";

const tableCtx = React.createContext({
	onEdit: (i: ProviderApi.Provider) => {/** empty */},
	onRemove: (i: ProviderApi.Provider) => {/** empty */}
})

function RenderActions (props: { item: ProviderApi.Provider }) {
	const { item } = props;
	const { onEdit, onRemove } = React.useContext(tableCtx);

	const edit = React.useCallback(() => {
		onEdit(item)
	}, [ item, onEdit ]);

	const remove = React.useCallback(() => {
		onRemove(item)
	}, [ item, onRemove ])

	return (
		<Space>
			<Button size="small" icon={<EditOutlined />} onClick={edit} />
			{
				item.internal ? null :
				<Button size="small" danger icon={<DeleteOutlined />} onClick={remove} />
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
		title: "Slots",
		dataIndex: "slots"
	},
	{
		title: "",
		width: 100,
		render: (value: ProviderApi.Provider) => <RenderActions item={value} />
	},
]

export function Providers () {

	const api = useApi(ProviderApi);

	const providers = useRequest(api.getProviders, {});

	const modal = useModal<ProviderApi.Provider>();

	const remove = React.useCallback(async (i: ProviderApi.Provider) => {
		if (!i.id) return;
		await api.removeProvider(i.id);
		await providers.loadData();
	}, [ api, providers.loadData ]);

	return (
		<>
			<Header>
				<Button 
					icon={<PlusOutlined />} 
					onClick={modal.toggleModal}>
					Provider
				</Button>
			</Header>
			<tableCtx.Provider value={{
				onEdit: modal.openModal,
				onRemove: remove
			}}>
				<Table 
					columns={columns}
					dataSource={providers.state}
				/>
			</tableCtx.Provider>
			<ProviderEdit
				visible={modal.visible}
				toggle={modal.toggleModal}
				onSave={providers.loadData}
				item={modal.value}
			/>
		</>
	);
}

const Header = styled.div`
	display: flex;
	justify-content: end;
	margin-bottom: 5px;
`

export default Providers;