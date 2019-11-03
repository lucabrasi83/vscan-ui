export class VscanJobs {
	jobs: ScanJobs[];
	totalRecords: number;
}

export class ScanJobs {
	jobID: string;
	startTime: Date;
	endTime: Date;
	jobStatus: string;
	user: string;
	devicesScannedName: string[];
	devicesScannedIP: string[];
	agent: string;
	jobLogs: string;

	clear() {
		this.jobID = "";
		this.startTime = new Date();
		this.endTime = new Date();
		this.jobStatus = "";
		this.user = "";
		this.devicesScannedName = [];
		this.devicesScannedIP = [];
		this.agent = "";
		this.jobLogs = "";
	}
}
