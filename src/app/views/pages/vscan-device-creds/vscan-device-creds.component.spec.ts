import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VscanDeviceCredsComponent } from "./vscan-device-creds.component";

describe("VscanDeviceCredsComponent", () => {
	let component: VscanDeviceCredsComponent;
	let fixture: ComponentFixture<VscanDeviceCredsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VscanDeviceCredsComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VscanDeviceCredsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
