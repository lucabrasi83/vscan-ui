import { Component, Input, OnInit } from "@angular/core";
import { InventoryScanResultsModel } from "../../../../../core/vscan-api/inventory.scan.results.model";
import { ColumnMode, SortType } from "@swimlane/ngx-datatable";

@Component({
	selector: "vscan-scan-results",
	templateUrl: "./scan-results.component.html",
	styleUrls: ["./scan-results.component.scss"]
})
export class ScanResultsComponent implements OnInit {
	@Input() scanResults: InventoryScanResultsModel;

	ColumnMode = ColumnMode;
	SortType = SortType;

	constructor() {}

	ngOnInit(): void {}
}
