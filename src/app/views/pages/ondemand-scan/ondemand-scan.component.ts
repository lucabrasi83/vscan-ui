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
import { catchError, tap } from "rxjs/operators";
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
	deviceItems: FormArray;

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

	scanResults: OndemandScanResultsModel;

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
			deviceDetails: this._formBuilder.array([
				this.buildDeviceDetailsForm()
			])
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
		this.deviceItems = this.deviceDetailsFormGroup.get(
			"deviceDetails"
		) as FormArray;

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

		let mapIP = new Map<string, number>();

		let hasDuplicate = false;

		// Warn about duplicate IP's in form
		this.deviceItems.controls.forEach(ctrl => {
			if (mapIP[ctrl.value.ipAddressCtrl] === 0) {
				this.toastNotif.warningToastNotif(
					"You have entered duplicate IP's in the form fields",
					"Duplicate IP's"
				);
				hasDuplicate = true;
			}

			mapIP[ctrl.value.ipAddressCtrl] = 0;
		});

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
		if (this.deviceDetailsFormGroup.invalid) {
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
			.launchOnDemandScan(body)
			.pipe(
				tap((res: OndemandScanResultsModel) => {
					this.barButtonOptions.active = false;
					this.barButtonOptions.text = "View Results";

					this.toastNotif.successToastNotif(
						`Scan Job ${res["results"]["scanJobID"]} successfully executed.`,
						"Scan Job Completed"
					);

					this.scanResults = res;

					this.deviceDetailsFormGroup.markAsUntouched();
					this.logStreamFormGroup.markAsUntouched();
					this.scanSettingDetailsFormGroup.markAsUntouched();
				}),

				catchError(err => {
					this.toastNotif.errorToastNotif(err, "Scan Job failed");
					this.barButtonOptions.active = false;
					this.barButtonOptions.disabled = true;
					this.barButtonOptions.text = "No Results";

					this.deviceDetailsFormGroup.markAsUntouched();
					this.scanSettingDetailsFormGroup.markAsUntouched();

					this.logStreamFormGroup
						.get("logStreamCtrl")
						.setErrors({ incorrect: true });
					return of(err);
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
				hostname: item.hostnameCtrl
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

		this.barButtonOptions = {
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
}
