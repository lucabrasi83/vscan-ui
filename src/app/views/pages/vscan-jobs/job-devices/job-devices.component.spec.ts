import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { JobDevicesComponent } from "./job-devices.component";

describe("JobDevicesComponent", () => {
	let component: JobDevicesComponent;
	let fixture: ComponentFixture<JobDevicesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [JobDevicesComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(JobDevicesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
