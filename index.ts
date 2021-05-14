import { Calendar, EventApi, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';


// Beginning of the workaround for this: https://github.com/fullcalendar/fullcalendar/blob/3e89de5d8206c32b6be326133b6787d54c6fd66c/packages/interaction/src/dnd/PointerDragging.ts#L306
const ctrlKeyDescriptor = Object.getOwnPropertyDescriptor(
  MouseEvent.prototype,
  'ctrlKey'
);

// Always return false for event.ctrlKey when event is of type MouseEvent
ctrlKeyDescriptor.get = function () {
  return false;
};

Object.defineProperty(MouseEvent.prototype, 'ctrlKey', ctrlKeyDescriptor);
// End of the workaround

let calendarEl: HTMLElement = document.getElementById('app')!;

let ctrlHeld = false;
const [subscribe, unsubscribe] = (function () {
  let subscriptions: Function[] = [];
  ['keydown', 'keyup'].forEach(x =>
    document.addEventListener(x, (e: KeyboardEvent) => {
      // emit only when the key state has changed
      if (ctrlHeld !== e.ctrlKey)
        subscriptions.forEach(fun => fun(e.ctrlKey));

      ctrlHeld = e.ctrlKey;
    })
  );

  function subscribe (callback: Function) {
    subscriptions.push(callback);
  }

  function unsubscribe(callback: Function) {
    const index = subscriptions.indexOf(callback);
    subscriptions.splice(index, 1);
  }

  return [subscribe, unsubscribe];
})();

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
  eventDragStart: e => {
    let event: EventApi;
    const callback = (ctrlKey: boolean) => {
      if (ctrlKey) {
        event = calendar.addEvent(extractEventProperties(e.event));
      }
      else {
        event && event.remove();
      }
    }
    callback(ctrlHeld); // Handle the case when Ctrl is alread being held
    subscribe(callback); // Handle the case when Ctrl is being held or unheld during the drag
    e.event.setExtendedProp('callback', callback); // store the callback for further unsubscribe
  },
  eventDrop: e => unsubscribe(e.event.extendedProps['callback']), // stop listening when the event has been dropped
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
