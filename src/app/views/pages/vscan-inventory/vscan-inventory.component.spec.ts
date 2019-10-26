import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VscanInventoryComponent } from "./vscan-inventory.component";

describe("VscanInventoryComponent", () => {
	let component: VscanInventoryComponent;
	let fixture: ComponentFixture<VscanInventoryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VscanInventoryComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VscanInventoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
