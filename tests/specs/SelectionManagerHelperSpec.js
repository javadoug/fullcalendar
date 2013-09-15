describe("Selection Manager Helper", function () {

	var optSpy, mousedownMock, selectionManagerMock, defaultSelectionHandlerSpy, eventsSelectionHandlerSpy;

	beforeEach(function () {
		optSpy = jasmine.createSpy('optSpy');
		// feature requires the shift key to select events
		mousedownMock = {fake: "mousedown event", shiftKey: true};
		selectionManagerMock = {opt: optSpy };
		eventsSelectionHandlerSpy = jasmine.createSpy('selectEventsSelectionHandlerSpy');
		selectionManagerMock.selectEventsSelectionHandler = function inject() {
			return eventsSelectionHandlerSpy;
		}
		defaultSelectionHandlerSpy = jasmine.createSpy('defaultSelectionHandlerSpy');
	});

	it("calls default selection handler when opt('selectEvents') is *not* defined", function () {
		// setup
		optSpy.andReturn(false);
		var mousedownSelectionHandler = SelectionManagerHelper.call(selectionManagerMock, defaultSelectionHandlerSpy);
		// fake mousedown event
		mousedownSelectionHandler(mousedownMock);
		// validate selection manager routes the event correctly
		expect(defaultSelectionHandlerSpy).toHaveBeenCalledWith(mousedownMock);
		expect(eventsSelectionHandlerSpy).not.toHaveBeenCalled();
	});

	it("calls Select-Events selection handler when opt('selectEvents') is defined", function () {
		// setup
		optSpy.andReturn(true);
		var mousedownSelectionHandler = SelectionManagerHelper.call(selectionManagerMock, defaultSelectionHandlerSpy);
		// fake mousedown event
		mousedownSelectionHandler(mousedownMock);
		// validate selection manager routes the event correctly
		expect(eventsSelectionHandlerSpy).toHaveBeenCalledWith(mousedownMock);
		expect(defaultSelectionHandlerSpy).not.toHaveBeenCalled();
		expect(optSpy).toHaveBeenCalledWith('selectEvents');
	});

});