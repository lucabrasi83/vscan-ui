export class EnterprisesListModel {
	enterprises: VscanEnterprise[];
}

export class VscanEnterprise {
	enterpriseID: string;
	enterpriseName: string;
	enterpriseDevices: number;

	clear() {
		this.enterpriseID = "";
		this.enterpriseName = "";
		this.enterpriseDevices = 0;
	}
}

export interface EnterpriseCreate {
	enterpriseID: string;
	enterpriseName: string;
}
export interface EnterpriseUpdate {
	enterpriseName: string;
}
