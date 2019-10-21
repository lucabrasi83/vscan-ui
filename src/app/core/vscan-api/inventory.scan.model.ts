export interface InventoryScanRequest {
	osType: string;
	sshGateway?: string;
	credentialsName: string;
	devices: any[];
	logStreamHashReq: string | Int32Array;
}
