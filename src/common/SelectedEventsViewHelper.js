/*jslint browser: true, indent: 4, todo: true */
/*globals jQuery, $, addMinutes, cloneDate, formatDates */
function SelectedEventsViewHelper(eventElement) {

    "use strict";

    var t, opt, exports, selectedCache, selectedUpdateCache;

    // imports
    t = this;// the view
    opt = t.opt;

    // get any events that have been selected by user
    function getSelectedEventElements() {
        if (!selectedCache) {
            selectedCache = t.element.find(".fc-event.ui-draggable.ui-selected");
        }
        return selectedCache;
    }

    // get selected events otherwise return target
    function getActiveSelection() {
        var selection;
        if (selectedUpdateCache) {
            return selectedUpdateCache;
        }
        if (getSelectedEventElements().length) {
            selection = selectedCache;
        } else {
            selection = eventElement;
        }
        // cache the selection and update routines for speed / code reuse
        selectedUpdateCache = selection.map(function () {
            var newStart, newEnd, element = $(this);
            return {
                eventElement: element,
                event: element.data('fc:event'),
                origWidth: element.outerWidth(),
                timeElement: element.find('.fc-event-time'),
                // methods used by agenda view
                updateTimeText: function (minuteDelta) {
                    newStart = addMinutes(cloneDate(this.event.start), minuteDelta);
                    if (this.event.end) {
                        newEnd = addMinutes(cloneDate(this.event.end), minuteDelta);
                    }
                    this.timeElement.text(formatDates(newStart, newEnd, opt('timeFormat')));
                },
                resetElement: function (allDay, colWidth, slotHeight) {
                    // convert back to original slot-event
                    var grid, reset, draggable;
                    grid = null;
                    reset = this;
                    draggable = reset.eventElement.data('draggable');
                    if (allDay) {
                        grid = null;
                        reset.event.allDay = true;
                        reset.timeElement.show();
                        reset.eventElement.width(this.origWidth).height('');
                    } else {
                        grid = [colWidth, slotHeight];
                        reset.event.allDay = false;
                        reset.timeElement.css('display', ''); // show() was causing display=inline
                    }
                    if (draggable) {
                        // selected events may not have been initialized so ignore them
                        reset.eventElement.draggable('option', 'grid', grid);
                    }
                }
            };
        });
        return selectedUpdateCache;
    }

    // exports
    exports = {

        // draggable.options.multiple settings
        multipleOptions: {
            items: getSelectedEventElements,
            beforeStart: function beforeDragMultipleStart() {
                // make sure target is selected, otherwise
                // clear selection and cancel dragging multiple
                if (!(this.is('.fc-event') && this.is('.ui-draggable') && this.is('.ui-selected'))) {
                    $(".fc-event").removeClass('ui-selected');
                    exports.clearSelectionCache();
                    return false;
                }
            }
        },

        // clear cache after draggable.stop and all events have been updated
        clearSelectionCache: function () {
            selectedCache = null;
            selectedUpdateCache = null;
        },

        // get the current selection or target durring
        // draggable.start, draggable.drag, draggable.stop
        getSelection: getActiveSelection

    };

    return exports;

}