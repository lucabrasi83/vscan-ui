import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastNotifService } from "../../../../../core/_base/layout/services/toast-notif.service";
import { VscanEnterprise } from "../../../../../core/vscan-api/enterprises.model";

@Component({
	selector: "vscan-edit-enterprise",
	templateUrl: "./edit-enterprise.component.html",
	styleUrls: ["./edit-enterprise.component.scss"]
})
export class EditEnterpriseComponent implements OnInit {
	vscanEnterprise: VscanEnterprise;
	enterpriseForm: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<EditEnterpriseComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private toastNotif: ToastNotifService
	) {}

	ngOnInit() {
		this.vscanEnterprise = this.data.entObj;
		this.createForm();
	}

	createForm() {
		this.enterpriseForm = this.fb.group({
			enterpriseID: [
				{
					value: this.vscanEnterprise.enterpriseID,
					disabled: this.vscanEnterprise.enterpriseID !== ""
				},

				Validators.compose([
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(3),
					Validators.pattern("^[a-zA-Z]+$")
				])
			],
			enterpriseName: [
				this.vscanEnterprise.enterpriseName,

				Validators.compose([
					Validators.required,
					Validators.minLength(5),
					Validators.maxLength(40),
					Validators.pattern("^[a-zA-Z0-9_-\\s]*$")
				])
			]
		});
	}
	getTitle(): string {
		if (this.vscanEnterprise.enterpriseID !== "") {
			return `Edit Enterprise ${this.vscanEnterprise.enterpriseID}`;
		}

		return "New Enterprise";
	}

	onCloseCancelDialog() {
		this.dialogRef.close(false);
	}
}
