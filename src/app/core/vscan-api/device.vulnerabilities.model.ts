export interface DeviceVulnerabilitiesModel {
	results: deviceVulnerabilities[] | string;
}

interface deviceVulnerabilities {
	advisoryID: string;
	advisoryTitle: string;
	bugID: string[];
	cve: string[];
	sir: string;
	cvss: number;
	publicationURL: string;
	publicationDate: Date;
}

export interface DeviceVulnerabilitiesHistoryModel {
	results: vulnHistory[] | string;
}

interface vulnHistory {
	scanDate: Date;
	vulnFound: string[];
}
