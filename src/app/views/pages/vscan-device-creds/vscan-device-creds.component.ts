import {
	AfterViewInit,
	Component,
	OnInit,
	TemplateRef,
	ViewChild
} from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, throwError } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import {
	DeviceCredential,
	DeviceCredentialsCreate,
	DeviceCredentialsUpdate
} from "../../../core/vscan-api/device.credentials.model";
import { VscanApiService } from "../../../core/vscan-api/vscan-api.service";
import { ToastNotifService } from "../../../core/_base/layout/services/toast-notif.service";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { catchError, switchMap, tap } from "rxjs/operators";
import { LayoutUtilsService } from "../../../core/_base/crud";
import { DeviceCredsEditComponent } from "./device-creds-edit/device-creds-edit.component";

@Component({
	selector: "vscan-vscan-device-creds",
	templateUrl: "./vscan-device-creds.component.html",
	styleUrls: ["./vscan-device-creds.component.scss"]
})
export class VscanDeviceCredsComponent implements OnInit, AfterViewInit {
	// Table fields
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	displayedColumns = [
		"select",
		"credentialsName",
		"credentialsDeviceVendor",
		"username",
		"password",
		"iosEnablePassword",
		"privateKey",
		"actions"
	];

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;

	credentialsResults: DeviceCredential[] = [];

	// Selection
	selection = new SelectionModel<DeviceCredential>(true, []);

	// Loading flag
	loading$ = new BehaviorSubject<boolean>(true);

	// Credentials Data
	userCredentials$ = new BehaviorSubject<DeviceCredential>(null);

	dataSource = new MatTableDataSource<DeviceCredential>();

	constructor(
		private vscanAPI: VscanApiService,
		private toastNotif: ToastNotifService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService
	) {}

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		this.userCredentials$
			.pipe(
				switchMap(() => {
					return this.vscanAPI.getAllUserDeviceCredentials().pipe(
						tap(res => {
							this.dataSource.data = res.deviceCredentials;
							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								"Failed to fetch credentials"
							);
							this.loading$.next(false);
							return throwError(err);
						})
					);
				})
			)
			.subscribe();
	}

	ngAfterViewInit() {
		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;
	}
	/**
	 * Check all rows are selected
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.credentialsResults.length;
		return numSelected === numRows;
	}

	/**
	 * Toggle all selections
	 */
	masterToggle() {
		if (
			this.selection.selected.length ===
			this.dataSource.filteredData.length
		) {
			this.selection.clear();
		} else {
			this.dataSource.filteredData.forEach(row =>
				this.selection.select(row)
			);
		}
	}

	// Text Filter Search
	public doFilterText = (value: string) => {
		this.dataSource.filter = value;
		this.selection.clear();
	};

	// Add new credential
	onAddNewCredential() {
		const newCredential = new DeviceCredential();
		newCredential.clear(); // Set all defaults fields
		this.onEditCredential(newCredential, true);
	}

	// Edit credential
	onEditCredential(cred: DeviceCredential, create: boolean) {
		const dialogRef = this.dialog.open(DeviceCredsEditComponent, {
			data: { credObj: cred },
			height: "auto",
			width: "60%",
			autoFocus: false
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			if (res) {
				this.loading$.next(true);

				let body = this.buildBodyRequest(res);

				if (create) {
					this.vscanAPI
						.createDeviceCredentials(body)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully created credentials: " +
										body.credentialsName,
									`Credentials Creation Success`
								);

								// Refresh HTTP Request Observable
								this.userCredentials$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`Credentials Creation Failure`
								);
								this.loading$.next(false);
								return throwError(err);
							})
						)
						.subscribe();
				} else {
					this.vscanAPI
						.updateDeviceCredentials(body)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully updated credentials: " +
										body.credentialsName,
									`Credentials update success`
								);

								// Refresh HTTP Request Observable
								this.userCredentials$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`Credentials Update Failure`
								);
								this.loading$.next(false);
								return throwError(err);
							})
						)
						.subscribe();
				}
			}
		});
	}

	// Delete Individual Credential
	deleteDeviceCredential(creds: DeviceCredential) {
		const dialogRef = this.layoutUtilsService.deleteElement(
			"Credentials Deletion",
			"Confirm you want to delete the following credential(s): ",
			creds.credentialsName
		);

		let credsArray: string[] = [];

		credsArray.push(creds.credentialsName);

		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (res) {
				this.loading$.next(true);

				this.vscanAPI
					.deleteDeviceCredentials(credsArray)
					.pipe(
						tap(() => {
							this.toastNotif.successToastNotif(
								"Successfully deleted credentials:\n" +
									creds.credentialsName,
								`Credentials Deletion Success`
							);

							// Refresh HTTP Request Observable
							this.userCredentials$.next(null);

							this.selection.clear();

							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								`Credentials Deletion Failure`
							);
							this.loading$.next(false);
							return throwError(err);
						})
					)
					.subscribe();
			}
		});
	}

	// Delete Multiple Credentials
	bulkDeleteDeviceCredential() {
		let selectedCreds: string[] = [];

		this.selection.selected.forEach(item => {
			selectedCreds.push(item.credentialsName);
		});

		const dialogRef = this.layoutUtilsService.deleteElement(
			"Credentials Deletion",
			"Confirm you want to delete the following credential(s): ",
			selectedCreds.join("\n")
		);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (res) {
				this.loading$.next(true);

				this.vscanAPI
					.deleteDeviceCredentials(selectedCreds)
					.pipe(
						tap(() => {
							this.toastNotif.successToastNotif(
								"Successfully deleted credentials:\n" +
									selectedCreds.join("\n"),
								`Credentials Deletion Success`
							);

							// Refresh HTTP Request Observable
							this.userCredentials$.next(null);

							this.selection.clear();

							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								`Credentials Deletion Failure`
							);
							this.loading$.next(false);
							return throwError(err);
						})
					)
					.subscribe();
			}
		});
	}

	buildBodyRequest(
		formInputs: any
	): DeviceCredentialsCreate | DeviceCredentialsUpdate {
		const requestObj: DeviceCredentialsCreate | DeviceCredentialsUpdate = {
			credentialsName: formInputs.credentialName.toUpperCase().trim(),
			credentialsDeviceVendor: formInputs.credentialsDeviceVendor,
			username: formInputs.username.trim(),
			password: formInputs.password.trim(),
			iosEnablePassword: formInputs.iosEnablePassword.trim(),
			privateKey: formInputs.privateKey
		};
		// Remove Object key if null or empty
		Object.keys(requestObj).forEach(
			key => (requestObj[key] === "" || null) && delete requestObj[key]
		);

		return requestObj;
	}
}
