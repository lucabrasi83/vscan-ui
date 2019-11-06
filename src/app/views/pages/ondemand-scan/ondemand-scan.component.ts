import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild
} from "@angular/core";
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	FormGroupDirective,
	NgForm,
	Validators
} from "@angular/forms";
import { VscanSupportedOS } from "../../../core/vscan-api/supported.os.model";
import { forkJoin, of, throwError } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { VscanApiService } from "../../../core/vscan-api/vscan-api.service";
import { ToastNotifService } from "../../../core/_base/layout/services/toast-notif.service";
import { DeviceCredential } from "../../../core/vscan-api/device.credentials.model";
import { EnterpriseSSHGateway } from "../../../core/vscan-api/ssh.gateway.model";
import { MAX_DEVICES } from "../vscan-devices/vscan-scan/vscan-scan.component";
import { WebSocketSubject } from "rxjs/internal-compatibility";
import { Md5 } from "ts-md5";
import { AuthService } from "../../../core/auth/_services";
import { ClipboardService } from "ngx-clipboard";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { environment } from "../../../../environments/environment";
import { webSocket } from "rxjs/webSocket";
import { InventoryScanRequest } from "../../../core/vscan-api/inventory.scan.model";
import { OndemandScanResultsModel } from "../../../core/vscan-api/ondemand.scan.results.model";
import { MatStepper } from "@angular/material/stepper";
import { ErrorStateMatcher } from "@angular/material/core";

const ipaddressPattern =
	"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";

function duplicateHostnameValidator(
	control: FormArray
): { [key: string]: boolean } | null {
	const hostnameArray = control.value.map(item => item.hostnameCtrl);

	const duplicateHostnames = hostnameArray.filter((item, index) => {
		return hostnameArray.indexOf(item) !== index && item !== null;
	});

	let hasDuplicate = duplicateHostnames.length > 0;

	// If we found duplicate, mark each form control in the array as errored
	if (hasDuplicate) {
		for (let i = 0; i <= hostnameArray.length; i++) {
			if (duplicateHostnames[0] == hostnameArray[i]) {
				control.controls[i]
					.get("hostnameCtrl")
					.setErrors({ hasDuplicate: true });
			}
		}
	} else {
		// Loop the Form Array controls to dynamically clear the errors if no duplicate and other validation errors
		// found.
		for (let i = 0; i <= hostnameArray.length; i++) {
			if (
				control.controls[i] &&
				!control.controls[i].get("hostnameCtrl").hasError("required") &&
				!control.controls[i]
					.get("hostnameCtrl")
					.hasError("minLength") &&
				!control.controls[i].get("hostnameCtrl").hasError("maxLength")
			) {
				control.controls[i].get("hostnameCtrl").setErrors(null);
			}
		}
	}

	return hasDuplicate ? { hasDuplicate: true } : null;
}

// Check for duplicate IP's in form
function duplicateIPValidator(
	control: FormArray
): { [key: string]: boolean } | null {
	const ipAddrArray = control.value.map(item => item.ipAddressCtrl);

	const duplicateIPs = ipAddrArray.filter((item, index) => {
		return ipAddrArray.indexOf(item) !== index && item !== null;
	});

	let hasDuplicate = duplicateIPs.length > 0;

	// If we found duplicate, mark each form control in the array as errored
	if (hasDuplicate) {
		for (let i = 0; i <= ipAddrArray.length; i++) {
			if (duplicateIPs[0] == ipAddrArray[i]) {
				control.controls[i]
					.get("ipAddressCtrl")
					.setErrors({ hasDuplicate: true });
			}
		}
	} else {
		// Loop the Form Array controls to dynamically clear the errors if no duplicate and other validation errors
		// found.
		for (let i = 0; i <= ipAddrArray.length; i++) {
			if (
				control.controls[i] &&
				!control.controls[i]
					.get("ipAddressCtrl")
					.hasError("required") &&
				!control.controls[i].get("ipAddressCtrl").hasError("pattern")
			) {
				control.controls[i].get("ipAddressCtrl").setErrors(null);
			}
		}
	}

	return hasDuplicate ? { hasDuplicate: true } : null;
}

// define custom ErrorStateMatcher
export class CustomErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(
		control: FormControl,
		form: NgForm | FormGroupDirective | null
	) {
		return control && control.invalid && control.touched;
	}
}

