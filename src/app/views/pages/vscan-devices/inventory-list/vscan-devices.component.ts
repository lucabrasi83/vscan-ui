import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	OnInit,
	TemplateRef,
	ViewChild
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { BehaviorSubject, throwError } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { InventoryDeviceModel } from "../../../../core/vscan-api/device.inventory.model";
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";
import { VscanApiService } from "../../../../core/vscan-api/vscan-api.service";
import { catchError, map } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { ToastNotifService } from "../../../../core/_base/layout/services/toast-notif.service";
import { MatSelect } from "@angular/material/select";
import { MatDialog } from "@angular/material/dialog";
import { DeviceVulnDetailsComponent } from "../device-vuln-details/device-vuln-details.component";
import { AuthService } from "../../../../core/auth/_services";
import {
	MAX_DEVICES,
	VscanScanComponent
} from "../vscan-scan/vscan-scan.component";

@Component({
	selector: "vscan-devices",
	templateUrl: "./vscan-devices.component.html",
	styleUrls: ["./vscan-devices.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VscanDevicesComponent implements OnInit, AfterViewInit {
	// Table fields
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	displayedColumns = [
		"select",
		"deviceID",
		"enterpriseID",
		"vulnerabilityStatus",
		"productID",
		"mgmtIP",
		"osType",
		"osVersion",
		"lastScan"
	];

	// Filter fields
	filterEnterprise: string[] = [];

	filterVulnerabilityStatus: string = "";

	// Loading Template
	@ViewChild("customLoadingTemplate", { static: false })
	customLoadingTemplate: TemplateRef<any>;

	// Selection
	selection = new SelectionModel<InventoryDeviceModel>(true, []);

	// Loading flag
	loading$ = new BehaviorSubject<boolean>(true);

	// Dropdown Filter Sets
	enterpriseIDSet = new Set();
	enterpriseIDArray = [];

	// Dropdown Filter Elements
	@ViewChild("filterEnterpriseDropdown", { static: true })
	filterEnterpriseDropdown: MatSelect;
	@ViewChild("filterVulnerabilityStatusDropdown", { static: true })
	filterVulnerabilityStatusDropdown: MatSelect;

	deviceResults: InventoryDeviceModel[] = [];
	dataSource = new MatTableDataSource<InventoryDeviceModel>();

	constructor(
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private vscanAPI: VscanApiService,
		private toastNotif: ToastNotifService,
		public dialog: MatDialog,
		private auth: AuthService
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
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		this.vscanAPI
			.getAllInventoryDevices()
			.pipe(
				map(elem => {
					return elem.devices;
				}),
				catchError(err => {
					this.toastNotif.errorToastNotif(
						err,
						"Failed to fetch devices"
					);
					this.loading$.next(false);
					return throwError(err);
				})
			)
			.subscribe(data => {
				this.dataSource.data = data as InventoryDeviceModel[];

				this.loading$.next(false);

				this.deviceResults = this.dataSource.data;

				// Set dropdown filters data
				data.forEach(elem => {
					this.enterpriseIDSet.add(elem.enterpriseName.trim());
				});
				// Copy Sets into sorted array

				this.enterpriseIDArray = Array.from(
					this.enterpriseIDSet
				).sort();
			});

		// Customer Filter predicate
		this.dataSource.filterPredicate = this.customerFilterPredicate;
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
		const numRows = this.deviceResults.length;
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
			// this.deviceResults.forEach(row => this.selection.select(row));
			this.dataSource.filteredData.forEach(row =>
				this.selection.select(row)
			);
		}
	}

	// Text Filter Search
	public doFilterText = (value: string) => {
		// Reset Dropdown values when searching text
		if (value && value !== "") {
			this.filterEnterprise = [];
			this.filterEnterpriseDropdown.disabled = true;

			this.filterVulnerabilityStatus = "";
			this.filterVulnerabilityStatusDropdown.disabled = true;
		} else {
			this.filterEnterpriseDropdown.disabled = false;
			this.filterVulnerabilityStatusDropdown.disabled = false;

			this.dataSource.filter = "";
			return;
		}
		let filterTextObj = {
			filterText: value.trim().toLocaleLowerCase()
		};
		this.dataSource.filter = JSON.stringify(filterTextObj);
		this.selection.clear();
	};

	// Custom Filter Predicate to give the ability search either in dropdowns or text
	// TODO: Revisit to make simpler logic
	customerFilterPredicate(data, filter: string): boolean {
		let filterObj = JSON.parse(filter);
		const matchFilterEnterprise = [];

		if (filterObj.enterprise) {
			let filterArray = filterObj.enterprise.split(",");

			filterArray.forEach(filter => {
				matchFilterEnterprise.push(
					data.enterpriseName
						.toLocaleLowerCase()
						.trim()
						.includes(filter.trim().toLocaleLowerCase())
				);
			});
		}

		if (filterObj.vulnerability && filterObj.enterprise.length > 0) {
			let status =
				filterObj.vulnerability === "SAFE"
					? data.vulnerabilitiesFound.length === 0
					: data.vulnerabilitiesFound.length > 0;

			return matchFilterEnterprise.some(Boolean) && status;
		}

		if (filterObj.vulnerability && filterObj.enterprise.length === 0) {
			return filterObj.vulnerability === "SAFE"
				? data.vulnerabilitiesFound.length === 0
				: data.vulnerabilitiesFound.length > 0;
		}

		if (filterObj.enterprise && !filterObj.vulnerability) {
			return matchFilterEnterprise.some(Boolean);
		}

		if (filterObj.filterText) {
			let concatDataStr =
				data.enterpriseID.trim().toLocaleLowerCase() +
				data.deviceID.trim().toLocaleLowerCase() +
				data.productID.trim().toLocaleLowerCase() +
				data.mgmtIP.trim().toLocaleLowerCase() +
				data.osType.trim().toLocaleLowerCase() +
				data.osVersion.trim().toLocaleLowerCase();

			return (
				concatDataStr.indexOf(
					filterObj.filterText.trim().toLocaleLowerCase()
				) !== -1
			);
		}
	}

	// Dropdown Filters
	doDropdownEnterpriseFilters(val: string[]) {
		if (val.length > 0) {
			let filterObj = {
				enterprise: val.join(","),
				vulnerability: this.filterVulnerabilityStatus
			};
			this.dataSource.filter = JSON.stringify(filterObj);
		} else {
			this.dataSource.filter = "";
		}
	}

	// Dropdown Filters
	doDropdownStatusFilters(val: string) {
		if (val) {
			let filterObj = {
				enterprise: this.filterEnterprise.join(","),
				vulnerability: val
			};
			this.dataSource.filter = JSON.stringify(filterObj);
		} else {
			this.dataSource.filter = "";
		}
	}

	onClearFilters() {
		this.filterEnterprise = [];
		this.filterVulnerabilityStatus = "";
		this.dataSource.filter = "";
		this.selection.clear();
	}

	scanSelectedDevices() {
		if (this.selection.selected.length > MAX_DEVICES) {
			this.toastNotif.errorToastNotif(
				`A maximum of ${MAX_DEVICES} devices can be selected for a single job scan`,
				"Too many devices selected"
			);
			return;
		}
		this.openScanFlowDialog(this.selection.selected);
	}

	openVulnDetailsDialog(devid: string): void {
		// Get the particular device inventory details
		let devDetails = this.dataSource.data.filter(item => {
			return item.deviceID === devid;
		});

		const dialogRef = this.dialog.open(DeviceVulnDetailsComponent, {
			width: "85%",
			height: "80%",
			data: {
				windowTitle: `${devid}`,
				device: devid,
				details: devDetails
			},
			autoFocus: false
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log("The dialog was closed " + result);
		});
	}

	openScanFlowDialog(devices: any[]): void {
		const dialogRef = this.dialog.open(VscanScanComponent, {
			width: "80%",
			height: "70%",
			data: {
				windowTitle: "Inventory Vulnerability Scan Workflow",
				selectedDevices: devices
			},
			autoFocus: false
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log("The dialog was closed " + result);
		});
	}
}
