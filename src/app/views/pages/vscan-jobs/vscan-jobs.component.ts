import {
	AfterViewInit,
	Component,
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
import { distinctUntilChanged, skip, tap } from "rxjs/operators";
import { Subscription, merge } from "rxjs";
import { ScanJobs } from "../../../core/vscan-api/scan.jobs.model";
import { SelectionModel } from "@angular/cdk/collections";

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

	displayedColumns = [
		"select",
		"jobID",
		"startTime",
		"endTime",
		"jobResult",
		"userID",
		"scannedDevices",
		"agent",
		"jobLogs"
	];

	constructor(
		private vscanAPI: VscanApiService,
		private toastNotif: ToastNotifService,
		public dialog: MatDialog,
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
			{},
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
		this.loadJobHistory();
	}
}
