var d = new Date;
console.log('ha', getISOSDate(d));
console.log('ymd', getYearMonthDay(getISOSDate(d)));
console.log('map', mapToWeeklyTime('F10-10:50'));
// console.log('yo', n.concat('11:30:00'));
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
				start: '2016-09-10T11:30',
				end: '2016-09-10T14:50',
				allDay: false,
			},
		],
		editable: true,
		timeFormat: 'H(:mm)'
	});
	// $('#todayButton').click(function(){
	// 	console.log('yo');
	// 	$('#calendar').fullCalendar('today');
	// });
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

// map input time to the final ISOString time
// time in format such as: M10-10:50
function mapToWeeklyTime(time) {
	const currentWeekday = new Date().getDay();
	// sunday is mapped to 0, convert it to 7 for computation
	if (currentWeekday === 0) {
		currentWeekday = 7;
	}
	const weekdays = {
		'M': 1,
		'Tu': 2,
		'W': 3,
		'Th': 4,
		'F': 5,
	}
	let realDate = new Date;
	let i = 0;
	while (i < time.length){
		if (parseInt(time[i])) {
			weekday = time.substring(0,i);
			//map to this weekday to real date
			const diff = currentWeekday - weekdays[weekday];

			realDate.setDate(realDate.getDate() - diff);
			realDate = getISOSDate(realDate);

			break;
		}
		i++;
	}

	//hour in form of 10-10:50, 9-9:50
	const hour = time.substring(i);
	let cnt = 0;
	let index = 0;
	while (index < hour.length) {
		if (hour[index] === '-') {
			if (hour.substring(0, index).indexOf(':') > 0) {

			}
		}
		index++;
	}

	return realDate
}

// 10-10:50 => 10:00-10:50
function getStartEnd(hour) {
	let index = 0;
	while (index < hour.length) {
		if (hour[index] === '-') {
			const start = hour.substring(0, index);
			const end = hour.substring(index+1);
			break;
		}
		index++;
	}

	return {
		'start': getFormattedHour(start),
		'end': getFormattedHour(end),
	};

}

// hour: 9:00, 9, 10:50
function getFormattedHour(hour) {
	let res;
	const zero = '0';
	const index = hour.indexOf(':');
	if (index > 0) {
		if (hour.substring(0, index).length === 1) {
			res = zero.concat(hour.substring(0, index));
		}
	}
}

function getYearMonthDay(ISOTime) {
	let counter = 0;
	let index = 0;
	let year;
	let month;
	let day;
	while (counter < 2 && index < ISOTime.length) {
		if (ISOTime[index] === '-') {
			counter++;
		}
		if (ISOTime[index] === '-' && counter === 1) {
			year = ISOTime.substring(0, index);
		}
		if (ISOTime[index] === '-' && counter === 2) {
			month = ISOTime.substring(index-2, index);
			day = ISOTime.substring(index+1, index+3);
		}
		index++;
	}

	return {
		'year': year,
		'month': month,
		'day': day,
	};
}
