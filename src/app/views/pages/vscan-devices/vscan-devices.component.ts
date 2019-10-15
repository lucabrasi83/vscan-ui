import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	OnInit,
	TemplateRef,
	ViewChild
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Subject, Subscription } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { InventoryDeviceModel } from "./device.inventory.model";
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";

@Component({
	selector: "vscan-devices",
	templateUrl: "./vscan-devices.component.html",
	styleUrls: ["./vscan-devices.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VscanDevicesComponent implements OnInit {
	// Table fields
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	displayedColumns = [
		"select",
		"deviceID",
		"model",
		"enterprise",
		"mgmtIP",
		"osVersion",
		"vulnerabilityStatus",
		"lastScanDate"
	];

	// Filter fields
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	filterStatus: string = "";
	filterType: string = "";

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;

	// Subscriptions
	private subscriptions: Subscription[] = [];

	// Selection
	selection = new SelectionModel<InventoryDeviceModel>(true, []);

	// Loading flag
	loading$ = new Subject<boolean>();
	isPreloadTextViewed$ = new Subject<boolean>();

	deviceResults: InventoryDeviceModel[] = [];
	dataSource: InventoryDeviceModel[] = [];

	constructor(
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer
	) {
		this.matIconRegistry.addSvgIcon(
			"shield-success",
			this.domSanitizer.bypassSecurityTrustResourceUrl(
				"../../../assets/media/icons/svg/Scan/shield-success.svg"
			)
		);

		this.matIconRegistry.addSvgIcon(
			"shield-failed",
			this.domSanitizer.bypassSecurityTrustResourceUrl(
				"../../../assets/media/icons/svg/Scan/shield-failed.svg"
			)
		);
	}

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);

		this.dataSource.push(
			{
				deviceID: "SSP-TH-BANGKOK-G-MPLS-R-1",
				enterprise: "SSP",
				mgmtIP: "10.1.1.1",
				osType: "IOS",
				osVersion: "16.7.1",
				model: "4451-X",
				vulnerabilityStatus: "critical",
				lastScanDate: new Date(),
				clear() {}
			},
			{
				deviceID: "DGG-GB-CRESSEX-01-IZO-INET-R-1",
				enterprise: "DGG",
				mgmtIP: "10.1.1.2",
				osType: "IOS",
				osVersion: "16.7.1",
				model: "4331/K9",
				vulnerabilityStatus: "ok",
				lastScanDate: new Date(),
				clear() {}
			}
		);

		this.deviceResults = this.dataSource;
	}
	onClickSubject() {
		this.loading$.next(true);
		this.isPreloadTextViewed$.next(true);

		setTimeout(() => {
			this.loading$.next(false);
			this.isPreloadTextViewed$.next(false);
		}, 5000);
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.deviceResults.length;
		return numSelected === numRows;
	}

	/**
	 * Toggle all selections
	 */
	masterToggle() {
		if (this.selection.selected.length === this.deviceResults.length) {
			this.selection.clear();
		} else {
			this.deviceResults.forEach(row => this.selection.select(row));
		}
	}
}
