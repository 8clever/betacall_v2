import { ProviderApi } from "@betacall/ui-kit";
import { Form, Input, Modal } from "antd";
import React from "react";

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
	}, [ visible, form.setFieldsValue, item ])

	return (
		<Modal open={visible} title="Provider Edit" onOk={form.submit} onCancel={props.toggle}>
			<Form form={form} onFinish={submit}>
				<Form.Item name="id"/>
				<Form.Item label="Key" name="key" rules={[{ required: true }]}>
					<Input disabled={item?.internal} />
				</Form.Item>
				<Form.Item label="Name" name="name" rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item label="Api Key" name="apiKey">
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	)
}