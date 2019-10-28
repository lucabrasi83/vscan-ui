import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DeviceCredsEditComponent } from "./device-creds-edit.component";

describe("DeviceCredsEditComponent", () => {
	let component: DeviceCredsEditComponent;
	let fixture: ComponentFixture<DeviceCredsEditComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DeviceCredsEditComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DeviceCredsEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
