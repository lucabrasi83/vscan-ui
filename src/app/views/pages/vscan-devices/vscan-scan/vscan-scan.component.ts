import {
	Component,
	ElementRef,
	Inject,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { environment } from "../../../../../environments/environment";
import { Md5 } from "ts-md5";
import { AuthService } from "../../../../core/auth/_services";
import { VscanApiService } from "../../../../core/vscan-api/vscan-api.service";
import {
	catchError,
	debounceTime,
	finalize,
	switchMap,
	tap
} from "rxjs/operators";
import { forkJoin, of, throwError } from "rxjs";
import { ToastNotifService } from "../../../../core/_base/layout/services/toast-notif.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { HttpClient } from "@angular/common/http";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { InventoryDeviceModel } from "../../../../core/vscan-api/device.inventory.model";
import { DeviceCredential } from "../../../../core/vscan-api/device.credentials.model";
import { EnterpriseSSHGateway } from "../../../../core/vscan-api/ssh.gateway.model";
import { InventoryScanRequest } from "../../../../core/vscan-api/inventory.scan.model";

const DEVICE_SEARCH_API_URL =
	environment.vscanAPIURL + "/devices/search?pattern=";

export interface ScanSelectedDevicesData {
	windowTitle: string;
	selectedDevices: InventoryDeviceModel[];
}

@Component({
	selector: "vscan-vscan-scan",
	templateUrl: "./vscan-scan.component.html",
	styleUrls: ["./vscan-scan.component.scss"]
})
export class VscanScanComponent implements OnInit, OnDestroy {
	// Maximum Devices supported in one scan job
	MAX_DEVICES = 20;

	// Unique Hash to generate for log file stream request
	hash: string | Int32Array = this.generateLogStreamHash();

	// Initialize JWT Token from NGRX Store
	currentUserToken: string = "";

	// Declare Websocket Subject
	webSocketSubject: WebSocketSubject<any>;

	loading = true;
	isSearching = false;
	filteredDevices: string[] = [];

	devicesFormGroup: FormGroup;
	logStreamFormGroup: FormGroup;

	// Chip separators
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];

	// Device Selection Chip
	deviceSelectionChip: string[] = [];

	// Chip Element
	@ViewChild("chipList", { static: false }) chipList;

	// Device Input Element
	@ViewChild("deviceInput", { static: false }) deviceInput: ElementRef;

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;
	loadingDialog = true;

	// Supported OS for OVAL scans
	supportedOS = ["IOS", "IOS-XE"];

	// User Device Credentials
	userDeviceCredentials: DeviceCredential[] = [];

	// Enterprise SSH Gateway
	enterpriseSSHGateway: EnterpriseSSHGateway[] = [];

	constructor(
		public dialogRef: MatDialogRef<VscanScanComponent>,
		private auth: AuthService,
		private vscan: VscanApiService,
		private toastNotif: ToastNotifService,
		private _formBuilder: FormBuilder,
		private http: HttpClient,
		@Inject(MAT_DIALOG_DATA) public data: ScanSelectedDevicesData
	) {}

	// Progress Button options during scan request
	barButtonOptions: MatProgressButtonOptions = {
		active: true,
		text: "Scanning...",
		buttonColor: "accent",
		barColor: undefined,
		raised: true,
		stroked: false,
		mode: "indeterminate",
		value: 0,
		disabled: false,
		fullWidth: false,
		buttonIcon: {
			fontIcon: "security"
		}
	};

	onCloseDialog(): void {
		this.dialogRef.close();
	}

	ngOnInit() {
		this.devicesFormGroup = this._formBuilder.group({
			devicesCtrl: ["", Validators.required],
			osTypeCtrl: ["", Validators.required],
			credentialsCtrl: ["", Validators.required],
			sshGatewayCtrl: [""]
		});
		this.logStreamFormGroup = this._formBuilder.group({
			logStreamCtrl: ["", Validators.required]
		});

		// Devices Search
		this.devicesFormGroup
			.get("devicesCtrl")
			.valueChanges.pipe(
				debounceTime(500),
				tap(() => {
					this.filteredDevices = [];
					this.isSearching = true;
				}),
				switchMap(value =>
					this.http.get(DEVICE_SEARCH_API_URL + value).pipe(
						finalize(() => {
							this.isSearching = false;
						})
					)
				)
			)
			.subscribe(data => {
				if (data["devices"] == undefined) {
					this.filteredDevices = [];
				} else {
					this.filteredDevices = data["devices"];
				}
			});

		// Get Current JWT Token from NGRX Store
		this.currentUserToken = this.auth.getStoreToken();

		// Populate Selected Devices from table
		if (this.data.selectedDevices) {
			this.data.selectedDevices.forEach(rec => {
				this.deviceSelectionChip.push(rec.deviceID);
			});
			this.devicesFormGroup
				.get("devicesCtrl")
				.setValue(this.deviceSelectionChip);
			this.devicesFormGroup.get("osTypeCtrl").setValue("IOS-XE");
		}

		// Fetch User Data from VSCAN API
		let deviceCredentials = this.vscan.getAllUserDeviceCredentials();
		let enterpriseSSHGWS = this.vscan.getAllEnterpriseSSHGateways();

		forkJoin([deviceCredentials, enterpriseSSHGWS])
			.pipe(
				tap(() => {
					this.loadingDialog = false;
				}),
				catchError(err => {
					this.toastNotif.errorToastNotif(
						err,
						"Failed to fetch user data"
					);
					this.loadingDialog = false;
					return throwError(err);
				})
			)
			.subscribe(res => {
				this.userDeviceCredentials = res[0].deviceCredentials;
				this.enterpriseSSHGateway = res[1].sshGateway;
			});
	}

	ngOnDestroy(): void {
		if (this.webSocketSubject) {
			this.webSocketSubject.next(null);
			this.webSocketSubject.unsubscribe();
		}
	}

	private generateLogStreamHash(): string | Int32Array {
		// Generate Hash based on user email and current date/time
		return Md5.hashStr(
			this.auth.getUserTokenField("email") + Date.now().toLocaleString()
		);
	}

	addDeviceToScan(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// if ((value || "").trim()) {
		// 	this.deviceSelectionChip.push(value.trim());
		// }

		// Reset the input value
		if (input) {
			input.value = "";
		}

		this.chipList.errorState =
			this.deviceSelectionChip.length === 0 ||
			this.deviceSelectionChip.length > this.MAX_DEVICES;

		if (this.chipList.errorState) {
			this.devicesFormGroup.controls.devicesCtrl.setValue(null);
		} else {
			this.devicesFormGroup.controls.devicesCtrl.setValue(
				this.deviceSelectionChip
			);
		}
	}
	onRemoveDeviceToScan(dev) {
		const index = this.deviceSelectionChip.indexOf(dev);

		if (index >= 0) {
			this.deviceSelectionChip.splice(index, 1);
		}
		this.chipList.errorState =
			this.deviceSelectionChip.length === 0 ||
			this.deviceSelectionChip.length > this.MAX_DEVICES;

		if (this.chipList.errorState) {
			this.devicesFormGroup.controls.devicesCtrl.setValue(null);
		} else {
			this.devicesFormGroup.controls.devicesCtrl.setValue(
				this.deviceSelectionChip
			);
		}
	}

	onSelectDevice(event: MatAutocompleteSelectedEvent): void {
		this.deviceSelectionChip.push(event.option.value);

		this.deviceInput.nativeElement.value = "";

		this.chipList.errorState =
			this.deviceSelectionChip.length === 0 ||
			this.deviceSelectionChip.length > this.MAX_DEVICES;

		if (this.chipList.errorState) {
			this.devicesFormGroup.controls.devicesCtrl.setValue(null);
		} else {
			this.devicesFormGroup.controls.devicesCtrl.setValue(
				this.deviceSelectionChip
			);
		}
	}
	onSubmitScan() {
		if (this.devicesFormGroup.invalid) {
			return;
		}

		// Scan Request body
		let body = this.buildScanRequest();

		// Open Websocket for log stream
		const wsURL = `${environment.vscanWebSocketURL}/jobs/ws?token=${this.currentUserToken}&logFileRequestHash=${this.hash}`;

		this.webSocketSubject = webSocket({
			url: wsURL,
			deserializer: ({ data }) => data
		});

		// Launch Scan
		this.vscan
			.launchInventoryScan(body)
			.pipe(
				tap(() => {
					this.barButtonOptions.active = false;
					this.barButtonOptions.text = "View Results";
				}),

				catchError(err => {
					this.toastNotif.errorToastNotif(err, "Scan Job failed");
					this.barButtonOptions.active = false;
					this.barButtonOptions.disabled = true;
					this.barButtonOptions.text = "No Results";
					return of(err);
				})
			)
			.subscribe(res => {
				console.log(res);
				this.toastNotif.successToastNotif(
					`Scan Job ${res["results"]["scanJobID"]} successfully executed.`,
					"Scan Job" + " Completed"
				);
			});
	}

	buildScanRequest(): InventoryScanRequest {
		let osType = this.devicesFormGroup.get("osTypeCtrl").value;
		let devices = this.devicesFormGroup.get("devicesCtrl").value;
		let sshgw = this.devicesFormGroup.get("sshGatewayCtrl").value;
		let creds = this.devicesFormGroup.get("credentialsCtrl").value;

		let devicesObjArray = [];
		devices.forEach(item => {
			devicesObjArray.push({ deviceID: item });
		});
		const requestObj = {
			devices: devicesObjArray,
			osType: osType,
			credentialsName: creds,
			sshGateway: sshgw,
			logStreamHashReq: this.hash
		};
		// Remove Object key if null or empty
		Object.keys(requestObj).forEach(
			key => (requestObj[key] === "" || null) && delete requestObj[key]
		);

		return requestObj;
	}
}
