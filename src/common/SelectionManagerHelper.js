/*jslint browser: true, indent: 4, todo: true */
/*globals SelectEventsSelectionHandler */
function SelectionManagerHelper(defaultSelectionHandler) {

    "use strict";

    var t, opt, eventsSelectionHandler, selectEventsSelectionHandler;

    // imports
    t = this;
    opt = t.opt;
    selectEventsSelectionHandler = t.selectEventsSelectionHandler;

    // initialize event selection handler
    eventsSelectionHandler = selectEventsSelectionHandler.call(t);

    // exports
    function mousedownSelectionHandler(jqEvent) {
        if (opt("selectEvents")) {
            eventsSelectionHandler(jqEvent);
        } else {
            defaultSelectionHandler(jqEvent);
        }
    }

    return mousedownSelectionHandler;

}