@Component({
	selector: "vscan-ondemand-scan",
	templateUrl: "./ondemand-scan.component.html",
	styleUrls: ["./ondemand-scan.component.scss"]
})
export class OndemandScanComponent implements OnInit, OnDestroy {
	deviceDetailsFormGroup: FormGroup;
	scanSettingDetailsFormGroup: FormGroup;
	logStreamFormGroup: FormGroup;
	// deviceItems: FormArray;

	// Unique Hash to generate for log file stream request
	hash: string | Int32Array = this.generateLogStreamHash();

	// create instance of custom ErrorStateMatcher
	errorMatcher = new CustomErrorStateMatcher();

	// Initialize JWT Token from NGRX Store
	currentUserToken: string = "";

	// Declare Websocket Subject
	webSocketSubject: WebSocketSubject<any>;

	// Supported OS for OVAL scans
	supportedOS = VscanSupportedOS;

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;
	loadingDialog = true;

	// User Device Credentials
	userDeviceCredentials: DeviceCredential[] = [];

	// Enterprise SSH Gateway
	enterpriseSSHGateway: EnterpriseSSHGateway[] = [];

	// Log Stream View
	@ViewChild("logStreamContent", { static: false })
	logStreamContent: ElementRef;

	// Mat Stepper
	@ViewChild("stepper", { static: false }) stepper: MatStepper;

