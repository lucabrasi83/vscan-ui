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

const ADMIN_DEVICES_API_URL = environment.vscanAPIURL + "/admin/devices";

@Injectable({
	providedIn: "root"
})
export class VscanApiService {
	constructor(private http: HttpClient, private auth: AuthService) {}

	getAllInventoryDevices(): Observable<InventoryDevices> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");

		return this.http
			.get<InventoryDevices>(ADMIN_DEVICES_API_URL, {
				headers: httpHeaders
			})
			.pipe(catchError(this.auth.handleError));
	}
}
