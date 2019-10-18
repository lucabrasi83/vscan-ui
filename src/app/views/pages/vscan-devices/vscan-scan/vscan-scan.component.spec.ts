import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VscanScanComponent } from "./vscan-scan.component";

describe("VscanScanComponent", () => {
	let component: VscanScanComponent;
	let fixture: ComponentFixture<VscanScanComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VscanScanComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VscanScanComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
