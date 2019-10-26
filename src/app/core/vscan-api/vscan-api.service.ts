import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { InventoryDevices } from "./device.inventory.model";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { catchError } from "rxjs/operators";
import { AuthService } from "../auth/_services";
import { DeviceUserCredentials } from "./device.credentials.model";
import { SSHGateways } from "./ssh.gateway.model";
import { InventoryScanRequest } from "./inventory.scan.model";
import { InventoryScanResultsModel } from "./inventory.scan.results.model";
import { OndemandScanResultsModel } from "./ondemand.scan.results.model";
import {
	DeviceVulnerabilitiesHistoryModel,
	DeviceVulnerabilitiesModel
} from "./device.vulnerabilities.model";

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
	environment.vscanAPIURL + "/device-credentials/credential/";

@Injectable({
	providedIn: "root"
})
export class VscanApiService {
	constructor(private http: HttpClient, private auth: AuthService) {}

	getAllInventoryDevices(): Observable<InventoryDevices> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.get<InventoryDevices>(DEVICES_API_URL, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	getDeviceVulnerabilities(
		dev: string
	): Observable<DeviceVulnerabilitiesModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

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
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

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
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.get<DeviceUserCredentials>(ALL_USER_DEVICE_CREDENTIALS, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	getAllEnterpriseSSHGateways(): Observable<SSHGateways> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.get<SSHGateways>(ALL_ENTERPRISE_SSH_GATEWAYS, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	launchInventoryScan(
		req: InventoryScanRequest
	): Observable<InventoryScanResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.post<InventoryScanResultsModel>(INVENTORY_SCAN_URL, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	launchOnDemandScan(
		req: InventoryScanRequest
	): Observable<OndemandScanResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.post<OndemandScanResultsModel>(ON_DEMAND_SCAN_URL, req, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	deleteDeviceCredentials(creds: string): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.delete<any>(USER_DEVICE_CREDENTIAL + creds, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}
}
