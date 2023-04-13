
export interface PvzInfo {
	"pvz_city": string,
	"pvz_time": string,
	"pvz_metro": string,
	"pvz_address": string,
	"pvz_address_comment": string,
	"pvz_phone": string,
	"pvz_id": number;
}
export interface DeliverySetStatus {
	"state": string;
	"additional_data": object;
	"codes": string[];
}
export interface DeliverySetState {
	"callid": string;
	"date_start": string;
	"date_end": string;
	"call_statuses": DeliverySetStatus[]
}

export interface DenyReason {
	"reject_reason": string;
	"reject_description": string;
	"required_comment": boolean
}

export interface CallStatus {
	"state": string;
	"status_name": string;
}
export interface CallStatusType {
	"call_type_id": number;
	"call_type": string;
	"call_status": CallStatus[]
}
export interface DeliveryDayNearestParams {
	"code": string;
	"delivery_zip": string;
}

export interface DeliveryDayNearestTime {
	"time_from": string;
	"time_to": string;
}

export interface DeliveryDayNearest {
	"delivery_date": string;
	"delivery_time": DeliveryDayNearestTime[];
}

export interface DeliveryFlow {
	"code": string,
	"delivery_number": number,
	"delivery_date": string,
	"time_from": number,
	"time_to": number,
	"delivery_state": string,
	"delivery_state_comment": string,
	"delivery_zip": string,
	"delivery_city": string,
	"delivery_street": string,
	"courier_name": string,
	"courier_phone": string
}

export interface Package {
	"code": string,
	"date_over": string,
	"delivery_type": string,
	"delivery_terms": string,
	"package_call_comment": string,
	"script_text": string,
	"price_product": number,
	"price_delivery": number,
	"price_topay": number,
	"box_cnt": number,
	"delivery_access": boolean,
	"flag_paymentlink": boolean,
	"flag_oversized": boolean,
	"flag_partial": boolean,
	"flag_open": number,
	"flag_fitting": boolean,
	"lastDelivery": string,
	"deliveryflow": DeliveryFlow[]
}

export interface Courier {
	"legal_name": string,
	"flag_cash": boolean,
	"flag_cashless": boolean,
	"flag_pvz": boolean,
	"message_text": string
}

export interface Order {
	"callid": string;
	"priority": number,
	"client_companyid": string,
	"companycourier": Courier,
	"phone": string,
	"phone_ext": string,
	"delivery_fio": string,
	"delivery_zip": string,
	"delivery_city": string,
	"delivery_street": string,
	"flag_quick": boolean,
	"quick_comment": string,
	"flag_oversized": boolean,
	"packages": Package[]
}