import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DeviceCredential } from "../../../../core/vscan-api/device.credentials.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

const sshPrivateKeyPattern = "-{3,}BEGIN.*\\n([\\s\\S]{400,}?)\\n-{3,}END.*";

@Component({
	selector: "vscan-device-creds-edit",
	templateUrl: "./device-creds-edit.component.html",
	styleUrls: ["./device-creds-edit.component.scss"]
})
export class DeviceCredsEditComponent implements OnInit {
	credential: DeviceCredential;
	credentialForm: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<DeviceCredsEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder
	) {}

	ngOnInit() {
		this.credential = this.data.credObj;
		this.createForm();
	}

	createForm() {
		this.credentialForm = this.fb.group({
			credentialName: [
				{
					value: this.credential.credentialsName,
					disabled: this.credential.credentialsName !== ""
				},

				Validators.compose([
					Validators.required,
					Validators.minLength(5),
					Validators.maxLength(30)
				])
			],
			credentialsDeviceVendor: [
				{
					value: this.credential.credentialsDeviceVendor,
					disabled: this.credential.credentialsDeviceVendor !== ""
				},

				Validators.required
			],
			username: [this.credential.username, Validators.required],
			password: [this.credential.password],
			iosEnablePassword: [this.credential.iosEnablePassword],
			privateKey: [
				this.credential.privateKey,
				Validators.pattern(sshPrivateKeyPattern)
			]
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.credential.credentialsName !== "") {
			return `Edit credential ${this.credential.credentialsName}`;
		}

		return "New Device Credential";
	}

	onCloseCancelDialog() {
		this.dialogRef.close(false);
	}
	displayCredentialNameError(): string {
		if (this.credentialForm.get("credentialName").hasError("required")) {
			return "Please enter credential name";
		} else if (
			this.credentialForm.get("credentialName").hasError("minlength")
		) {
			return "A minimum of 5 characters are required";
		} else if (
			this.credentialForm.get("credentialName").hasError("maxlength")
		) {
			return "A maximum of 30 characters are allowed";
		}
	}
}
