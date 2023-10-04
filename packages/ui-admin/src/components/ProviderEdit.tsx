import { ReloadOutlined } from "@ant-design/icons";
import { ProviderApi } from "@betacall/ui-kit";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import React from "react";
import { v4 as uid } from "uuid"

interface IProps {
	visible: boolean;
	toggle: () => void;
	onSave: () => void;
	item?: ProviderApi.Provider | null
}

export function ProviderEdit (props: IProps) {
	const { visible, item, toggle, onSave } = props;

	const [ form ] = Form.useForm();

	const submit = React.useCallback(async (value: ProviderApi.Provider) => {
		const api = new ProviderApi();
		await api.saveProvider(value);
		toggle();
		onSave();
	}, [ toggle, onSave ]);

	React.useEffect(() => {
		if (visible) {
			form.resetFields();
			if (item?.id)
				form.setFieldsValue(item)
		}
	}, [ visible, form.setFieldsValue, item ]);

	const updateApiKey = React.useCallback(() => {
		form.setFieldValue('apiKey', uid());
	}, [ form.setFieldValue ]);

	return (
		<Modal open={visible} title="Provider Edit" onOk={form.submit} onCancel={props.toggle}>
			<Form form={form} onFinish={submit}>
				<Form.Item name="id" noStyle/>
				<Form.Item label="Key" name="key" rules={[{ required: true }]}>
					<Input disabled={item?.internal} />
				</Form.Item>
				<Form.Item label="Name" name="name" rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item label="Slots" name="slots" rules={[{ required: true, type: "number", min: 0 }]}>
					<InputNumber />
				</Form.Item>
				<Form.Item label="Api Key" name="apiKey">
					<Input 
						readOnly
						suffix={
							<Button onClick={updateApiKey} size="small" type="ghost" icon={<ReloadOutlined />} />
						}
					/>
				</Form.Item>
			</Form>
		</Modal>
	)
}