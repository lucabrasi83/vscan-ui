import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DeviceVulnDetailsComponent } from "./device-vuln-details.component";

describe("DeviceVulnDetailsComponent", () => {
	let component: DeviceVulnDetailsComponent;
	let fixture: ComponentFixture<DeviceVulnDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DeviceVulnDetailsComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DeviceVulnDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
