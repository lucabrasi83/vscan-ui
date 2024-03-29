import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { InventoryDevices } from "./device.inventory.model";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { catchError } from "rxjs/operators";
import { AuthService } from "../auth/_services";
import {
	DeviceCredentialsCreate,
	DeviceCredentialsUpdate,
	DeviceUserCredentials
} from "./device.credentials.model";
import {
	SSHGatewayCreate,
	SSHGateways,
	SSHGatewayTestResult,
	SSHGatewayUpdate
} from "./ssh.gateway.model";
import { InventoryScanRequest } from "./inventory.scan.model";
import { InventoryScanResultsModel } from "./inventory.scan.results.model";
import { OndemandScanResultsModel } from "./ondemand.scan.results.model";
import {
	DeviceVulnerabilitiesHistoryModel,
	DeviceVulnerabilitiesModel
} from "./device.vulnerabilities.model";
import { VscanJobs } from "./scan.jobs.model";
import { UserCreate, UserUpdate, VscanUsersList } from "./users.model";
import {
	EnterpriseCreate,
	EnterprisesListModel,
	EnterpriseUpdate
} from "./enterprises.model";

const ALL_ENTERPRISES_URL = environment.vscanAPIURL + "/admin/enterprises/all";

const ENTERPRISE_URL = environment.vscanAPIURL + "/admin/enterprise";

const DEVICES_API_URL = environment.vscanAPIURL + "/devices/all";
const ALL_USER_DEVICE_CREDENTIALS =
	environment.vscanAPIURL + "/device-credentials/all";

const ALL_ENTERPRISE_SSH_GATEWAYS =
	environment.vscanAPIURL + "/ssh-gateways/all";

const INVENTORY_SCAN_URL =
	environment.vscanAPIURL + "/scan/bulk-anuta-inventory";

const ON_DEMAND_SCAN_URL =
	environment.vscanAPIURL + "/scan/bulk-on-demand-scan";

const DEVICE_VULNERABILITIES_URL =
	environment.vscanAPIURL + "/vulnerabilities/device/";

const USER_DEVICE_CREDENTIAL =
	environment.vscanAPIURL + "/device-credentials/credential";

const INVENTORY_DEVICES_DELETION = environment.vscanAPIURL + "/devices/device";

const ENTERPRISE_SSH_GATEWAY =
	environment.vscanAPIURL + "/ssh-gateways/gateway";

const JOBS_HISTORY = environment.vscanAPIURL + "/jobs/history";

const ALL_USERS_URL = environment.vscanAPIURL + "/admin/users/all";

const CREATE_USER_URL = environment.vscanAPIURL + "/admin/user";

const DELETE_USERS_URL = environment.vscanAPIURL + "/admin/users";

@Injectable({
	providedIn: "root"
})
export class VscanApiService {
	constructor(private http: HttpClient, private auth: AuthService) {}

