import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface DialogData {
	animal: string;
	name: string;
}

@Component({
	selector: "vscan-device-vuln-details",
	templateUrl: "./device-vuln-details.component.html",
	styleUrls: ["./device-vuln-details.component.scss"]
})
export class DeviceVulnDetailsComponent implements OnInit {
	loading = true;

	constructor(
		public dialogRef: MatDialogRef<DeviceVulnDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}

	ngOnInit() {
		setTimeout(() => {
			this.loading = false;
		}, 3000);
	}
}
