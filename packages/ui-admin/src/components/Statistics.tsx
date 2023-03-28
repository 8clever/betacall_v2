import { InfoOutlined } from "@ant-design/icons";
import { Provider, StatsApi, TDApi } from "@betacall/ui-kit"
import { Button, Modal, Table } from "antd";
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

	const [ filter, setFilter ] = React.useState({
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
	
	return (
		<Container>
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

const Container = styled.div`
	padding: 10px;
`