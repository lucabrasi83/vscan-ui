import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
	InventoryDeviceModel,
	InventoryDevices
} from "./device.inventory.model";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { catchError } from "rxjs/operators";
import { AuthService } from "../auth/_services";

const ADHOC_SCAN_URL = environment.vscanAPIURL + "/admin/on-demand-scan";

@Injectable({
	providedIn: "root"
})
export class VscanApiService {
	constructor(private http: HttpClient, private auth: AuthService) {}

	getAllInventoryDevices(): Observable<InventoryDevices> {
		// Build URL for root and non-root users
		const ADMIN_DEVICES_API_URL = this.auth.isUserRoot()
			? environment.vscanAPIURL + "/admin/devices"
			: environment.vscanAPIURL + "/devices";

		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.get<InventoryDevices>(ADMIN_DEVICES_API_URL, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}

	launchAdHocScan(hash: string | Int32Array): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.post<any>(
				ADHOC_SCAN_URL,
				{
					hostname: "CSR1000V_RTR6",
					ip: "192.168.1.13",
					osType: "IOS-XE",
					credentialsName: "seb-lab-creds",
					logStreamHashReq: hash
				},
				{ headers: httpHeaders }
			)
			.pipe(catchError(this.auth.handleError));
	}
}
