import { Call } from "../entities/call.entity";

export interface ProviderController {

	undercall (id: string): Promise<null>;

	/** return provider specific order */
	getOrdersByIds (ids: string[]): object[]

	getNextOrder (): Promise<Call>;
}