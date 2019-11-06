import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
	selector: "vscan-job-devices",
	templateUrl: "./job-devices.component.html",
	styleUrls: ["./job-devices.component.scss"]
})
export class JobDevicesComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<JobDevicesComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {}

	onCloseDialog() {
		this.dialogRef.close();
	}
}
