export class SSHGateways {
	sshGateway: EnterpriseSSHGateway[];
}

export class EnterpriseSSHGateway {
	gatewayName: string;
	gatewayIP: string;
	gatewayUsername: string;
	gatewayPassword?: string;
	gatewayPrivateKey?: string;
	enterpriseID?: string;

	clear() {
		this.gatewayName = "";
		this.gatewayIP = "";
		this.gatewayUsername = "";
		this.gatewayPassword = "";
		this.gatewayPrivateKey = "";
		this.enterpriseID = "";
	}
}

export interface SSHGatewayCreate {
	gatewayName: string;
	gatewayIP: string;
	gatewayUsername: string;
	gatewayPassword?: string;
	gatewayPrivateKey?: string;
}

export interface SSHGatewayUpdate {
	gatewayName: string;
	gatewayIP?: string;
	gatewayUsername?: string;
	gatewayPassword?: string;
	gatewayPrivateKey?: string;
}

export interface SSHGatewayTestResult {
	message: string;
	testSuccess: boolean;
}
