import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { VscanApiService } from "../../../../core/vscan-api/vscan-api.service";
import { catchError, finalize, tap } from "rxjs/operators";
import { forkJoin, throwError } from "rxjs";
import { ToastNotifService } from "../../../../core/_base/layout/services/toast-notif.service";
import {
	DeviceVulnerabilitiesHistoryModel,
	DeviceVulnerabilitiesModel
} from "../../../../core/vscan-api/device.vulnerabilities.model";
import { InventoryDeviceModel } from "../../../../core/vscan-api/device.inventory.model";
import { ColumnMode, SortType } from "@swimlane/ngx-datatable";
import { ChartDataSets, ChartOptions, ChartType } from "chart.js";
import { Label } from "ng2-charts";
import { Timeline2Data } from "../../../partials/content/widgets/timeline2/timeline2.component";

export interface VulnDialogData {
	windowTitle: string;
	device: string;
	details: InventoryDeviceModel;
}

@Component({
	selector: "vscan-device-vuln-details",
	templateUrl: "./device-vuln-details.component.html",
	styleUrls: ["./device-vuln-details.component.scss"]
})
export class DeviceVulnDetailsComponent implements OnInit {
	loadingDialog = true;

	deviceVulnerabilities: DeviceVulnerabilitiesModel;
	deviceHistoryVuln: DeviceVulnerabilitiesHistoryModel;
	historyVulnCount: number[] = [];
	historyVulnDate: string[] = [];
	historyResults: Timeline2Data[] = [];

	ColumnMode = ColumnMode;
	SortType = SortType;

	public barChartOptions: ChartOptions = {
		responsive: true,
		legend: {
			labels: {
				fontFamily: "Gotham-Light, sans-serif",
				fontSize: 14
			}
		},
		// We use these empty structures as placeholders for dynamic theming.
		scales: {
			xAxes: [
				{
					gridLines: {
						display: false
					},
					ticks: {
						fontFamily: "Gotham-Light, sans-serif",
						fontSize: 14
					}
				}
			],
			yAxes: [
				{
					ticks: {
						beginAtZero: true,
						fontFamily: "Gotham-Light, sans-serif",
						fontSize: 14,
						display: false
					},
					gridLines: {
						display: false
					}
				}
			]
		},
		tooltips: {
			titleFontFamily: "Gotham, sans-serif",
			titleFontSize: 14,
			bodyFontFamily: "Gotham-Light, sans-serif",
			bodyFontSize: 13
		}
	};
	public barChartLabels: Label[] = this.historyVulnDate;
	public barChartType: ChartType = "bar";
	public barChartLegend = true;

	public barChartData: ChartDataSets[] = [
		{
			data: this.historyVulnCount,
			label: "Number of vulnerabilities found",
			backgroundColor: "rgba(234,121,38,0.5)",
			borderColor: "rgba(234,121,38,0.59)",
			hoverBackgroundColor: "rgba(10,53,234,0.5)",
			hoverBorderColor: "rgba(10,53,234,0.59)"
		}
	];

	constructor(
		public dialogRef: MatDialogRef<DeviceVulnDetailsComponent>,
		private vscan: VscanApiService,
		private toastNotif: ToastNotifService,
		@Inject(MAT_DIALOG_DATA) public data: VulnDialogData
	) {}

	onCloseDialog(): void {
		this.dialogRef.close();
	}

	ngOnInit() {
		let deviceVulnerabilities$ = this.vscan.getDeviceVulnerabilities(
			this.data.device
		);

		let deviceHistoryVuln$ = this.vscan.getDeviceHistoryVuln(
			this.data.device,
			this.data.details[0].enterpriseID.toUpperCase()
		);

		forkJoin([deviceVulnerabilities$, deviceHistoryVuln$])
			.pipe(
				tap(res => {
					this.loadingDialog = false;
					this.deviceVulnerabilities = res[0];
					this.deviceHistoryVuln = res[1];

					if (this.deviceHistoryVuln.results instanceof Array) {
						this.deviceHistoryVuln.results.forEach((item, idx) => {
							this.historyVulnCount.push(item.vulnFound.length);

							let date = new Date(item.scanDate.toString());

							this.historyVulnDate.push(date.toLocaleString());

							const historyDiff = this.vulnHistoryDiff(idx, item);

							this.historyResults.push({
								time: date.toLocaleString(),
								text: historyDiff.timelineText,
								icon: historyDiff.timelineIcon
							});
						});
					}
				}),
				catchError(err => {
					this.toastNotif.errorToastNotif(
						err,
						"Failed to device vulnerability data"
					);
					this.loadingDialog = false;
					return throwError(err);
				}),
				finalize(() => {
					this.loadingDialog = false;
				})
			)
			.subscribe();
	}

	isdeviceHistoryVulnArray(): boolean {
		return this.deviceHistoryVuln.results instanceof Array;
	}

	isdeviceVulnerabilitiesArray(): boolean {
		return this.deviceVulnerabilities.results instanceof Array;
	}

	vulnHistoryDiff(idx: number, item: any): any {
		// Build Timelines with vulnerabilities history
		// Compare history indexes and show the diff to the user
		let timelineText: string;
		let timelineIcon: string;

		// Handle first entry in the array
		if (idx === 0) {
			timelineText =
				item.vulnFound.length > 0
					? '<p class="timeline-vuln-danger">' +
					  item.vulnFound
							.map(val => {
								return "+ " + val;
							})
							.join("\n") +
					  "</p>"
					: '<p class="timeline-vuln-success">No vulnerability found</p>';

			timelineIcon =
				item.vulnFound.length > 0
					? "fa fa-genderless kt-font-danger"
					: "fa fa-genderless kt-font-success";

			return { timelineIcon: timelineIcon, timelineText: timelineText };
		} else if (idx >= 1) {
			// Convert previous record index to avoid compilation error
			let prevHistoryRec: any = this.deviceHistoryVuln.results[
				idx - 1
			].valueOf();

			// Get Intersection from current index
			let intersection = item.vulnFound.filter(x =>
				prevHistoryRec.vulnFound.includes(x)
			);

			if (intersection.length === item.vulnFound.length) {
				console.log("hello");
				timelineText = "No difference from previous scan";
				timelineIcon = "fa fa-genderless kt-font-info";
				return {
					timelineIcon: timelineIcon,
					timelineText: timelineText
				};
			} else {
				// Item missing from current history record compared to previous one (Vulnerability Removed)
				let intersection_left_exclude = item.vulnFound.filter(
					x => !prevHistoryRec.vulnFound.includes(x)
				);

				// Item missing from previous record compared to current one (Vulnerability Added)
				let intersection_right_exclude = prevHistoryRec.vulnFound.filter(
					x => !item.vulnFound.includes(x)
				);
			}
		}
	}
}
