import {
	Component,
	ElementRef,
	Inject,
	OnInit,
	ViewChild
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ClipboardService } from "ngx-clipboard";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
	selector: "vscan-job-logs",
	templateUrl: "./job-logs.component.html",
	styleUrls: ["./job-logs.component.scss"]
})
export class JobLogsComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<JobLogsComponent>,
		private _clipboardService: ClipboardService,
		private _snackBar: MatSnackBar,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	// Log Stream View
	@ViewChild("logStreamContent")
	logStreamContent: ElementRef;

	ngOnInit() {}
	onCloseDialog() {
		this.dialogRef.close();
	}

	onCopyLogContent() {
		this._clipboardService.copyFromContent(
			this.logStreamContent.nativeElement.textContent
		);
		this._snackBar.open("Logs copied to clipboard", "Dismiss", {
			duration: 3000
		});
	}
}
