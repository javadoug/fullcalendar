
function BasicEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.compileDaySegs = compileSegs; // for DayEventRenderer
	t.clearEvents = clearEvents;
	t.bindDaySeg = bindDaySeg;
	
	
	// imports
	DayEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	//var setOverflowHidden = t.setOverflowHidden;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var reportEvents = t.reportEvents;
	var reportEventClear = t.reportEventClear;
	var eventElementHandlers = t.eventElementHandlers;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventDrop = t.eventDrop;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var getHoverListener = t.getHoverListener;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var getRowCnt = t.getRowCnt;
	var getColCnt = t.getColCnt;
	var renderDaySegs = t.renderDaySegs;
	var resizableDayEvent = t.resizableDayEvent;
	
	
	
	/* Rendering
	--------------------------------------------------------------------*/
	
	
	function renderEvents(events, modifiedEventId) {
		reportEvents(events);
		renderDaySegs(compileSegs(events), modifiedEventId);
	}
	
	
	function clearEvents() {
		reportEventClear();
		getDaySegmentContainer().empty();
	}
	
	
	function compileSegs(events) {
		var rowCnt = getRowCnt(),
			colCnt = getColCnt(),
			d1 = cloneDate(t.visStart),
			d2 = addDays(cloneDate(d1), colCnt),
			visEventsEnds = $.map(events, exclEndDay),
			i, row,
			j, level,
			k, seg,
			segs=[];
		for (i=0; i<rowCnt; i++) {
			row = stackSegs(sliceSegs(events, visEventsEnds, d1, d2));
			for (j=0; j<row.length; j++) {
				level = row[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.row = i;
					seg.level = j; // not needed anymore
					segs.push(seg);
				}
			}
			addDays(d1, 7);
			addDays(d2, 7);
		}
		return segs;
	}
	
	
	function bindDaySeg(event, eventElement, seg) {
		if (isEventDraggable(event)) {
			draggableDayEvent(event, eventElement);
		}
		if (seg.isEnd && isEventResizable(event)) {
			resizableDayEvent(event, eventElement, seg);
		}
		eventElementHandlers(event, eventElement);
			// needs to be after, because resizableDayEvent might stopImmediatePropagation on click
	}
	
	
	
	/* Dragging
	----------------------------------------------------------------------------*/
	
	function draggableDayEvent(event, eventElement) {

		var selectedCache, dayDelta, hoverListener = getHoverListener();

		// enable selection, drag and drop of multiple events
		eventElement.data('fc:event', event);

		function getSelectedEventElements() {
			if (!selectedCache) {
				selectedCache = t.element.find(".fc-event.ui-draggable.ui-selected");
			}
			return selectedCache;
		}

		eventElement.draggable({
			zIndex: 9,
			delay: 50,
			// helper: 'clone',
			opacity: opt('dragOpacity'),
			revertDuration: opt('dragRevertDuration'),
			multiple: {
				items: getSelectedEventElements,
				beforeStart: function beforeDragMultipleStart(jqEvent, ui) {
				    // make sure target is selected, otherwise 
				    // clear selection and cancel dragging multiple
				    if (!(this.is('.fc-event') && this.is('.ui-draggable') && this.is('.ui-selected'))) {
				        $(".fc-event").removeClass('ui-selected');
				        selectedCache = null;
				        return false;
				    }
				}
			},
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				// TODO: need a better uix for unselected items affected by this drag operation
				hideEvents(event, eventElement);
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
					clearOverlays();
					if (cell) {
						//setOverflowHidden(true);
						dayDelta = rowDelta*7 + colDelta * (opt('isRTL') ? -1 : 1);
						renderDayOverlay(
							addDays(cloneDate(event.start), dayDelta),
							addDays(exclEndDay(event), dayDelta)
						);
					}else{
						//setOverflowHidden(false);
						dayDelta = 0;
					}
				}, ev, 'drag');
			},
			stop: function(ev, ui) {
				var update;
				hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
				// extract data first because eventDrop will sweep the dom clean
				update = (selectedCache || eventElement).map(function () {
					var $this = $(this);
					return {fcEvent: $this.data('fc:event'), element: $this};
				});
				// update the fc event instances and redraw the calendar
				update.each(function () {
					var fcEvent = this.fcEvent;
					if (dayDelta) {
						eventDrop(this.element, fcEvent, dayDelta, 0, fcEvent.allDay, ev, ui);
					} else {
						this.element.css('filter', ''); // clear IE opacity side-effects
						showEvents(fcEvent, this.element);
					}
				});
				// clear the selection cache
				selectedCache = null;
			}
		});
	}


}
