import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VscanUsersComponent } from "./vscan-users.component";

describe("UsersComponent", () => {
	let component: VscanUsersComponent;
	let fixture: ComponentFixture<VscanUsersComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VscanUsersComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VscanUsersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
