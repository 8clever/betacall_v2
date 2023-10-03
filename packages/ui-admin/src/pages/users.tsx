import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import { UserApi } from "@betacall/ui-kit"
import { Button, Modal, Space, Table, TableColumnsType } from "antd"
import React from "react"
import styled from "styled-components"
import { UserEdit } from "../components/UserEdit"

export function Users () {

	const [ users, setUsers ] = React.useState<{ list: UserApi.User[], count: number }>({
		list: [],
		count: 0
	});

	const [ filter, setFilter ] = React.useState<Partial<UserApi.User> & { skip: number, limit: number }>({
		limit: 10,
		skip: 0
	});

	const [ editUserModal, setUserEditModal ] = React.useState({
		visible: false,
		userId: ""
	});

	const loadUsers = React.useCallback(() => {
		const api = new UserApi();
		api.list(filter).then(list => {
			setUsers(list);
		});
	}, [ filter ]);

	React.useEffect(() => {
		loadUsers()
	}, [ loadUsers ]);

	const changePage = React.useCallback((page: number) => {
		setFilter(state => {
			return {
				...state,
				skip: state.limit * (page - 1)
			}
		})
	}, []);

	const toggleModal = React.useCallback(() => {
		setUserEditModal(state => {
			return {
				...state,
				visible: !state.visible
			}
		})
	}, []);

	const refresh = React.useCallback(() => {
		loadUsers();
	}, [ loadUsers ]);

	const editUser = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
		const id = e.currentTarget.getAttribute('data-id') || "";
		setUserEditModal(state => {
			return {
				...state,
				visible: true,
				userId: id
			}
		})
	}, [])

	const deleteUser = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
		const id = e.currentTarget.getAttribute('data-id') || "";
		const api = new UserApi();
		Modal.confirm({
			title: "Warning",
			content: "Are you sure want to delete user?",
			onOk: async () => {
				await api.delete(id);
				refresh()
			}
		})
	}, [ refresh ]);

	const columns = React.useMemo(() => {
		const columns: TableColumnsType<UserApi.User> = [
			{
				title: "Login",
				key: "login",
				dataIndex: "login"
			},
			{
				title: "Role",
				key: 'role',
				dataIndex: "role"
			},
			{
				title: "Actions",
				key: "actions",
				render: (_: UserApi.User) => {
					return (
						<Space>
							<Button
								data-id={_.id}
								onClick={editUser}
								size="small" 
								icon={<EditOutlined />} 
							/>
							<Button 
								ghost
								danger
								data-id={_.id} 
								size="small" 
								onClick={deleteUser}
								icon={<DeleteOutlined />}
							/>
						</Space>
					)
				}
			}
		]
		return columns;
	}, [ editUser, deleteUser ])

	return (
		<Container>
			<Header>
				<Button 
					onClick={editUser}
					icon={<PlusOutlined />}>
					User
				</Button>
			</Header>
			<Table 
				pagination={{
					total: users.count,
					onChange: changePage,
					pageSize: filter.limit,
					current: filter.skip / filter.limit + 1
				}}
				columns={columns}
				dataSource={users.list}
			/>
			<UserEdit 
				{...editUserModal}
				toggle={toggleModal}
				onSave={refresh}
			/>
		</Container>
	)
}

const Header = styled.div`
	display: flex;
	justify-content: end;
	margin-bottom: 5px;
`

const Container = styled.div`
	padding: 10px;
`

export default Users;