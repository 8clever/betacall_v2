import { UserApi } from "@betacall/ui-kit";
import { Form, Input, Modal, Select } from "antd";
import React from "react";

interface IProps {
	visible?: boolean;
	userId?: string;
	toggle: () => void;
	onSave: () => void;
}

export function UserEdit (props: IProps) {
	const { toggle, onSave, userId, visible } = props;

	const [ form ] = Form.useForm();

	React.useEffect(() => {
		if (!visible) return;

		if (userId) {
			const api = new UserApi();
			api.list({ id: userId }).then(users => {
				form.setFieldsValue(users.list[0]);
			});
			return;
		}
		
		form.resetFields();
	}, [ form, userId, visible ])

	const save = React.useCallback((user: UserApi.User) => {
		const api = new UserApi();
		const upd = { ...user };
		if (userId) upd.id = userId
		api.edit(upd).then(() => {
			toggle();
			onSave();
		});
	}, [ toggle, onSave, userId ]);
	
	return (
		<Modal 
			onOk={form.submit}
			onCancel={toggle}
			open={props.visible} 
			title="User Edit" 
			forceRender>
			<Form form={form} onFinish={save}>
				{
					userId ? null :
					<Form.Item label="Login" name="login" rules={[
						{ required: true }
					]}>
						<Input />
					</Form.Item>
				}
				<Form.Item label="Role" name="role" rules={[
					{ required: true }
				]}>
					<Select>
						{Object.values(UserApi.Role).map(r => {
							return (
								<Select.Option key={r} value={r}>{r}</Select.Option>
							)
						})}
					</Select>
				</Form.Item>
				<Form.Item label="Password" name="password">
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	)
}