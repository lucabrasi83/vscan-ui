import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VscanEnterprisesComponent } from "./vscan-enterprises.component";

describe("EnterprisesComponent", () => {
	let component: VscanEnterprisesComponent;
	let fixture: ComponentFixture<VscanEnterprisesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VscanEnterprisesComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VscanEnterprisesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
