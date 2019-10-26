import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VscanSshGatewaysComponent } from "./vscan-ssh-gateways.component";

describe("VscanSshGatewaysComponent", () => {
	let component: VscanSshGatewaysComponent;
	let fixture: ComponentFixture<VscanSshGatewaysComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VscanSshGatewaysComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VscanSshGatewaysComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
