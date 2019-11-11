import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EditEnterpriseComponent } from "./edit-enterprise.component";

describe("EditEnterpriseComponent", () => {
	let component: EditEnterpriseComponent;
	let fixture: ComponentFixture<EditEnterpriseComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EditEnterpriseComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditEnterpriseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
