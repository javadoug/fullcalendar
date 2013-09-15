/*jslint browser: true, indent: 4, todo: true */
/*globals jQuery, $, HoverListener */
/**
* Special Use Cases:
* SUC1: click should clear selection
* SUC2: drag outside of calendar canvas should not select text
* SUC3: related segments should be selected as a group when one is selected, e.g. long events spanning days
* SUC4: support clone helper option
* SUC5: selection should stick after dragging and dropping events to a new date/time
**/
var Rectangle = {

    /* given two coordinates determine upper left and bottom right coords */
    fromCoordinates: function coordinatesToRectangle(coord1, coord2, mapXY) {
        "use strict";
        var start = {}, stop = {}, map = mapXY || {x: "x", y: "y"};
        start.x = Math.min(coord1[map.x], coord2[map.x]);
        start.y = Math.min(coord1[map.y], coord2[map.y]);
        stop.x = Math.max(coord1[map.x], coord2[map.x]);
        stop.y = Math.max(coord1[map.y], coord2[map.y]);
        return {
            start: start,
            stop: stop,
            intersects: function(r2) {
                return Rectangle.rectanglesIntersect(this, r2);
            }
        };
    },

    /* given two rectangles determine if they intersect */
    rectanglesIntersect: function rectanglesIntersect(r1, r2) {
        "use strict";
        var xIntersects, yIntersects;
        xIntersects = (r1.start.x < r2.stop.x && r2.start.x < r1.stop.x) ||
            (r2.start.x < r1.stop.x && r1.start.x < r2.stop.x);
        yIntersects = (r1.start.y < r2.stop.y && r2.start.y < r1.stop.y) ||
            (r2.start.y < r1.stop.y && r1.start.y < r2.stop.y);
        return yIntersects && xIntersects;
    }

};

function SelectEventsSelectionHandler() {

    "use strict";

    var t, opt, MOUSE, $body, $doc, isEventDraggable;

    t = this;

    // imports
    opt = t.opt;
    isEventDraggable = t.isEventDraggable;

    // locals
    $body = $("body");
    $doc = $(document);
    MOUSE = {X: "pageX", Y: "pageY", lassoX: "clientX", lassoY: "clientY"};

    // lasso is fixed positioned and events are relative positioned
    function getMouseCoordinates(jqEvent) {
        return {
            x: jqEvent[MOUSE.X],
            y: jqEvent[MOUSE.Y],
            xLasso: jqEvent[MOUSE.lassoX],
            yLasso: jqEvent[MOUSE.lassoY]
        };
    }

    // return view container based on current view
    function getViewContainer() {
        return t.element;
    }

    // find or create temporary ui elements
    function findOrCreateDiv(className) {
        var div = $("." + className);
        if (div.length) {
            return div;
        }
        return $("<div>").addClass(className).appendTo(getViewContainer());
    }

    // return fc event containers in current view
    function getAllEvents() {
        return getViewContainer().find(".fc-event");
    }

    // draw lasso and highlight selected events
    function selectEventsInitiator(jqEvent) {

        var mouseDownCoord, clearSelection, addToSelection;

        // determine if the current selection should be cleared
        clearSelection = true;

        // determine if the current selection should be preserved
        addToSelection = false;

        // store the coordinates of the mouse on selection start
        mouseDownCoord = getMouseCoordinates(jqEvent);

        // prevent text selection handler
        function preventDefault(jqEvent) {
            jqEvent.preventDefault();
            return false;
        }

        // given lasso rectangle select intersecting segments
        function hightlighSelectedEvents(lasso) {
            getAllEvents().each(function () {
                var $this, event, segment, position, startCoord;
                $this = $(this);
                position = $this.offset();
                startCoord = {x: position.left, y: position.top};
                segment = {
                    start: startCoord,
                    stop: {
                        x: startCoord.x + $this.outerWidth(),
                        y: startCoord.y + $this.outerHeight()
                    }
                };
                if (lasso.intersects(segment)) {
                    clearSelection = false;
                    event = $this.data('fc:event');
                    if (isEventDraggable(event)) {
                        // TODO: make draggableDayEvent importable
                        // draggableDayEvent(event, this);
                        // eventElements only get draggable class when mouse-overed
                        $this.addClass('ui-draggable ui-selected');
                    } else {
                        $this.removeClass('ui-selected');
                    }
                } else if (!addToSelection) {
                    $this.removeClass('ui-selected');
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
            var lassoXYMap, rectangle, mouseMoveCoord;
            lassoXYMap = {x: 'xLasso', y: 'yLasso'};
            // user is adding selected items to current collection
            addToSelection = jqEvent.altKey;
            mouseMoveCoord = getMouseCoordinates(jqEvent);
            // lasso is based on a fixed position layout
            rectangle = Rectangle.fromCoordinates(mouseDownCoord, mouseMoveCoord, lassoXYMap);
            drawLasso(rectangle);
            // events are based on an absolute position layout
            rectangle = Rectangle.fromCoordinates(mouseDownCoord, mouseMoveCoord);
            hightlighSelectedEvents(rectangle);
        }

        // destroy all events and clean up
        function onMouseup() {
            $doc.off(".fc-select-events.fc");
            $body.removeAttr("unselectable");
            $body.removeClass("fc-selecting-events");
            $(".fc-selection-lasso").remove();
            if (clearSelection) {
                getAllEvents().removeClass('ui-selected');
            }
            $body.off("selectstart.fc-select-events.fc");
        }

        // prevent text selection if drag mouses out of fc
        $body.addClass("fc-selecting-events");
        $body.attr("unselectable", "on");
        $body.on("selectstart.fc-select-events.fc", preventDefault);

        // initialize the mouse event handlers
        $doc.on("mouseup.fc-select-events.fc", onMouseup);
        $doc.on("mousemove.fc-select-events.fc", onMousemove);

    }

    // handle clicking on an event
    function onEventClick(jqEvent) {
        if (!opt('selectEvents')) {
            return;
        }
        jqEvent.stopPropagation();
        if (!jqEvent.shiftKey) {
            return;
        }
        var segment = $(jqEvent.currentTarget);
        if (segment.is('.ui-selected')) {
            segment.removeClass('ui-selected');
        } else {
            segment.addClass('ui-selected');
        }
        return false;
    }

    function onCalendarClick(jqEvent) {
         if (!opt('selectEvents')) {
            return;
        }
        getAllEvents().removeClass('ui-selected');
    }

    function onEscapeKeyUp(jqEvent) {
        if (jqEvent.which === $.ui.keyCode.ESCAPE) {
            $(jqEvent.currentTarget).find('.fc-event').removeClass('ui-selected');
        }
    }

    // fc-event listeners to clear or append to selection
    $body.off(".fc-select-events.fc");
    $body.on("keyup.fc-select-events.fc", onEscapeKeyUp);
    $body.on("click.fc-select-events.fc", onCalendarClick);
    $body.on("click.fc-select-events.fc", '.fc-event', onEventClick);

    // exports
    return selectEventsInitiator;

}
