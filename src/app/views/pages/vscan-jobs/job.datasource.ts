import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { ScanJobs, VscanJobs } from "../../../core/vscan-api/scan.jobs.model";
import { VscanApiService } from "../../../core/vscan-api/vscan-api.service";
import { catchError, finalize } from "rxjs/operators";

export class VscanJobsDataSource implements DataSource<ScanJobs> {
	scanJobSubject = new BehaviorSubject<ScanJobs[]>([]);
	private jobLoadingSubject = new BehaviorSubject<boolean>(false);

	public loading$ = this.jobLoadingSubject.asObservable();

	hasItems: boolean = false; // Need to show message: 'No records found'
	// Paginator | Paginators count
	paginatorTotalSubject = new BehaviorSubject<number>(0);
	paginatorTotal$: Observable<number>;
	subscriptions: Subscription[] = [];

	constructor(private vscan: VscanApiService) {
		this.paginatorTotal$ = this.paginatorTotalSubject.asObservable();
		this.paginatorTotal$.subscribe(res => (this.hasItems = res > 0));
	}

	connect(collectionViewer: CollectionViewer): Observable<ScanJobs[]> {
		return this.scanJobSubject.asObservable();
	}

	disconnect(collectionViewer: CollectionViewer): void {
		this.scanJobSubject.complete();
		this.jobLoadingSubject.complete();
		this.paginatorTotalSubject.complete();
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadJobsHistory(
		filters = {},
		sort = { direction: "asc", column: "startTime" },
		pageSize = 10,
		pageNumber = 0
	) {
		this.jobLoadingSubject.next(true);

		this.vscan
			.getjobsHistory(filters, sort, pageSize, pageNumber)
			.pipe(
				catchError(() => of([])),
				finalize(() => this.jobLoadingSubject.next(false))
			)
			.subscribe((jobs: VscanJobs) => {
				this.paginatorTotalSubject.next(jobs.totalRecords);
				this.scanJobSubject.next(jobs.jobs);
			});
	}
}
