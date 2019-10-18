import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { webSocket } from "rxjs/webSocket";
import { DialogData } from "../device-vuln-details/device-vuln-details.component";
import { environment } from "../../../../../environments/environment";
import { Md5 } from "ts-md5";
import { AuthService } from "../../../../core/auth/_services";
import { VscanApiService } from "../../../../core/vscan-api/vscan-api.service";
import { catchError } from "rxjs/operators";
import { of, throwError } from "rxjs";
import { ToastNotifService } from "../../../../core/_base/layout/services/toast-notif.service";

@Component({
	selector: "vscan-vscan-scan",
	templateUrl: "./vscan-scan.component.html",
	styleUrls: ["./vscan-scan.component.scss"]
})
export class VscanScanComponent implements OnInit, OnDestroy {
	// Unique Hash to generate for log file stream request
	hash: string | Int32Array = this.generateLogStreamHash();

	wsURL = `wss://vulscano.vsnl.co.in:8443/api/v1/jobs/ws?token=${localStorage.getItem(
		environment.vscanJWT
	)}&logFileRequestHash=${this.hash}`;
	subject = webSocket({ url: this.wsURL, deserializer: ({ data }) => data });
	loading = true;

	constructor(
		public dialogRef: MatDialogRef<VscanScanComponent>,
		private auth: AuthService,
		private vscan: VscanApiService,
		private toastNotif: ToastNotifService,
		@Inject(MAT_DIALOG_DATA) public data: DialogData
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}

	ngOnInit() {
		setTimeout(() => {
			this.loading = false;
		}, 3000);

		console.log(`Hash is ${this.hash}`);

		this.vscan
			.launchAdHocScan(this.hash)
			.pipe(
				catchError(err => {
					this.toastNotif.errorToastNotif(err, "Scan Job failed");
					return of(err);
				})
			)
			.subscribe(msg => console.log(JSON.stringify(msg)));
	}

	ngOnDestroy(): void {
		this.subject.next(null);
		this.subject.unsubscribe();
	}

	private generateLogStreamHash(): string | Int32Array {
		// Generate Hash based on user email and current date/time
		return Md5.hashStr(
			this.auth.getUserTokenField("email") + Date.now().toLocaleString()
		);
	}
}
