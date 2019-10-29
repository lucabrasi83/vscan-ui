import {
	Component,
	Inject,
	OnInit,
	TemplateRef,
	ViewChild
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
	EnterpriseSSHGateway,
	SSHGatewayCreate,
	SSHGatewayTestResult
} from "../../../../core/vscan-api/ssh.gateway.model";
import { VscanApiService } from "../../../../core/vscan-api/vscan-api.service";
import { catchError, tap } from "rxjs/operators";
import { throwError } from "rxjs";
import { ToastNotifService } from "../../../../core/_base/layout/services/toast-notif.service";

const sshPrivateKeyPattern = "-{3,}BEGIN.*\\n([\\s\\S]{400,}?)\\n-{3,}END.*";

const ipaddressPattern =
	"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";

@Component({
	selector: "vscan-ssh-gw-edit",
	templateUrl: "./ssh-gw-edit.component.html",
	styleUrls: ["./ssh-gw-edit.component.scss"]
})
export class SshGwEditComponent implements OnInit {
	sshGateway: EnterpriseSSHGateway;
	sshGatewayForm: FormGroup;

	isSSHTestOngoing: boolean = false;

	closeAlert: boolean = false;

	sshGatewayTestResults: SSHGatewayTestResult;

	constructor(
		public dialogRef: MatDialogRef<SshGwEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private vscan: VscanApiService,
		private toastNotif: ToastNotifService
	) {}

	ngOnInit() {
		this.sshGateway = this.data.credObj;
		this.createForm();
	}

	createForm() {
		this.sshGatewayForm = this.fb.group({
			gatewayName: [
				{
					value: this.sshGateway.gatewayName,
					disabled: this.sshGateway.gatewayName !== ""
				},

				Validators.compose([
					Validators.required,
					Validators.minLength(5),
					Validators.maxLength(30)
				])
			],
			gatewayIP: [
				this.sshGateway.gatewayIP,
				Validators.compose([
					Validators.pattern(ipaddressPattern),
					Validators.required
				])
			],
			gatewayUsername: [
				this.sshGateway.gatewayUsername,
				Validators.required
			],
			gatewayPassword: [this.sshGateway.gatewayPassword],
			gatewayPrivateKey: [
				this.sshGateway.gatewayPrivateKey,
				Validators.pattern(sshPrivateKeyPattern)
			]
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.sshGateway.gatewayName !== "") {
			return `Edit SSH Gateway ${this.sshGateway.gatewayName}`;
		}

		return "New SSH Gateway";
	}

	onCloseCancelDialog() {
		this.dialogRef.close(false);
	}

	displaySSHGatewayNameError(): string {
		if (this.sshGatewayForm.get("gatewayName").hasError("required")) {
			return "Please enter SSH Gateway name";
		} else if (
			this.sshGatewayForm.get("gatewayName").hasError("minlength")
		) {
			return "A minimum of 5 characters are required";
		} else if (
			this.sshGatewayForm.get("gatewayName").hasError("maxlength")
		) {
			return "A maximum of 30 characters are allowed";
		}
	}
	sshGatewayTest() {
		this.isSSHTestOngoing = true;

		let formValues = this.sshGatewayForm.getRawValue();

		let body: SSHGatewayCreate = {
			gatewayName: formValues.gatewayName,
			gatewayIP: formValues.gatewayIP,
			gatewayUsername: formValues.gatewayUsername,
			gatewayPassword: formValues.gatewayPassword,
			gatewayPrivateKey: formValues.gatewayPrivateKey
		};

		this.vscan
			.connectivityTestSSHGateway(body)
			.pipe(
				tap((res: SSHGatewayTestResult) => {
					this.isSSHTestOngoing = false;

					this.sshGatewayTestResults = res;
					this.closeAlert = false;
				}),
				catchError(err => {
					this.toastNotif.errorToastNotif(
						err,
						`SSH Gateway Test Failure`
					);
					this.isSSHTestOngoing = false;
					return throwError(err);
				})
			)
			.subscribe();
	}

	onCloseAlert() {
		this.closeAlert = true;
	}
}
