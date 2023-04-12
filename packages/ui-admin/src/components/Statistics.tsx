import { InfoOutlined, SearchOutlined } from "@ant-design/icons";
import { B2CPLManualApi, DatePicker, Provider, StatsApi, TDApi } from "@betacall/ui-kit"
import { Button, Form, Modal, Select, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React from "react"
import styled from "styled-components"

const showJson = (data: object) => {
	const htmlJson = JSON.stringify(data, null, " ")
		.replace(/\n/gmi, '<br/>')
		.replace(/\s/gmi, "&emsp;")
		.replace(/("[a-zA-Z_0-9]+"):/gmi, "<span style='color:#0a3069'>$1</span>:")
	Modal.info({
		width: 1000,
		title: "JSON",
		content: <div dangerouslySetInnerHTML={{ __html: htmlJson }}/>
	})
}

const columns: ColumnsType<StatsApi.Stat> = [
	{
		title: "Provider",
		key: "provider",
		dataIndex: "provider"
	},
	{
		title: "User",
		key: "user",
		dataIndex: ["user", 'login']
	},
	{
		title: "Date",
		key: "date",
		dataIndex: ['dt'],
		render: (_) => new Date(_).toLocaleString()
	},
	{
		title: "Order ID",
		key: "orderid",
		render: (_: StatsApi.Stat) => {
			if (_.provider === Provider.TOP_DELIVERY) {
				const order = _.data as TDApi.Order;
				return order.orderIdentity.orderId
			}
			if (_.provider === Provider.B2CPL_MANUAL) {
				const order = _.data as B2CPLManualApi.DeliverySetState;
				return order.callid;
			}
			return ''
		}
	},
	{
		title: "Status",
		key: "status",
		render: (_: StatsApi.Stat) => {
			if (_.provider === Provider.TOP_DELIVERY) {
				const order = _.data as TDApi.Order;
				return order.workStatus.name;
			}
			if (_.provider === Provider.B2CPL_MANUAL) {
				const order = _.data as B2CPLManualApi.DeliverySetState;
				return order.call_statuses[0].state;
			}
			return ""
		}
	},
	{
		title: "JSON",
		key: 'json',
		dataIndex: "data",
		render: (_) => {
			return (
				<Button
					onClick={() => {
						showJson(_);
					}}
					ghost
					size="small"
					shape="circle"
					type="primary" 
					icon={<InfoOutlined />} 
				/>
			)
		}
	}
]

export function Statistics () {
	
	const [ stats, setStats ] = React.useState<{
		list: StatsApi.Stat[],
		count: number
	}>({
		list: [],
		count: 0
	});

	const [ filter, setFilter ] = React.useState<
		Required<Pick<StatsApi.GetListParams, "skip" | "limit">> &
		StatsApi.GetListParams
	>({
		skip: 0,
		limit: 10
	})

	React.useEffect(() => {
		const api = new StatsApi();
		api.getList(filter).then(data => {
			setStats(data);
		});
	}, [ filter ]);

	const setPage = React.useCallback((page: number) => {
		setFilter(state => {
			return {
				...state,
				skip: (page - 1) * state.limit
			}
		});
	}, []);

	const [form] = Form.useForm();

	const submit = React.useCallback((values: {
		'range-picker'?: Date[],
		'provider': Provider
	}) => {
		const from = values['range-picker']?.[0];
		const to = values['range-picker']?.[1];
		setFilter(state => {
			return {
				...state,
				provider: values.provider,
				from: from ? DatePicker.StartOfDay(from)?.toJSON() : "",
				to: to ? DatePicker.EndOfDay(to)?.toJSON() : ""
			}
		})
	}, []);
	
	return (
		<Container>
			<FilterContainer>
				<Form layout="inline" onFinish={submit} form={form}>
					<Form.Item name="range-picker" label="Date">
						<DatePicker.RangePicker 
							allowEmpty={[true, true]}
						/>
					</Form.Item>
					<Form.Item name="provider" label="Provider">
						<Select allowClear style={{ minWidth: 150 }}>
							{Object.values(Provider).map(p => {
								return (
									<Select.Option key={p} value={p}>
										{p}
									</Select.Option>
								)
							})}
						</Select>
					</Form.Item>
					<Form.Item>
						<Button 
							type="primary"
							htmlType="submit" 
							icon={<SearchOutlined />}>
							Search
						</Button>
					</Form.Item>
				</Form>
			</FilterContainer>
			<Table
				columns={columns}
				pagination={{
					showTotal: (total) => `Total: ${total}`,
					onChange: setPage,
					current: filter.skip / filter.limit + 1,
					total: stats.count,
				}}
				dataSource={stats.list}
			/>
		</Container>
	)
}

const FilterContainer = styled.div`
	margin-bottom: 10px;
`

const Container = styled.div`
	padding: 10px;
`