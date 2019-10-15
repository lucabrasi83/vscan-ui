export class InventoryDeviceModel {
	deviceID: string;
	enterprise: string;
	mgmtIP: string;
	osType: string;
	osVersion: string;
	model: string;
	lastScanDate: Date;
	vulnerabilityStatus: string;

	clear() {
		this.deviceID = "";
		this.enterprise = "";
		this.mgmtIP = "";
		this.osType = "";
		this.osVersion = "";
		this.model = "";
		this.lastScanDate = new Date();
		this.vulnerabilityStatus = "";
	}
}
