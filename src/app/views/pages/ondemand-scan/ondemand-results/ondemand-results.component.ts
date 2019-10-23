import { Component, Input, OnInit } from "@angular/core";
import { OndemandScanResultsModel } from "../../../../core/vscan-api/ondemand.scan.results.model";
import { ColumnMode, SortType } from "@swimlane/ngx-datatable";

@Component({
	selector: "vscan-ondemand-results",
	templateUrl: "./ondemand-results.component.html",
	styleUrls: ["./ondemand-results.component.scss"]
})
export class OndemandResultsComponent implements OnInit {
	@Input() scanResults: OndemandScanResultsModel;
	ColumnMode = ColumnMode;
	SortType = SortType;

	constructor() {}

	ngOnInit() {}
}
