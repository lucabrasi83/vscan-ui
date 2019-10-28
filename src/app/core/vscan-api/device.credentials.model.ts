export class DeviceUserCredentials {
	deviceCredentials: DeviceCredential[];
}

export class DeviceCredential {
	credentialsName: string;
	credentialsDeviceVendor: string;
	username: string;
	password?: string;
	iosEnablePassword?: string;
	privateKey?: string;

	clear() {
		this.credentialsName = "";
		this.credentialsDeviceVendor = "";
		this.username = "";
		this.password = "";
		this.iosEnablePassword = "";
		this.privateKey = "";
	}
}

export interface DeviceCredentialsCreate {
	credentialsName: string;
	credentialsDeviceVendor: string;
	username: string;
	password?: string;
	iosEnablePassword?: string;
	privateKey?: string;
}

export interface DeviceCredentialsUpdate {
	credentialsName?: string;
	credentialsDeviceVendor?: string;
	username?: string;
	password?: string;
	iosEnablePassword?: string;
	privateKey?: string;
}
