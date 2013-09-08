describe("Select Events Selection Handler", function () {
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
