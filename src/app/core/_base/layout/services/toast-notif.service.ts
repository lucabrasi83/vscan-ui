import { Injectable } from "@angular/core";
import { ToastrService, IndividualConfig } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class ToastNotifService {
	toasterDefaults: Partial<IndividualConfig> = {
		progressBar: true,
		closeButton: true,
		extendedTimeOut: 3000,
		positionClass: "toast-top-center"
	};

	/**
	 * Service constructor
	 *
	 * @param toastr: ToastrService
	 */
	constructor(public toastr: ToastrService) {}

	successToastNotif(msg: string, title: string) {
		this.toastr.success(msg, title, this.toasterDefaults);
	}

	warningToastNotif(msg: string, title: string) {
		this.toastr.warning(msg, title, this.toasterDefaults);
	}

	errorToastNotif(msg: string, title: string) {
		this.toastr.error(msg, title, this.toasterDefaults);
	}

	infoToastNotif(msg: string, title: string) {
		this.toastr.info(msg, title, this.toasterDefaults);
	}
}
