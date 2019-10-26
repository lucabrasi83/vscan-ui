import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VscanJobsComponent } from "./vscan-jobs.component";

describe("VscanJobsComponent", () => {
	let component: VscanJobsComponent;
	let fixture: ComponentFixture<VscanJobsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VscanJobsComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VscanJobsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
