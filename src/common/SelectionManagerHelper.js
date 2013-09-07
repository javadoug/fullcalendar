/*jslint browser: true, indent: 4, todo: true */
/*globals jQuery, $, HoverListener */
/**
* SUC: click should clear selection
* SUC: drag outside of calendar canvas selects text
**/
function SelectionManagerHelper(viewSelectionMousedown) {

    "use strict";

    var t, opt, MOUSE, offsetAdjustment, $body, $doc;

    t = this;

    // imports
    opt = t.opt;


    // locals
    MOUSE = {X: "pageX", Y: "pageY"};
    offsetAdjustment = $(t.element).offset();
    $body = $("body");
    $doc = $(document);

    // adjust pageX/Y for t.element's position
    function offset(x, y) {
        return {x: x - offsetAdjustment.left, y: y - offsetAdjustment.top};
    }

    function findOrCreateDiv(className) {
        var div = $("." + className);
        if (div.length) {
            return div;
        }
        return $("<div>").addClass(className).appendTo(t.element);
    }

    // return segment container based on current view
    function getSegmentContainer() {
        var $container;
        if (t.getSlotSegmentContainer) {
            $container = t.getSlotSegmentContainer();
        }
        $container = t.getDaySegmentContainer();
        return $container.parents(".fc-view");
    }

    // return fc events in current view
    function getAllEvents() {
        return getSegmentContainer().find(".fc-event");
    }

    // draw lasso in calendar
    function selectEvents(jqEvent) {

        var mouseDownCoord, hoverListener, clearSelection;

        clearSelection = true;

        // store the coordinates of the mouse on start selection
        mouseDownCoord = offset(jqEvent[MOUSE.X], jqEvent[MOUSE.Y]);

        function preventDefault(jqEvent) {
            jqEvent.preventDefault();
            return false;
        }

        // given lasso rectangle select intersecting segments
        function selectEvents(lasso) {
            getAllEvents().each(function () {
                var segment, position, startCoord;
                position = $(this).offset();
                startCoord = offset(position.left, position.top);
                segment = {
                    start: startCoord,
                    stop: {
                        x: startCoord.x + $(this).outerWidth(),
                        y: startCoord.y + $(this).outerHeight()
                    }
                };
                if (lasso.intersects(segment)) {
                    clearSelection = false;
                    $(this).addClass("fc-event-selected ui-selected");
                } else {
                    $(this).removeClass("fc-event-selected ui-selected");                    
                }
            });
        }

        // render the lasso to mouse selection range
        function drawLasso(rectangle) {
            var css, width, height;
            width = Math.abs(rectangle.start.x - rectangle.stop.x);
            height = Math.abs(rectangle.start.y - rectangle.stop.y);
            css = {
                top: rectangle.start.y + "px",
                left: rectangle.start.x + "px",
                width: width + "px",
                height: height + "px"
            };
            findOrCreateDiv("fc-selection-lasso").css(css);
        }

        // handle mouse moving in all directions and draw lasso
        function onMousemove(jqEvent) {
            var rectangle, mouseMoveCoord;
            mouseMoveCoord = offset(jqEvent[MOUSE.X], jqEvent[MOUSE.Y]);
            rectangle = Rectangle.fromCoordinates(mouseDownCoord, mouseMoveCoord);
            drawLasso(rectangle);
            selectEvents(rectangle);
        }

        // destroy all events and clean up
        function onMouseup(jqEvent) {
            $doc.off(".fc-select-events.fc");
            $body.removeAttr("unselectable");
            $body.removeClass("fc-selecting-events");
            $(".fc-selection-lasso").remove();
            if (clearSelection) {
                getAllEvents().removeClass("fc-event-selected ui-selected");
            }
        }

        // notify ui is in select events mode
        $body.addClass("fc-selecting-events");
        // prevent text selection if drag mouse out of fc
        $body.attr("unselectable", "on");
        $body.on("selectstart.fc-select-events.fc", preventDefault);

        // initialize the mouse event handlers
        $doc.on("mouseup.fc-select-events.fc", onMouseup);
        $doc.on("mousemove.fc-select-events.fc", onMousemove);

    }

    function wrapSelectionMousedown(jqEvent) {
        if (opt("selectEvents")) {
            selectEvents(jqEvent);
        } else {
            viewSelectionMousedown(jqEvent);
        }
    }

    // exports
    return wrapSelectionMousedown;

}

var Rectangle = {

    /* given two coordinates determine upper left and bottom right coords */
    fromCoordinates: function coordinatesToRectangle(coord1, coord2, _map) {
        var start = {}, stop = {}, map = _map || {x: "x", y: "y"};
        start[map.x] = Math.min(coord1[map.x], coord2[map.x]),
        start[map.y] = Math.min(coord1[map.y], coord2[map.y]);
        stop[map.x] = Math.max(coord1[map.x], coord2[map.x]),
        stop[map.y] = Math.max(coord1[map.y], coord2[map.y]);
        return {start: start, stop: stop, intersects: 
            function(r2) {
                return Rectangle.rectanglesIntersect(this, r2);
            }
        };
    },

    /* given two rectangles determine if they intersect */
    rectanglesIntersect: function rectanglesIntersect(r1, r2) {
        var xIntersects, yIntersects;
        xIntersects = (r1.start.x < r2.stop.x && r2.start.x < r1.stop.x) || 
            (r2.start.x < r1.stop.x && r1.start.x < r2.stop.x);
        yIntersects = (r1.start.y < r2.stop.y && r2.start.y < r1.stop.y) || 
            (r2.start.y < r1.stop.y && r1.start.y < r2.stop.y);
        return yIntersects && xIntersects;
    }

}