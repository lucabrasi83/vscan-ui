import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OndemandScanComponent } from "./ondemand-scan.component";

describe("OndemandScanComponent", () => {
	let component: OndemandScanComponent;
	let fixture: ComponentFixture<OndemandScanComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OndemandScanComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OndemandScanComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
