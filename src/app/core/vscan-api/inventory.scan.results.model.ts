export interface InventoryScanResultsModel {
	results: {
		scanJobID: string;
		scanJobStartTime: Date;
		scanJobEndTime: Date;
		scanJobAgent?: string;
		devicesScannedSuccess: string[];
		devicesScannedFailure?: string[];
		devicesScannedSkipped?: string[];
		devicesScanResults?: deviceScanResults[];
	};
}

interface deviceScanResults {
	deviceName: string;
	mgmtIPAddress: string;
	status: string;
	OSType: string;
	OSVersion: string;
	ciscoModel: string;
	serialNumber: string;
	hostname: string;
	totalVulnerabilitiesFound: number;
	totalVulnerabilitiesScanned: number;
	scanDeviceMeanTimeMsec: number;
	vulnerabilitiesFoundDetails: vulnerabilitiesFoundDetails[];
}

interface vulnerabilitiesFoundDetails {
	advisoryId: string;
	advisoryTitle: string;
	firstPublished: string;
	bugIDs: string[];
	cves: string[];
	sir: string;
	cvssBaseScore: string;
	publicationUrl: string;
}
