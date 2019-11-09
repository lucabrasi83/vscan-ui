import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import {
	HIDDEN_PASSWORD,
	ROOT_ROLE,
	USER_ROLE,
	UserCreate,
	UserUpdate,
	VscanUsers
} from "../../../../core/vscan-api/users.model";
import { SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, throwError } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import { VscanApiService } from "../../../../core/vscan-api/vscan-api.service";
import { ToastNotifService } from "../../../../core/_base/layout/services/toast-notif.service";
import { MatDialog } from "@angular/material/dialog";
import { LayoutUtilsService } from "../../../../core/_base/crud";
import { catchError, switchMap, tap } from "rxjs/operators";
import { EditUsersComponent } from "./edit-users/edit-users.component";

@Component({
	selector: "vscan-users",
	templateUrl: "./vscan-users.component.html",
	styleUrls: ["./vscan-users.component.scss"]
})
export class VscanUsersComponent implements OnInit {
	// Table fields
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	displayedColumns = [
		"select",
		"userID",
		"firstName",
		"lastName",
		"enterpriseID",
		"role",
		"actions"
	];

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;

	userResults: VscanUsers[] = [];

	hiddenPassword: string = HIDDEN_PASSWORD;

	rootRole = ROOT_ROLE;
	userRole = USER_ROLE;

	// Selection
	selection = new SelectionModel<VscanUsers>(true, []);

	// Loading flag
	loading$ = new BehaviorSubject<boolean>(true);

	// Credentials Data
	userList$ = new BehaviorSubject<VscanUsers>(null);

	dataSource = new MatTableDataSource<VscanUsers>();

	constructor(
		private vscanAPI: VscanApiService,
		private toastNotif: ToastNotifService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService
	) {}

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		this.userList$
			.pipe(
				switchMap(() => {
					return this.vscanAPI.getAllUsers().pipe(
						tap(res => {
							if (res.users) {
								this.dataSource.data = res.users;
								this.loading$.next(false);
							} else {
								this.dataSource.data = [];
								this.loading$.next(false);
							}
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								"Failed to fetch Users"
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
		const numRows = this.userResults.length;
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
	onAddNewUser() {
		const newUser = new VscanUsers();
		newUser.clear(); // Set all defaults fields
		this.onEditUser(newUser, true);
	}

	// Edit User
	onEditUser(users: VscanUsers, create: boolean) {
		const dialogRef = this.dialog.open(EditUsersComponent, {
			data: { userObj: users },
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
						.createUser(body)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully created User: " + body.email,
									`User Creation Success`
								);

								// Refresh HTTP Request Observable
								this.userList$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`User Creation Failure`
								);
								this.loading$.next(false);
								return throwError(err);
							})
						)
						.subscribe();
				} else {
					this.vscanAPI
						.updateUser(body)
						.pipe(
							tap(() => {
								this.toastNotif.successToastNotif(
									"Successfully updated User: " + body.email,
									`User Update Success`
								);

								// Refresh HTTP Request Observable
								this.userList$.next(null);

								this.selection.clear();

								this.loading$.next(false);
							}),
							catchError(err => {
								this.toastNotif.errorToastNotif(
									err,
									`User Update Failure`
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
	deleteUsers(user: VscanUsers | null) {
		let userArray: string[] = [];

		// If individual button is pressed we passed the user object. If Not, we know the deletion comes from
		// checkbox selection
		if (user) {
			userArray.push(user.email);
		} else {
			this.selection.selected.forEach(item => {
				userArray.push(item.email);
			});
		}

		const dialogRef = this.layoutUtilsService.deleteElement(
			"User Deletion",
			"Confirm you want to delete the following user(s): ",
			userArray.join("\n")
		);

		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (res) {
				this.loading$.next(true);

				this.vscanAPI
					.deleteUsers(userArray)
					.pipe(
						tap(() => {
							const toastMsg: string =
								userArray.length > 10
									? userArray.slice(0, 11).join("\n") +
									  "\n...\n"
									: userArray.join("\n");

							this.toastNotif.successToastNotif(
								"Successfully deleted user(s):\n" + toastMsg,
								`User Deletion Success`
							);

							// Refresh HTTP Request Observable
							this.userList$.next(null);

							this.selection.clear();

							this.loading$.next(false);
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								`User Deletion Failure`
							);
							this.loading$.next(false);
							return throwError(err);
						})
					)
					.subscribe();
			}
		});
	}

	buildBodyRequest(formInputs: any): UserCreate | UserUpdate {
		const requestObj: UserCreate | UserUpdate = {
			email: formInputs.userEmail.toUpperCase().trim(),
			password:
				formInputs.passwordGroup.password === this.hiddenPassword
					? ""
					: formInputs.passwordGroup.password,
			role: formInputs.role.trim(),
			enterpriseID: formInputs.enterpriseID.trim(),
			firstName: formInputs.firstName.trim(),
			lastName: formInputs.lastName.trim(),
			middleName: formInputs.middleName.trim()
		};
		// Remove Object key if null or empty
		Object.keys(requestObj).forEach(
			key => (requestObj[key] === "" || null) && delete requestObj[key]
		);

		return requestObj;
	}
}