	// Progress Button options during scan request
	barButtonOptions: MatProgressButtonOptions = {
		active: true,
		text: "Scanning...",
		buttonColor: "accent",
		barColor: "accent",
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

	scanResults: OndemandScanResultsModel;

	isScanning: boolean = true;

	constructor(
		private _formBuilder: FormBuilder,
		private vscan: VscanApiService,
		private toastNotif: ToastNotifService,
		private auth: AuthService,
		private _clipboardService: ClipboardService,
		private _snackBar: MatSnackBar
	) {}

	ngOnInit() {
		this.deviceDetailsFormGroup = this._formBuilder.group({
			deviceDetails: this._formBuilder.array(
				[this.buildDeviceDetailsForm()],
				[duplicateIPValidator, duplicateHostnameValidator]
			)
		});
		this.scanSettingDetailsFormGroup = this._formBuilder.group({
			osTypeCtrl: ["", Validators.required],
			credentialsCtrl: ["", Validators.required],
			sshGatewayCtrl: [""]
		});

		this.logStreamFormGroup = this._formBuilder.group({
			logStreamCtrl: [""]
		});

		// Fetch SSH Gateway and Credential in parallel from VSCAN API
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

		// Get Current JWT Token from NGRX Store
		this.currentUserToken = this.auth.getStoreToken();
	}

	// FormArray getter
	get deviceItems(): FormArray {
		if (this.deviceDetailsFormGroup) {
			return this.deviceDetailsFormGroup.get(
				"deviceDetails"
			) as FormArray;
		}
	}
	ngOnDestroy(): void {
		if (this.webSocketSubject) {
			this.webSocketSubject.next(null);
			this.webSocketSubject.unsubscribe();
		}
	}

	buildDeviceDetailsForm(): FormGroup {
		return this._formBuilder.group({
			ipAddressCtrl: [
				"",
				[Validators.pattern(ipaddressPattern), Validators.required]
			],
			hostnameCtrl: [
				"",
				[
					Validators.required,
					Validators.maxLength(30),
					Validators.minLength(5)
				]
			]
		});
	}

	addNewDevice() {
		if (this.deviceItems.length > MAX_DEVICES) {
			this.toastNotif.errorToastNotif(
				`A maximum of ${MAX_DEVICES} devices can be selected for a single job scan`,
				"Too many devices selected"
			);
			return;
		}

		if (this.deviceDetailsFormGroup.invalid) {
			return;
		}

		let hasDuplicate = this.checkDuplicateIP();

		if (hasDuplicate) {
			this.deviceDetailsFormGroup.get("deviceDetails").clearValidators();
			return;
		}

		this.deviceItems.push(this.buildDeviceDetailsForm());
	}

	removeDevice() {
		this.deviceItems.removeAt(this.deviceItems.length - 1);
	}

	private generateLogStreamHash(): string | Int32Array {
		// Generate Hash based on user email and current date/time
		return Md5.hashStr(
			this.auth.getUserTokenField("email") + Date.now().toLocaleString()
		);
	}

	onSubmitScan() {
		if (this.scanSettingDetailsFormGroup.invalid) {
			this.scanSettingDetailsFormGroup.markAllAsTouched();
			this.barButtonOptions.active = false;
			return;
		}

		// Mark Form controls as invalid if empty
		if (
			this.scanSettingDetailsFormGroup.get("osTypeCtrl").value === "" ||
			this.scanSettingDetailsFormGroup.get("credentialsCtrl").value === ""
		) {
			this.scanSettingDetailsFormGroup.markAllAsTouched();
			this.barButtonOptions.active = false;
			return;
		}

		// Scan Request body
		let body = this.buildScanRequest();

		// Open Websocket for log stream
		const wsURL = `${environment.vscanWebSocketURL}/jobs/ws?token=${this.currentUserToken}&logFileRequestHash=${this.hash}`;

		this.webSocketSubject = webSocket({
			url: wsURL,
			deserializer: ({ data }) => data,
			binaryType: "arraybuffer"
		});

		setTimeout(() => {
			console.log("receiving logs");
		}, 2000);

		// Launch Scan
		this.vscan
			.launchOnDemandScan(body)
			.pipe(
				tap((res: OndemandScanResultsModel) => {
					this.toastNotif.successToastNotif(
						`Scan Job ${res["results"]["scanJobID"]} successfully executed.`,
						"Scan Job Completed"
					);

					this.scanResults = res;

					this.deviceDetailsFormGroup.markAsUntouched();
					this.logStreamFormGroup.markAsUntouched();
					this.scanSettingDetailsFormGroup.markAsUntouched();

					this.barButtonOptions.active = false;
					this.barButtonOptions.text = "View Results";

					this.isScanning = false;
				}),

				catchError(err => {
					this.toastNotif.errorToastNotif(err, "Scan Job failed");

					this.deviceDetailsFormGroup.markAsUntouched();
					this.scanSettingDetailsFormGroup.markAsUntouched();

					this.logStreamFormGroup
						.get("logStreamCtrl")
						.setErrors({ incorrect: true });

					this.barButtonOptions.active = false;
					this.barButtonOptions.disabled = true;
					this.barButtonOptions.text = "No Results";

					this.isScanning = false;
					return of(err);
				}),
				finalize(() => {
					this.isScanning = false;
				})
			)
			.subscribe();
	}

	buildScanRequest(): InventoryScanRequest {
		let osType = this.scanSettingDetailsFormGroup.get("osTypeCtrl").value;
		let devices = this.deviceDetailsFormGroup.get("deviceDetails").value;
		let sshgw = this.scanSettingDetailsFormGroup.get("sshGatewayCtrl")
			.value;
		let creds = this.scanSettingDetailsFormGroup.get("credentialsCtrl")
			.value;

		let devicesObjArray: any[] = [];

		devices.forEach(item => {
			devicesObjArray.push({
				ip: item.ipAddressCtrl,
				hostname: item.hostnameCtrl.trim()
			});
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

	onCopyLogContent() {
		this._clipboardService.copyFromContent(
			this.logStreamContent.nativeElement.textContent
		);
		this._snackBar.open("Logs copied to clipboard", "Dismiss", {
			duration: 3000
		});
	}
	onStepperReset() {
		this.stepper.reset();

		this.deviceItems.controls.splice(
			1,
			this.deviceItems.controls.length - 1
		);

		this.webSocketSubject.next(null);

		this.barButtonOptions = {
			active: true,
			text: "Scanning...",
			buttonColor: "accent",
			barColor: "accent",
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

		this.hash = this.generateLogStreamHash();
	}

	onValidateDeviceForm() {
		let devices = this.deviceDetailsFormGroup.get("deviceDetails").value;

		let foundEmpty = false;
		devices.forEach(item => {
			if (item.ipAddressCtrl === "" || item.hostname === "") {
				foundEmpty = true;
			}
		});

		if (foundEmpty) {
			this.deviceDetailsFormGroup.get("deviceDetails").markAllAsTouched();
			this.deviceDetailsFormGroup.markAllAsTouched();
		}

		this.stepper.next();
	}

	checkDuplicateIP(): boolean {
		let mapIP = new Map<string, number>();

		let hasDuplicate = false;

		// Warn about duplicate IP's in form
		this.deviceItems.controls.forEach(ctrl => {
			if (mapIP[ctrl.value.ipAddressCtrl] === 1) {
				this.toastNotif.warningToastNotif(
					"You have entered duplicate IP's in the form fields",
					"Duplicate IP's"
				);
				hasDuplicate = true;
			}

			mapIP[ctrl.value.ipAddressCtrl] = 1;
		});

		return hasDuplicate;
	}
}
