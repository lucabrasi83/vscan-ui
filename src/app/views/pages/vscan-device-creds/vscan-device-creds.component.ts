import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, throwError } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import { DeviceCredential } from "../../../core/vscan-api/device.credentials.model";
import { VscanApiService } from "../../../core/vscan-api/vscan-api.service";
import { ToastNotifService } from "../../../core/_base/layout/services/toast-notif.service";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { catchError, switchMap, tap } from "rxjs/operators";

@Component({
	selector: "vscan-vscan-device-creds",
	templateUrl: "./vscan-device-creds.component.html",
	styleUrls: ["./vscan-device-creds.component.scss"]
})
export class VscanDeviceCredsComponent implements OnInit {
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
		"privateKey"
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
		public dialog: MatDialog
	) {}

	ngOnInit() {
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

	deleteDeviceCredential() {
		this.loading$.next(true);

		this.selection.selected.forEach(item => {
			this.vscanAPI
				.deleteDeviceCredentials(item.credentialsName)
				.pipe(
					tap(() => {
						this.toastNotif.successToastNotif(
							"Successfully deleted credential",
							`Credential ${item.credentialsName} deletion success`
						);

						// Refresh HTTP Request Observable
						this.userCredentials$.next(null);

						this.selection.clear();

						this.loading$.next(false);
					}),
					catchError(err => {
						this.toastNotif.errorToastNotif(
							err,
							`Credential ${item.credentialsName} deletion failed`
						);
						this.loading$.next(false);
						return throwError(err);
					})
				)
				.subscribe();
		});
	}
}
