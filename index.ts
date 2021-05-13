import { Calendar, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';


// Beginning of the workaround for this: https://github.com/fullcalendar/fullcalendar/blob/3e89de5d8206c32b6be326133b6787d54c6fd66c/packages/interaction/src/dnd/PointerDragging.ts#L306
const ctrlKeyDescriptor = Object.getOwnPropertyDescriptor(
  MouseEvent.prototype,
  'ctrlKey'
);

// Always return false for event.ctrlKey when event is of type MouseEvent
ctrlKeyDescriptor.get = function() {
  return false;
};

Object.defineProperty(MouseEvent.prototype, 'ctrlKey', ctrlKeyDescriptor);
// End of the workaround

let calendarEl: HTMLElement = document.getElementById('app')!;

let ctrlHeld = false;
['keydown', 'keyup'].forEach(x =>
  document.addEventListener(x, (e: KeyboardEvent) => (ctrlHeld = e.ctrlKey))
);

const extractEventProperties = ({ title, start, end, allDay }: EventInput) => ({
  title,
  start,
  end,
  allDay
});

let calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin, interactionPlugin],
  editable: true,
  droppable: true,
  eventDrop: e => {
    if (ctrlHeld) {
      e.revert();
      calendar.addEvent(extractEventProperties(e.event));
    }
  },
  events: [
    {
      title: 'event1',
      start: '2021-05-01'
    },
    {
      title: 'event2',
      start: '2021-05-02',
      end: '2021-05-02'
    },
    {
      title: 'event3',
      start: '2021-05-01',
      allDay: false // will make the time show
    }
  ]
});

calendar.render();
