describe("options::dayClick<function(date, allDay, jsEvent, view)>", function () {
	var calendar;
	beforeEach(function () {
		calendar = $('<div>').attr('id', 'calendar').appendTo('body');
	});
	describe("when clicking on time slots in the agenda view", function () {
		var dayClick;
		beforeEach(function () {
			dayClick = function (date) {
				console.log(date);
			};
			calendar.fullCalendar({
				defaultView: 'agendaWeek',
				selectEvents: true,
				snapMinutes: 5,
				slotMinutes: 15,
				selectable: false,
				selectHelper: true,
				dayClick: dayClick
			});
		});
		it("sets the date parameter correctly", function () {
			var result, expected = new Date(2001, 0, 1, 8, 35, 0);
			result = 'Mon Jan 01 2001 08:35:00 GMT-0500 (EST)';
			calendar.simulate('click', {
				pageX: 100,
				pageY: 100
			});
			expect(result).toEqual(expected.toString());
		})
	});
});