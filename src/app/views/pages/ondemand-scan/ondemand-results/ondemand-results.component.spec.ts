import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OndemandResultsComponent } from "./ondemand-results.component";

describe("OndemandResultsComponent", () => {
	let component: OndemandResultsComponent;
	let fixture: ComponentFixture<OndemandResultsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OndemandResultsComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OndemandResultsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
