import { Component, OnInit } from "@angular/core";
import { ToastNotifService } from "../../../core/_base/layout/services/toast-notif.service";

@Component({
	selector: "vscan-devices",
	templateUrl: "./vscan-devices.component.html",
	styleUrls: ["./vscan-devices.component.scss"]
})
export class VscanDevicesComponent implements OnInit {
	constructor(private toastNotif: ToastNotifService) {}

	ngOnInit() {}

	showSuccess() {
		this.toastNotif.successToastNotif("This is a success", "Success");
		this.toastNotif.infoToastNotif("This is an info", "Info");
	}
}
