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
						fontSize: 14
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
						this.deviceHistoryVuln.results.forEach(item => {
							this.historyVulnCount.push(item.vulnFound.length);

							this.historyVulnDate.push(item.scanDate.toString());
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
}
