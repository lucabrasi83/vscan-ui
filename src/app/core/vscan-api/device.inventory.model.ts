export class InventoryDevices {
	devices: InventoryDeviceModel[];
}

export class InventoryDeviceModel {
	deviceID: string;
	enterpriseID: string;
	enterpriseName: string;
	mgmtIP: string;
	osType?: string;
	osVersion?: string;
	deviceModel?: string;
	serialNumber?: string;
	suggestedSW?: string;
	deviceHostname?: string;
	productID?: string;
	vulnerabilitiesFound?: string[];
	serviceContractNumber?: string;
	serviceContractDescription?: string;
	serviceContractEndDate?: Date;
	serviceContractSiteCountry?: string;
	serviceContractAssociated?: boolean;
	lastScan?: Date;
	scanMeanTimeMilliseconds?: number;

	clear() {
		this.deviceID = "";
		this.enterpriseID = "";
		this.enterpriseName = "";
		this.mgmtIP = "";
		this.osType = "";
		this.osVersion = "";
		this.deviceModel = "";
		this.serialNumber = "";
		this.suggestedSW = "";
		this.deviceHostname = "";
		this.productID = "";
		this.vulnerabilitiesFound = [];
		this.serviceContractNumber = "";
		this.serviceContractDescription = "";
		this.serviceContractEndDate = new Date();
		this.serviceContractSiteCountry = "";
		this.serviceContractAssociated = false;
		this.lastScan = new Date();
		this.scanMeanTimeMilliseconds = NaN;
	}
}
