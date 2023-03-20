
export function getToken (headers: { authorization?: string }) {
	return headers.authorization?.split(" ").at(1);
}