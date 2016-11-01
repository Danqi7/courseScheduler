weekdayToFullDate('Mo');
$(document).ready(function() {
	$('#calendar').fullCalendar('today');
	$('#calendar').fullCalendar({
		header: {
				left: 'prev,next today',
				center: 'yo',
				right: 'month,basicWeek,basicDay',
		},
		defaultView: 'agendaWeek',
		events: [
			{
				title: 'EECS202',
				start: '2016-11-02T11:30',
				end: '2016-11-02T14:50',
				allDay: false,
			},
      {
        title: 'EECS302',
        start: '2016-11-03T11:30',
        end: '2016-11-03T14:50',
        allDay: false,
      },
		],
		editable: true,
		timeFormat: 'H(:mm)'
	});
});

// get current date in ISOString format
function getISOSDate(time) {
	const tzoffset = (new Date()).getTimezoneOffset() * 60000;
	const localISOTime = (new Date(time - tzoffset)).toISOString().slice(0,-1);
	let ISOSDate;
	for (var i = 0; i < localISOTime.length; i++) {
		if (localISOTime[i] === 'T') {
			ISOSDate = localISOTime.substring(0, i + 1);
		}
	}
	return ISOSDate;
}

//input in format of 'Th'
function weekdayToFullDate(weekday) {
  const weekdays = {
    Mo: 1,
    Tu: 2,
    We: 3,
    Th: 4,
    Fr: 5,
  };

  const d = new Date();
  const today = d.getDay();
  const diff = weekdays[weekday] - today;

  d.setDate(d.getDate() + diff);
  const fullDate = getISOSDate(d);
  console.log(fullDate);

  return fullDate;
}
