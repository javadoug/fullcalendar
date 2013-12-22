describe("Select Events Selection Handler", function () {
	describe("SelectEventsSelectionHandler", function () {
		var lasso, element, optSpy, triggerSpy, mouseDownMock, mouseMoveMock, selectEventsHandler, eventsSelectionHandlerMock;
		beforeEach(function () {
			// mock calendar ui
			element = $('<div id="test-calendar"></div>').appendTo('body');
			// mock lasso ui
			lasso = $('<div class="fc-selection-lasso"></div>').appendTo(element);
			// lasso must account for position of the calendar
			element.css({
				position: 'absolute',
				top: '20px',
				left: '20px',
				width: '100px',
				height: '100px',
				border: '2px solid red'
			});
			mouseDownMock = $.Event('mousedown');
			mouseDownMock.pageX = 20;//relative 0px
			mouseDownMock.pageY = 20;
			mouseMoveMock = $.Event('mousemove');
			mouseMoveMock.pageX = 50;//relative 30px
			mouseMoveMock.pageY = 50;
			optSpy = jasmine.createSpy('optSpy');
			optSpy.andReturn(true);
			triggerSpy = jasmine.createSpy('triggerSpy');
			eventsSelectionHandlerMock = {
                opt: optSpy,
                trigger: triggerSpy,
                isEventDraggable: jasmine.createSpy('isEventDraggableSpy')
            };
			eventsSelectionHandlerMock.element = element;
			eventsSelectionHandlerMock.isEventDraggable.andReturn(true);
			selectEventsHandler = SelectEventsSelectionHandler.call(eventsSelectionHandlerMock);
			element.on('mousedown.test.fc', selectEventsHandler);
		});
		afterEach(function () {
			// and then clean up event handlers
			element.trigger($.Event('mouseup'));
			element.remove();
			$('body').off('.fc');
			$(document).off('.fc');
		});
		it("adds 'fc-selecting-events' class to body when dragging starts on calendar", function () {
			// setup
			element.trigger(mouseDownMock);
			expect($('body').is('.fc-selecting-events')).toBeTruthy();
			// and then clean up event handlers
			element.trigger($.Event('mouseup'));
		});
		describe("drawLasso", function () {
			it("paints a lasso based on mousedown and mousemove events", function () {
				// setup
				element.trigger(mouseDownMock);
				element.trigger(mouseMoveMock);
				// validate
				var position = lasso.position();
				position.width = lasso.outerWidth();
				position.height = lasso.outerHeight();
				expect(position).toInclude({top: 0, left: 0, width: 30, height: 30});
				// and then clean up event handlers
				element.trigger($.Event('mouseup'));
			});
			it("paints a lasso if mouse starts from bottom right side of calendar", function () {
				// setup
				mouseDownMock.pageX = 120;//relative 100px
				mouseDownMock.pageY = 120;
				mouseMoveMock.pageX = 50;//relative 30px
				mouseMoveMock.pageY = 50;
				element.trigger(mouseDownMock);
				element.trigger(mouseMoveMock);
				// validate
				var position = lasso.position();
				position.width = lasso.outerWidth();
				position.height = lasso.outerHeight();
				expect(position).toInclude({top: 30, left: 30, width: 70, height: 70});
				// and then clean up event handlers
				element.trigger($.Event('mouseup'));
			});
		});
		describe("select events", function () {
			var events;
			beforeEach(function () {
				var css = {position: 'absolute', border: '1px solid green'};
				events = [];
				css.width = '20px';
				css.height = '20px';
				events.push($('<div class="fc-event"></div>').appendTo(element));
				events.push($('<div class="fc-event"></div>').appendTo(element));
				events.push($('<div class="fc-event"></div>').appendTo(element));
				css.top = '2px';
				css.left = '2px';
				events[0].css(css);
				css.top = '40px';
				css.left = '24px';
				events[1].css(css);
				css.top = '80px';
				css.left = '48px';
				events[2].css(css);
			});
			it("selects '.fc-event' elements that intersect with the lasso", function () {
				var position, selected;
				// setup: select one event
				element.trigger(mouseDownMock);
				element.trigger(mouseMoveMock);
				// validate
				selected = element.find(".ui-selected");
				expect(selected.length).toEqual(1);
				position = selected.position();
				position.width = selected.outerWidth();
				position.height = selected.outerHeight();
				expect(position).toInclude({top: 2, left: 2, width: 20, height: 20});
				// setup: select all three events
				mouseMoveMock.pageX = 90;//relative 70px
				mouseMoveMock.pageY = 103;//relative 83px
				element.trigger(mouseMoveMock);
				// validate
				selected = element.find(".ui-selected");
				expect(selected.length).toEqual(3);
				// and then clean up event handlers
				element.trigger($.Event('mouseup'));
			});
			it("unselects '.fc-event.ui-selected' elements that intersect with the lasso", function () {
				var position, selected;
				// setup: select all three events
				mouseDownMock.pageX = 20;
				mouseDownMock.pageY = 20;
				element.trigger(mouseDownMock);
				mouseMoveMock.pageX = 90;//relative 70px
				mouseMoveMock.pageY = 103;//relative 83px
				element.trigger(mouseMoveMock);
				// validate
				selected = element.find(".ui-selected");
				expect(selected.length).toEqual(3);
				// and then clean up event handlers
				element.trigger($.Event('mouseup'));
				// setup: deselect one event
				mouseDownMock.pageX = 20;//relative 0px
				mouseDownMock.pageY = 20;
				element.trigger(mouseDownMock);
				mouseMoveMock.pageX = 80;//relative 10px
				mouseMoveMock.pageY = 80;
				element.trigger(mouseMoveMock);
				// validate
				selected = element.find(".ui-selected");
				expect(selected.length).toEqual(2);
			});
			describe("shift + click events to update selection", function () {
				beforeEach(function () {
					eventsSelectionHandlerMock.trigger = jasmine.createSpy('triggerSpy');
				});
				it("selects '.fc-event' elements when clicked with shift key held", function () {
					var clickEvent = $.Event('click');
					// setup: click on two events
					clickEvent.shiftKey = true;
					events[0].trigger(clickEvent);
					clickEvent = $.Event('click');
					clickEvent.shiftKey = true;
					events[1].trigger(clickEvent);
					// validate
					selected = element.find(".ui-selected");
					expect(selected.length).toBe(2);
				});
				it("unselects '.fc-event.ui-selected' elements when clicked with shift key held", function () {
					var clickEvent = $.Event('click');
					// setup: click same event twice
					clickEvent.shiftKey = true;
					events[0].trigger(clickEvent);
					clickEvent = $.Event('click');
					clickEvent.shiftKey = true;
					events[0].trigger(clickEvent);
					// validate
					selected = element.find(".ui-selected");
					expect(selected.length).toBe(0);
				});
				it("triggers the fc:selectEventsSelecting event when adding an element", function () {
					var eventMock, clickEvent = $.Event('click');
					// setup: click on one event
					clickEvent.shiftKey = true;
					eventMock = {className : [ '', 'ui-selected', 'ui-draggable' ]};
					$(events[0]).data('fc:event', eventMock);
					events[0].trigger(clickEvent);
					// validate: the event callback was triggered
					expect(triggerSpy).toHaveBeenCalledWith('selectEventsSelecting', eventMock, jasmine.any(Object));
				});
				it("triggers the fc:selectEventsUnelecting event when removing an element", function () {
					var eventMock, clickEvent = $.Event('click');
					eventMock = {className : [ '', 'ui-selected', 'ui-draggable' ]};
					$(events[0]).data('fc:event', eventMock);
					// setup: click same event twice
					clickEvent.shiftKey = true;
					events[0].trigger(clickEvent);
					clickEvent = $.Event('click');
					clickEvent.shiftKey = true;
					events[0].trigger(clickEvent);
					// validate: the event callback was triggered
					expect(triggerSpy).toHaveBeenCalledWith('selectEventsUnselecting', eventMock, jasmine.any(Object));
				});
			});
			describe("deselection features", function () {
				beforeEach(function () {
					events[0].addClass('ui-selected');
					events[2].addClass('ui-selected');
				});
				it("clicking on body deselects all selected items", function () {
					var clickEvent = $.Event('click');
					$('body').trigger(clickEvent);
					// validate
					selected = element.find(".ui-selected");
					expect(selected.length).toBe(0);
				});
				it("pressing ESC key deselects all selected items", function () {
					var keypressEvent = $.Event('keyup', {which: $.ui.keyCode.ESCAPE});
					$('body').trigger(keypressEvent);
					// validate
					selected = element.find(".ui-selected");
					expect(selected.length).toBe(0);
				});
				it("triggers fc:selectEventsUnselecting when events are unselected", function () {
					var keypressEvent = $.Event('keyup', {which: $.ui.keyCode.ESCAPE});
					$('body').trigger(keypressEvent);
					// validate: the event callback was triggered
					expect(triggerSpy).toHaveBeenCalledWith('selectEventsUnselecting', undefined, jasmine.any(Object));
				});
				it("triggers fc:selectEventsStop after events are unselected", function () {
					var keypressEvent = $.Event('keyup', {which: $.ui.keyCode.ESCAPE});
					$('body').trigger(keypressEvent);
					// validate: the event callback was triggered
					expect(triggerSpy).toHaveBeenCalledWith('selectEventsStop', jasmine.any($.Event));
				});
				describe("when nothing is selected", function () {
					beforeEach(function () {
						events[0].removeClass('ui-selected');
						events[1].removeClass('ui-selected');
						events[2].removeClass('ui-selected');
					});
					it("does not trigger fc:selectEventsUnselecting", function () {
						var keypressEvent = $.Event('keyup', {which: $.ui.keyCode.ESCAPE});
						$('.fc-event.ui-selected').removeClass('ui-selected');
						$('body').trigger(keypressEvent);
						// validate: the event callback was triggered
						expect(triggerSpy).not.toHaveBeenCalledWith('selectEventsUnselecting', undefined, jasmine.any(Object));
					});
					it("does not trigger fc:selectEventsStop", function () {
						var keypressEvent = $.Event('keyup', {which: $.ui.keyCode.ESCAPE});
						$('body').trigger(keypressEvent);
						// validate: the event callback was triggered
						expect(triggerSpy).not.toHaveBeenCalledWith('selectEventsStop', jasmine.any($.Event));
					});
				});
			});
		});
	});
	describe("Rectangle", function() {
		var coord1, coord2, rectangle1;
		beforeEach(function () {
			coord1 = {x: 50, y: 50};
			coord2 = {x: 100, y: 100};
			rectangle1 = {start: coord1, stop: coord2};
		});
		describe("fromCoordinates", function () {
			it("creates an object given two coordinates", function () {
				expect(Rectangle.fromCoordinates(coord1, coord2)).toInclude(rectangle1)
			});
			it("normalizes the coordinates to top left and bottom right", function () {
				expect(Rectangle.fromCoordinates(coord2, coord1)).toInclude(rectangle1)
			});
			it("creates an object with start:{}, stop:{} and intersects()", function () {
				var result = Rectangle.fromCoordinates(coord2, coord1);
				expect(result.start).toBeDefined();
				expect(result.stop).toBeDefined();
				expect(result.intersects).toBeDefined();
			});
		});
		describe("rectanglesIntersect", function () {
			var start, stop, rectangle2;
			beforeEach(function () {
				start = {x: 50, y: 50};
				stop = {x: 100, y: 100};
				rectangle2 = {start: start, stop: stop};
				rectangle1 = Rectangle.fromCoordinates(coord2, coord1);
			});
			it("returns true when two rectangles intersect", function () {
				// both rectangles are identical
				expect(rectangle1).toIntersectWith(rectangle2);
				// move rectangle2 on the x axis inside of rectangle1
				start.x = 0;
				stop.x = 75;
				expect(rectangle1).toIntersectWith(rectangle2);
				start.x = 55;
				stop.x = 95;
				expect(rectangle1).toIntersectWith(rectangle2);
				start.x = 95;
				stop.x = 195;
				expect(rectangle1).toIntersectWith(rectangle2);
				// move rectangle2 on the y axis inside of rectangle1
				start.y = 0;
				stop.y = 75;
				expect(rectangle1).toIntersectWith(rectangle2);
				start.y = 55;
				stop.y = 95;
				expect(rectangle1).toIntersectWith(rectangle2);
				start.y = 95;
				stop.y = 195;
				expect(rectangle1).toIntersectWith(rectangle2);
			});
			it("returns false when two rectangles do NOT intersect", function () {
				// move rectangle2 on the x axis outside of rectangle1
				start.x = 0;
				stop.x = 0;
				expect(rectangle1).not.toIntersectWith(rectangle2);
				start.x = 101;
				stop.x = 101;
				expect(rectangle1).not.toIntersectWith(rectangle2);
				start.x = 50;
				stop.x = 100;
				// move rectangle2 on the y axis outside of rectangle1
				start.y = 0;
				stop.y = 0;
				expect(rectangle1).not.toIntersectWith(rectangle2);
				start.y = 101;
				stop.y = 101;
				expect(rectangle1).not.toIntersectWith(rectangle2);
			});
		});
	});
});