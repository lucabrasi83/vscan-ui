import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CountdownComponent } from "ngx-countdown";

@Component({
	selector: "vscan-refresh-session",
	templateUrl: "./refresh-session.component.html",
	styleUrls: ["./refresh-session.component.scss"]
})
export class RefreshSessionComponent implements OnInit {
	@ViewChild("cd", { static: false }) private countdown: CountdownComponent;

	constructor(
		public dialogRef: MatDialogRef<RefreshSessionComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {}

	handleEvent($event) {
		if ($event.status === 3) {
			this.dialogRef.close(false);
		}
	}
	onRefreshSession() {
		this.dialogRef.close(true);
	}
	onIgnoreWarning() {
		this.dialogRef.close(false);
	}
}
