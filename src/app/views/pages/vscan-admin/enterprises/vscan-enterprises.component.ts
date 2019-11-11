import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import {
	EnterpriseCreate,
	EnterpriseUpdate,
	VscanEnterprise
} from "../../../../core/vscan-api/enterprises.model";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
import { catchError, switchMap, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from "rxjs";
import {
	UserCreate,
	UserUpdate,
	VscanUsers
} from "../../../../core/vscan-api/users.model";
import { VscanApiService } from "../../../../core/vscan-api/vscan-api.service";
import { ToastNotifService } from "../../../../core/_base/layout/services/toast-notif.service";
import { MatDialog } from "@angular/material/dialog";
import { LayoutUtilsService } from "../../../../core/_base/crud";
import { EditEnterpriseComponent } from "./edit-enterprise/edit-enterprise.component";

@Component({
	selector: "vscan-enterprises",
	templateUrl: "./vscan-enterprises.component.html",
	styleUrls: ["./vscan-enterprises.component.scss"]
})
export class VscanEnterprisesComponent implements OnInit {
	// Table fields
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	displayedColumns = [
		"enterpriseID",
		"enterpriseName",
		"enterpriseDevices",
		"actions"
	];

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;

	entResult: VscanEnterprise[] = [];

	// Selection
	selection = new SelectionModel<VscanEnterprise>(true, []);

	// Loading flag
	loading$ = new BehaviorSubject<boolean>(true);

	// Credentials Data
	entList$ = new BehaviorSubject<VscanEnterprise>(null);

	dataSource = new MatTableDataSource<VscanEnterprise>();

	constructor(
		private vscanAPI: VscanApiService,
		private toastNotif: ToastNotifService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService
	) {}

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		this.entList$
			.pipe(
				switchMap(() => {
					return this.vscanAPI.getAllEnterprises().pipe(
						tap(res => {
							if (res.enterprises) {
								this.dataSource.data = res.enterprises;
								this.loading$.next(false);
							} else {
								this.dataSource.data = [];
								this.loading$.next(false);
							}
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								"Failed to fetch Enterprises"
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
		const numRows = this.entResult.length;
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

	// Add new User
	onAddNewEnterprise() {
		const newEnt = new VscanEnterprise();
		newEnt.clear(); // Set all defaults fields
		this.onEditEnteprise(newEnt, true);
	}

	// Edit User
	onEditEnteprise(ent: VscanEnterprise, create: boolean) {
		const dialogRef = this.dialog.open(EditEnterpriseComponent, {
			data: { entObj: ent },
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
						.createEnterprise(body)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully created Enterprise: " +
										body.enterpriseName,
									`Enterprise Creation Success`
								);

								// Refresh HTTP Request Observable
								this.entList$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`Enterprise Creation Failure`
								);
								this.loading$.next(false);
								return throwError(err);
							})
						)
						.subscribe();
				} else {
					this.vscanAPI
						.updateEnterprise(body, ent.enterpriseID)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully updated Enterprise: " +
										ent.enterpriseID,
									`Enterprise Update Success`
								);

								// Refresh HTTP Request Observable
								this.entList$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`Enterprise Update Failure`
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

	// Delete User
	deleteEnterprise(ent: VscanEnterprise | null) {
		const dialogRef = this.layoutUtilsService.deleteElement(
			"Enteprise Deletion",
			"Deleting an enterprise will also remove all associated objects:\n" +
				"- Devices\n" +
				"- SSH Gateways\n" +
				"- Users\n" +
				"\nConfirm you want to delete the" +
				" following enterprise:\n",
			`\n ${ent.enterpriseID} - ${ent.enterpriseName}`
		);

		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (res) {
				this.loading$.next(true);

				this.vscanAPI
					.deleteEnterprise(ent.enterpriseID)
					.pipe(
						tap(() => {
							this.toastNotif.successToastNotif(
								"Successfully deleted enterprise: " +
									ent.enterpriseID,
								`Enterprise Deletion Success`
							);

							// Refresh HTTP Request Observable
							this.entList$.next(null);

							this.selection.clear();

							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								`Enterprise Deletion Failure`
							);
							this.loading$.next(false);
							return throwError(err);
						})
					)
					.subscribe();
			}
		});
	}

	buildBodyRequest(formInputs: any): EnterpriseCreate | EnterpriseUpdate {
		const requestObj: EnterpriseCreate | EnterpriseUpdate = {
			enterpriseID: formInputs.enterpriseID.toUpperCase().trim(),
			enterpriseName: formInputs.enterpriseName
		};
		// Remove Object key if null or empty
		Object.keys(requestObj).forEach(
			key => (requestObj[key] === "" || null) && delete requestObj[key]
		);

		return requestObj;
	}
}
