import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, throwError } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import { VscanApiService } from "../../../core/vscan-api/vscan-api.service";
import { ToastNotifService } from "../../../core/_base/layout/services/toast-notif.service";
import { MatDialog } from "@angular/material/dialog";
import { LayoutUtilsService } from "../../../core/_base/crud";
import { catchError, switchMap, tap } from "rxjs/operators";
import {
	EnterpriseSSHGateway,
	SSHGatewayCreate,
	SSHGatewayUpdate
} from "../../../core/vscan-api/ssh.gateway.model";
import { SshGwEditComponent } from "./ssh-gw-edit/ssh-gw-edit.component";

@Component({
	selector: "vscan-vscan-ssh-gateways",
	templateUrl: "./vscan-ssh-gateways.component.html",
	styleUrls: ["./vscan-ssh-gateways.component.scss"]
})
export class VscanSshGatewaysComponent implements OnInit {
	// Table fields
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	displayedColumns = [
		"select",
		"gatewayName",
		"gatewayIP",
		"gatewayUsername",
		"gatewayPassword",
		"gatewayPrivateKey",
		"actions"
	];

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;

	sshgwsResults: EnterpriseSSHGateway[] = [];

	// Selection
	selection = new SelectionModel<EnterpriseSSHGateway>(true, []);

	// Loading flag
	loading$ = new BehaviorSubject<boolean>(true);

	// Credentials Data
	userCredentials$ = new BehaviorSubject<EnterpriseSSHGateway>(null);

	dataSource = new MatTableDataSource<EnterpriseSSHGateway>();

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
					return this.vscanAPI.getAllEnterpriseSSHGateways().pipe(
						tap(res => {
							this.dataSource.data = res.sshGateway;
							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								"Failed to fetch SSH gateways"
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
		const numRows = this.sshgwsResults.length;
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

	// Add new SSH Gateway
	onAddNewSSHGateway() {
		const newSSHGateway = new EnterpriseSSHGateway();
		newSSHGateway.clear(); // Set all defaults fields
		this.onEditSSHGateway(newSSHGateway, true);
	}

	// Edit SSH Gateway
	onEditSSHGateway(cred: EnterpriseSSHGateway, create: boolean) {
		const dialogRef = this.dialog.open(SshGwEditComponent, {
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
						.createSSHGateway(body)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully created SSH Gateway: " +
										body.gatewayName,
									`SSH Gateway Creation Success`
								);

								// Refresh HTTP Request Observable
								this.userCredentials$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`SSH Gateway Creation Failure`
								);
								this.loading$.next(false);
								return throwError(err);
							})
						)
						.subscribe();
				} else {
					this.vscanAPI
						.updateSSHGateway(body)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully updated SSH Gateway: " +
										body.gatewayName,
									`SSH Gateway Update Success`
								);

								// Refresh HTTP Request Observable
								this.userCredentials$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`SSH Gateway Update Failure`
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
	deleteSSHGateway(sshgw: EnterpriseSSHGateway) {
		const dialogRef = this.layoutUtilsService.deleteElement(
			"SSH Gateway Deletion",
			"Confirm you want to delete the following gateway(s): ",
			sshgw.gatewayName
		);

		let gwArray: string[] = [];

		gwArray.push(sshgw.gatewayName);

		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (res) {
				this.loading$.next(true);

				this.vscanAPI
					.deleteSSHGateways(gwArray)
					.pipe(
						tap(() => {
							this.toastNotif.successToastNotif(
								"Successfully deleted gateway(s):\n" +
									sshgw.gatewayName,
								`SSH Gateway Deletion Success`
							);

							// Refresh HTTP Request Observable
							this.userCredentials$.next(null);

							this.selection.clear();

							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								`SSH Gateway Deletion Failure`
							);
							this.loading$.next(false);
							return throwError(err);
						})
					)
					.subscribe();
			}
		});
	}

	// Delete Multiple Gateways
	bulkDeleteSSHGateways() {
		let selectedSSHGateways: string[] = [];

		this.selection.selected.forEach(item => {
			selectedSSHGateways.push(item.gatewayName);
		});

		const dialogRef = this.layoutUtilsService.deleteElement(
			"SSH Gateway Deletion",
			"Confirm you want to delete the following gateway(s): ",
			selectedSSHGateways.join("\n")
		);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (res) {
				this.loading$.next(true);

				this.vscanAPI
					.deleteSSHGateways(selectedSSHGateways)
					.pipe(
						tap(() => {
							this.toastNotif.successToastNotif(
								"Successfully deleted gateway(s):\n" +
									selectedSSHGateways.join("\n"),
								`SSH Gateway Deletion Success`
							);

							// Refresh HTTP Request Observable
							this.userCredentials$.next(null);

							this.selection.clear();

							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								`SSH Gateway Deletion Failure`
							);
							this.loading$.next(false);
							return throwError(err);
						})
					)
					.subscribe();
			}
		});
	}

	buildBodyRequest(formInputs: any): SSHGatewayCreate | SSHGatewayUpdate {
		const requestObj: SSHGatewayCreate | SSHGatewayUpdate = {
			gatewayName: formInputs.gatewayName.toUpperCase().trim(),
			gatewayIP: formInputs.gatewayIP,
			gatewayUsername: formInputs.gatewayUsername.trim(),
			gatewayPassword: formInputs.gatewayPassword.trim(),
			gatewayPrivateKey: formInputs.gatewayPrivateKey
		};
		// Remove Object key if null or empty
		Object.keys(requestObj).forEach(
			key => (requestObj[key] === "" || null) && delete requestObj[key]
		);

		return requestObj;
	}
}