	getAllInventoryDevices(): Observable<InventoryDevices> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.get<InventoryDevices>(DEVICES_API_URL, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	getDeviceVulnerabilities(
		dev: string
	): Observable<DeviceVulnerabilitiesModel> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.get<DeviceVulnerabilitiesModel>(DEVICE_VULNERABILITIES_URL + dev, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	getDeviceHistoryVuln(
		dev: string,
		ent: string
	): Observable<DeviceVulnerabilitiesHistoryModel> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.get<DeviceVulnerabilitiesHistoryModel>(
				DEVICE_VULNERABILITIES_URL +
					dev +
					"/history?recordLimit=10&enterpriseID=" +
					ent,
				{
					headers: httpHeaders
				}
			)
			.pipe(catchError(this.auth.handleError));
	}

	getAllUserDeviceCredentials(): Observable<DeviceUserCredentials> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.get<DeviceUserCredentials>(ALL_USER_DEVICE_CREDENTIALS, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	getAllEnterpriseSSHGateways(): Observable<SSHGateways> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.get<SSHGateways>(ALL_ENTERPRISE_SSH_GATEWAYS, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	launchInventoryScan(
		req: InventoryScanRequest
	): Observable<InventoryScanResultsModel> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.post<InventoryScanResultsModel>(INVENTORY_SCAN_URL, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	launchOnDemandScan(
		req: InventoryScanRequest
	): Observable<OndemandScanResultsModel> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.post<OndemandScanResultsModel>(ON_DEMAND_SCAN_URL, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	deleteDeviceCredentials(creds: string[]): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		const httpOptions = {
			headers: httpHeaders,
			body: { credentials: creds }
		};

		return this.http
			.request<any>("delete", USER_DEVICE_CREDENTIAL, httpOptions)
			.pipe(catchError(this.auth.handleError));
	}

	deleteInventoryDevices(devices: string[]): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		const httpOptions = {
			headers: httpHeaders,
			body: { devices: devices }
		};

		return this.http
			.request<any>("delete", INVENTORY_DEVICES_DELETION, httpOptions)
			.pipe(catchError(this.auth.handleError));
	}

	createDeviceCredentials(
		req: DeviceCredentialsCreate | DeviceCredentialsUpdate
	): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.post<any>(USER_DEVICE_CREDENTIAL, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	updateDeviceCredentials(req: DeviceCredentialsUpdate): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.patch<any>(
				USER_DEVICE_CREDENTIAL + "/" + req.credentialsName,
				req,
				{
					headers: httpHeaders
				}
			)
			.pipe(catchError(this.auth.handleError));
	}
	createSSHGateway(
		req: SSHGatewayCreate | SSHGatewayUpdate
	): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.post<any>(ENTERPRISE_SSH_GATEWAY, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	updateSSHGateway(req: SSHGatewayUpdate): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.patch<any>(ENTERPRISE_SSH_GATEWAY + "/" + req.gatewayName, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	deleteSSHGateways(sshgw: string[]): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		const httpOptions = {
			headers: httpHeaders,
			body: { sshGateways: sshgw }
		};

		return this.http
			.request<any>("delete", ENTERPRISE_SSH_GATEWAY, httpOptions)
			.pipe(catchError(this.auth.handleError));
	}

	connectivityTestSSHGateway(
		req: SSHGatewayCreate
	): Observable<SSHGatewayTestResult> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.post<SSHGatewayTestResult>(
				ENTERPRISE_SSH_GATEWAY + "/test-connectivity",
				req,
				{
					headers: httpHeaders
				}
			)
			.pipe(catchError(this.auth.handleError));
	}

	getAllUsers(): Observable<VscanUsersList> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.get<VscanUsersList>(ALL_USERS_URL, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	createUser(req: UserCreate | UserUpdate): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.post<any>(CREATE_USER_URL, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	updateUser(req: UserUpdate): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.patch<any>(CREATE_USER_URL + "/" + req.email, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	deleteUsers(userEmail: string[]): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		const httpOptions = {
			headers: httpHeaders,
			body: { users: userEmail }
		};

		return this.http
			.request<any>("delete", DELETE_USERS_URL, httpOptions)
			.pipe(catchError(this.auth.handleError));
	}

	getAllEnterprises(): Observable<EnterprisesListModel> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.get<EnterprisesListModel>(ALL_ENTERPRISES_URL, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	createEnterprise(
		req: EnterpriseCreate | EnterpriseUpdate
	): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.post<any>(ENTERPRISE_URL, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	updateEnterprise(req: EnterpriseUpdate, ent: string): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		return this.http
			.patch<any>(`${ENTERPRISE_URL}/${ent}`, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	deleteEnterprise(ent: string): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		const httpOptions = {
			headers: httpHeaders
		};

		return this.http
			.request<any>("delete", `${ENTERPRISE_URL}/${ent}`, httpOptions)
			.pipe(catchError(this.auth.handleError));
	}

	getjobsHistory(
		filters: any,
		sort: any,
		pageSize: number,
		pageNumber: number
	): Observable<VscanJobs> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		const httpParams = this.buildQueryURL(
			filters,
			sort,
			pageSize,
			pageNumber
		);

		return this.http
			.get<VscanJobs>(JOBS_HISTORY, {
				headers: httpHeaders,
				params: httpParams
			})
			.pipe(catchError(this.auth.handleError));
	}

	deleteScanJobsHistory(jobs: string[]): Observable<any> {
		const httpHeaders = new HttpHeaders().set(
			"Content-Type",
			"application/json"
		);

		const httpOptions = {
			headers: httpHeaders,
			body: { jobs: jobs }
		};

		return this.http
			.request<any>("delete", JOBS_HISTORY, httpOptions)
			.pipe(catchError(this.auth.handleError));
	}

	buildQueryURL(
		filters: any,
		sort: any,
		pageSize: number,
		pageNumber: number
	): HttpParams {
		const columnMaps = {
			startTime: "start_time",
			endTime: "end_time",
			jobResult: "job_result",
			agent: "scan_exec_agent"
		};

		let params = new HttpParams()
			.set("sort[direction]", sort.direction)
			.set("sort[column]", columnMaps[sort.column])
			.set("pageSize", pageSize.toString())
			.set("pageNumber", (pageSize * pageNumber).toString());

		if (filters) {
			Object.keys(filters).forEach(elem => {
				params = params.set("filters[" + elem + "]", filters[elem]);
			});
		}

		return params;
	}
}
