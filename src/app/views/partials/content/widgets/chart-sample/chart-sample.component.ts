import { Component, OnInit } from "@angular/core";
import { ChartDataSets, ChartOptions, ChartType } from "chart.js";
import { Label } from "ng2-charts";

@Component({
	selector: "vscan-chart-sample",
	templateUrl: "./chart-sample.component.html",
	styleUrls: ["./chart-sample.component.scss"]
})
export class ChartSampleComponent implements OnInit {
	public barChartOptions: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		// We use these empty structures as placeholders for dynamic theming.
		scales: {
			xAxes: [
				{
					gridLines: {
						display: false
					}
				}
			],
			yAxes: [
				{
					gridLines: {
						display: false
					}
				}
			]
		},
		plugins: {
			datalabels: {
				anchor: "end",
				align: "end"
			}
		}
	};
	public barChartLabels: Label[] = [
		"2006",
		"2007",
		"2008",
		"2009",
		"2010",
		"2011",
		"2012"
	];
	public barChartType: ChartType = "horizontalBar";
	public barChartLegend = true;

	public barChartData: ChartDataSets[] = [
		{ data: [65, 59, 80, 81, 56, 55, 40], label: "Series A" },
		{ data: [28, 48, 40, 19, 86, 27, 90], label: "Series B" }
	];

	public lineChartData: ChartDataSets[] = [
		{ data: [65, 59, 80, 81, 56, 55, 40], label: "Series A" },
		{ data: [28, 48, 40, 19, 86, 27, 90], label: "Series B" },
		{
			data: [180, 480, 770, 90, 1000, 270, 400],
			label: "Series C",
			yAxisID: "y-axis-1"
		}
	];

	public lineChartLabels: Label[] = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July"
	];

	lineChartType: ChartType = "line";

	public lineChartOptions: ChartOptions & { annotation: any } = {
		responsive: true,
		scales: {
			// We use this empty structure as a placeholder for dynamic theming.
			xAxes: [{}],
			yAxes: [
				{
					id: "y-axis-0",
					position: "left"
				},
				{
					id: "y-axis-1",
					position: "right",
					gridLines: {
						color: "rgba(255,0,0,0.3)"
					},
					ticks: {
						fontColor: "red"
					}
				}
			]
		},
		annotation: {
			annotations: [
				{
					type: "line",
					mode: "vertical",
					scaleID: "x-axis-0",
					value: "March",
					borderColor: "orange",
					borderWidth: 2,
					label: {
						enabled: true,
						fontColor: "orange",
						content: "LineAnno"
					}
				}
			]
		}
	};

	constructor() {}

	ngOnInit() {}
}
