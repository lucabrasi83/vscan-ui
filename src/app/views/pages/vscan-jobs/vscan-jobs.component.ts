import {
	AfterViewInit,
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild
} from "@angular/core";
import { VscanJobsDataSource } from "./job.datasource";
import { VscanApiService } from "../../../core/vscan-api/vscan-api.service";
import { ToastNotifService } from "../../../core/_base/layout/services/toast-notif.service";
import { MatDialog } from "@angular/material/dialog";
import { LayoutUtilsService } from "../../../core/_base/crud";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import {
	catchError,
	debounceTime,
	distinctUntilChanged,
	skip,
	tap
} from "rxjs/operators";
import { Subscription, merge, fromEvent, throwError } from "rxjs";
import { ScanJobs } from "../../../core/vscan-api/scan.jobs.model";
import { SelectionModel } from "@angular/cdk/collections";
import { AuthService } from "../../../core/auth/_services";
import {
	MatDatepicker,
	MatDatepickerInputEvent
} from "@angular/material/datepicker";
import { VscanUsers } from "../../../core/vscan-api/users.model";
import { JobLogsComponent } from "./job-logs/job-logs.component";

const ipaddressPattern =
	"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";

@Component({
	selector: "vscan-vscan-jobs",
	templateUrl: "./vscan-jobs.component.html",
	styleUrls: ["./vscan-jobs.component.scss"]
})
export class VscanJobsComponent implements OnInit, AfterViewInit, OnDestroy {
	dataSource: VscanJobsDataSource;
	// Table fields
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;

	// Subscriptions
	private subscriptions: Subscription[] = [];

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;

	// Selection
	selection = new SelectionModel<ScanJobs>(true, []);
	jobResult: ScanJobs[] = [];

	// Root User flag to control displayed column
	rootUser: boolean = false;

	// All Users array
	usersArray: VscanUsers[] = [];

	// Filters
	filterUsers: string = "";
	filterJobResults: string = "";
	@ViewChild("searchInputDevName", { static: true })
	searchInputDevName: ElementRef;
	@ViewChild("searchInputDevIP", { static: true })
	searchInputDevIP: ElementRef;

	@ViewChild("searchInputJobLogs", { static: true })
	searchInputJobLogs: ElementRef;

	@ViewChild("startDatePicker", { static: false })
	startDatePicker: MatDatepicker<string>;
	filterStartDate: string;

	@ViewChild("endDatePicker", { static: false })
	endDatePicker: MatDatepicker<string>;
	filterEndDate: string;

	displayedColumns = [
		"select",
		"jobID",
		"startTime",
		"endTime",
		"jobResult",
		"userID",
		"agent",
		"devicesScanned",
		"jobLogs"
	];

