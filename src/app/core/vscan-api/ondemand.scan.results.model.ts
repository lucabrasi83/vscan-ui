export interface OndemandScanResultsModel {
	results: {
		scanJobID: string;
		scanJobStartTime: Date;
		scanJobEndTime: Date;
		scanJobAgent?: string;
		devicesScannedSuccess: string[];
		devicesScannedFailure?: string[];
		devicesScannedSkipped?: string[];
		vulnFoundDetails?: deviceScanResults[];
	};
}

interface deviceScanResults {
	deviceName: string;
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
