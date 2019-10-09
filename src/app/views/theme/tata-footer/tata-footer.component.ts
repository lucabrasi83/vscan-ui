import { Component, OnInit } from "@angular/core";

@Component({
	selector: "kt-tata-footer",
	templateUrl: "./tata-footer.component.html",
	styleUrls: ["./tata-footer.component.scss"]
})
export class TataFooterComponent implements OnInit {
	today: number = Date.now();

	constructor() {}

	ngOnInit() {}
}
