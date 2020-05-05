import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	Validators
} from "@angular/forms";
import { VscanApiService } from "../../../../../core/vscan-api/vscan-api.service";
import {
	HIDDEN_PASSWORD,
	ROOT_ROLE,
	ROOT_USER,
	USER_ROLE,
	VscanUsers
} from "../../../../../core/vscan-api/users.model";
import { VscanEnterprise } from "../../../../../core/vscan-api/enterprises.model";
import { catchError, tap } from "rxjs/operators";
import { throwError } from "rxjs";
import { ToastNotifService } from "../../../../../core/_base/layout/services/toast-notif.service";
import { AuthService } from "../../../../../core/auth/_services";

const passwordComplexityPatter =
	'^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@~`"#$%^&*(){},<>?:;])[A-Za-z\\d!@~`"#$%^&*(){},<>?:;]{10,20}$';

function passwordMatcher(
	c: AbstractControl
): { [key: string]: boolean } | null {
	const passwordControl = c.get("password");
	const passwordConfirmControl = c.get("confirmPassword");

	let currentErrorsPassword = passwordControl.errors;
	let currentErrorsConfirm = passwordConfirmControl.errors;

	if (passwordControl.pristine && passwordConfirmControl.pristine) {
		return null;
	}
	if (passwordControl.value === passwordConfirmControl.value) {
		if (passwordControl.hasError("match")) {
			delete currentErrorsPassword["match"];
		}

		if (passwordConfirmControl.hasError("match")) {
			delete currentErrorsConfirm["match"];
		}

		if (currentErrorsPassword) {
			Object.keys(currentErrorsPassword).length > 0
				? passwordControl.setErrors(currentErrorsPassword)
				: passwordControl.setErrors(null);
		}
		if (currentErrorsConfirm) {
			Object.keys(currentErrorsConfirm).length > 0
				? passwordConfirmControl.setErrors(currentErrorsConfirm)
				: passwordConfirmControl.setErrors(null);
		}

		return null;
	}
	currentErrorsPassword
		? (currentErrorsPassword.match = true)
		: (currentErrorsPassword = { match: true });
	currentErrorsConfirm
		? (currentErrorsConfirm.match = true)
		: (currentErrorsConfirm = { match: true });

	passwordControl.setErrors(currentErrorsPassword);
	passwordConfirmControl.setErrors(currentErrorsConfirm);
	return { match: true };
}

@Component({
	selector: "vscan-edit-users",
	templateUrl: "./edit-users.component.html",
	styleUrls: ["./edit-users.component.scss"]
})
export class EditUsersComponent implements OnInit {
	vscanUser: VscanUsers;
	userForm: FormGroup;

	vscanEnterprises: VscanEnterprise[] = [];

	hiddenPassword: string = HIDDEN_PASSWORD;

	currentUserEmail: string = "";

	rootRole = ROOT_ROLE;
	userRole = USER_ROLE;

	constructor(
		public dialogRef: MatDialogRef<EditUsersComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private vscan: VscanApiService,
		private toastNotif: ToastNotifService,
		private auth: AuthService
	) {}

	ngOnInit() {
		this.vscanUser = this.data.userObj;
		this.currentUserEmail = this.auth.getUserTokenField("email");
		this.createForm();

		this.vscan
			.getAllEnterprises()
			.pipe(
				tap(res => {
					this.vscanEnterprises = res.enterprises;
				}),
				catchError(err => {
					this.toastNotif.errorToastNotif(
						err,
						"Failed to fetch enterprises"
					);
					return throwError(err);
				})
			)
			.subscribe();
	}
	createForm() {
		this.userForm = this.fb.group({
			userEmail: [
				{
					value: this.vscanUser.email,
					disabled: this.vscanUser.email !== ""
				},

				Validators.compose([
					Validators.required,
					Validators.email,
					Validators.maxLength(80)
				])
			],
			passwordGroup: this.fb.group(
				{
					password: [
						{
							value:
								this.vscanUser.email !== ""
									? this.hiddenPassword
									: "",
							disabled:
								this.vscanUser.email === ROOT_USER &&
								this.currentUserEmail !== ROOT_USER
						},

						[
							Validators.required,
							Validators.minLength(10),
							Validators.maxLength(20),
							Validators.pattern(passwordComplexityPatter)
						]
					],
					confirmPassword: [
						{
							value:
								this.vscanUser.email !== ""
									? this.hiddenPassword
									: "",
							disabled:
								this.vscanUser.email === ROOT_USER &&
								this.currentUserEmail !== ROOT_USER
						},

						[
							Validators.required,
							Validators.minLength(10),
							Validators.maxLength(20),
							Validators.pattern(passwordComplexityPatter)
						]
					]
				},
				{ validators: passwordMatcher }
			),

			firstName: [
				{
					value: this.vscanUser.firstName,
					disabled: this.vscanUser.email === ROOT_USER
				},
				Validators.compose([
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(30),
					Validators.pattern("^[a-zA-Z]+$")
				])
			],
			lastName: [
				{
					value: this.vscanUser.lastName,
					disabled: this.vscanUser.email === ROOT_USER
				},
				Validators.compose([
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(30),
					Validators.pattern("^[a-zA-Z]+$")
				])
			],
			middleName: [
				{
					value: this.vscanUser.middleName,
					disabled: this.vscanUser.email === ROOT_USER
				},
				Validators.compose([
					Validators.minLength(3),
					Validators.maxLength(30),
					Validators.pattern("^[a-zA-Z ]*$")
				])
			],
			role: [
				{
					value: this.vscanUser.role,
					disabled: this.vscanUser.email === ROOT_USER
				},
				Validators.required
			],
			enterpriseID: [
				{
					value: this.vscanUser.enterpriseID,
					disabled: this.vscanUser.email === ROOT_USER
				},
				Validators.required
			]
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.vscanUser.email !== "") {
			return `Edit User ${this.vscanUser.email}`;
		}

		return "New User";
	}

	onCloseCancelDialog() {
		this.dialogRef.close(false);
	}
	passwordValidationErrorMsg(control: AbstractControl): string {
		if (control.hasError("required")) {
			return "Password is required";
		}
		if (control.hasError("minlength") || control.hasError("maxlength")) {
			return "Password length must be between 10 and 20 characters";
		}

		if (control.hasError("pattern")) {
			return "Password does not meet complexity requirements";
		}

		if (control.hasError("match")) {
			return "Passwords not matching";
		}
	}
}