	constructor(
		private vscanAPI: VscanApiService,
		private toastNotif: ToastNotifService,
		public dialog: MatDialog,
		private auth: AuthService,
		private layoutUtilsService: LayoutUtilsService
	) {}

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(tap(() => this.loadJobHistory()))
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const DeviceNameSearchSubscription = fromEvent(
			this.searchInputDevName.nativeElement,
			"keyup"
		)
			.pipe(
				// tslint:disable-next-line:max-line-length
				debounceTime(300),
				distinctUntilChanged(), // This operator will eliminate duplicate values
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadJobHistory();
				})
			)
			.subscribe();
		this.subscriptions.push(DeviceNameSearchSubscription);

		const DeviceIPSearchSubscription = fromEvent(
			this.searchInputDevIP.nativeElement,
			"keyup"
		)
			.pipe(
				// tslint:disable-next-line:max-line-length
				debounceTime(1000),
				distinctUntilChanged(), // This operator will eliminate duplicate values
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadJobHistory();
				})
			)
			.subscribe();
		this.subscriptions.push(DeviceIPSearchSubscription);

		const LogSearchSubscription = fromEvent(
			this.searchInputJobLogs.nativeElement,
			"keyup"
		)
			.pipe(
				// tslint:disable-next-line:max-line-length
				debounceTime(300),
				distinctUntilChanged(), // This operator will eliminate duplicate values
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadJobHistory();
				})
			)
			.subscribe();
		this.subscriptions.push(LogSearchSubscription);

		// Init DataSource
		this.dataSource = new VscanJobsDataSource(this.vscanAPI);

		const entitiesSubscription = this.dataSource.scanJobSubject
			.pipe(
				skip(1),
				distinctUntilChanged()
			)
			.subscribe(res => {
				this.jobResult = res;
			});
		this.subscriptions.push(entitiesSubscription);

		this.dataSource.loadJobsHistory();

		// Check if User is admin
		this.rootUser = this.auth.isUserRoot();

		// Load All users if current user is admin
		if (this.rootUser) {
			this.vscanAPI
				.getAllUsers()
				.pipe(
					tap(res => {
						if (res.users) {
							this.usersArray = res.users;
						}
					}),
					catchError(err => {
						this.toastNotif.errorToastNotif(err, "Failed to users");
						return throwError(err);
					})
				)
				.subscribe();
		}
	}

	ngAfterViewInit(): void {
		this.paginator.page.pipe(tap(() => this.loadJobHistory())).subscribe();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	loadJobHistory() {
		this.selection.clear();

		this.dataSource.loadJobsHistory(
			this.filterConfiguration(),
			{ direction: this.sort.direction, column: this.sort.active },
			this.paginator.pageSize,
			this.paginator.pageIndex
		);
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.jobResult.length;
		return numSelected === numRows;
	}

	/**
	 * Toggle all selections
	 */
	masterToggle() {
		if (this.selection.selected.length === this.jobResult.length) {
			this.selection.clear();
		} else {
			this.jobResult.forEach(row => this.selection.select(row));
		}
	}

	getColorJobResult(status: string): string {
		switch (status) {
			case "SUCCESS":
				return "#31bb77";
			case "FAILED":
				return "#ff272c";
			default:
				return "#9b9b9b";
		}
	}
	onClearFilters() {
		this.searchInputDevName.nativeElement.value = "";
		this.searchInputDevIP.nativeElement.value = "";
		this.searchInputJobLogs.nativeElement.value = "";
		this.filterJobResults = "";
		this.filterUsers = "";
		this.startDatePicker.select(undefined);
		this.endDatePicker.select(undefined);

		this.loadJobHistory();
	}

	columnsToDisplay(): string[] {
		if (!this.rootUser) {
			const idx = this.displayedColumns.indexOf("userID");
			if (idx !== -1) {
				this.displayedColumns.splice(idx, 1);
			}
			return this.displayedColumns.slice();
		}
		return this.displayedColumns.slice();
	}

	/**
	 * Returns object for filter
	 */
	filterConfiguration(): any {
		const filter: any = {};
		const searchDeviceNameText: string = this.searchInputDevName
			.nativeElement.value;

		const searchDeviceNameIP: string = this.searchInputDevIP.nativeElement
			.value;

		const searchLogText: string = this.searchInputJobLogs.nativeElement
			.value;

		if (searchDeviceNameText) {
			filter.deviceName = searchDeviceNameText.trim();
		}

		if (searchDeviceNameIP && searchDeviceNameIP.match(ipaddressPattern)) {
			filter.deviceIP = searchDeviceNameIP.trim();
		}

		if (searchLogText) {
			filter.logPattern = searchLogText.trim();
		}

		if (this.filterStartDate) {
			filter.startTime = this.filterStartDate;
		}

		if (this.filterEndDate) {
			filter.endTime = this.filterEndDate;
		}

		if (this.filterJobResults) {
			filter.jobResult = this.filterJobResults;
		}

		if (this.filterUsers) {
			filter.userID = this.filterUsers;
		}
		return filter;
	}
	dateStartPickedChange(event: MatDatepickerInputEvent<Date>) {
		this.filterStartDate = event.value
			? event.value.toISOString()
			: undefined;
		// Move page back to index 0
		this.paginator.pageIndex = 0;
		this.loadJobHistory();
	}

	dateEndPickedChange(event: MatDatepickerInputEvent<Date>) {
		this.filterEndDate = event.value
			? event.value.toISOString()
			: undefined;
		// Move page back to index 0
		this.paginator.pageIndex = 0;
		this.loadJobHistory();
	}

	onViewLogs(job: ScanJobs) {
		this.dialog.open(JobLogsComponent, {
			data: { jobConfig: job },
			height: "auto",
			width: "80%",
			autoFocus: false
		});
	}
	onDropDownFilterSelect() {
		// Move page back to index 0
		this.paginator.pageIndex = 0;
		this.loadJobHistory();
	}

	// Delete Scan Job
	deleteJobsHistory() {
		let jobArray: string[] = [];

		this.selection.selected.forEach(item => {
			jobArray.push(item.jobID);
		});

		const dialogRef = this.layoutUtilsService.deleteElement(
			"Scan Job Deletion",
			"Confirm you want to delete the following job(s): ",
			jobArray.join("\n")
		);

		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (res) {
				this.vscanAPI
					.deleteScanJobsHistory(jobArray)
					.pipe(
						tap(() => {
							// Only copy the first 10 elements in the toast message
							const toastMsg: string =
								jobArray.length > 10
									? jobArray.slice(0, 11).join("\n") +
									  "\n...\n"
									: jobArray.join("\n");

							this.toastNotif.successToastNotif(
								"Successfully deleted job(s):\n" + toastMsg,
								`Scan Job Deletion Success`
							);

							this.selection.clear();
							// Refresh HTTP Request Observable
							this.loadJobHistory();
						}),
						catchError(err => {
							this.toastNotif.errorToastNotif(
								err,
								`Scan Job Deletion Failure`
							);
							return throwError(err);
						})
					)
					.subscribe();
			}
		});
	}
}
