let COURSES;

var temp = mapToWeeklyTimeArray("2-2:50 MTuWF")
loadCourses();

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
				start: '2016-09-12T11:30',
				end: '2016-09-12T14:50',
				allDay: false,
			},
		],
		editable: true,
		timeFormat: 'H(:mm)'
	});
});

function loadEventsFromSource() {
	const events = [];

	if (COURSES) {
		console.log("foo",COURSES);
		COURSES.forEach(function(course) {
			console.log(course)
			const weeklyTimes = mapToWeeklyTimeArray(course.time);
			weeklyTimes.forEach(function(weeklyTime) {
				events.push(getFormattedEvent(weeklyTime, course.title));
			});
		});
	}

	console.log(events);
}


function getFormattedEvent(weeklyTime, title) {
	const event = {
		title: title,
		start: weeklyTime.start,
		end: weeklyTime.end,
	};
}

//map input time loaded from server to the final ISOString time array
//@input time string in format such as : "2-2:50 MTuWF"
function mapToWeeklyTimeArray(time) {
	let i = 0;
	let hour;
	let day;
	const days = [];
	while (i < time.length) {
		if (time[i] === " ") {
			hour = time.substring(0,i);
			day = time.substring(i+1);
			break;
		}
		i++;
	}

  let index = i+1;
	while (index < time.length) {
		if (time[index] === "M") {
			days.push("M");
			index++;
		} else if (time[index] === "T") {
			if (index+1 < time.length && time[index+1] == 'u') {
				days.push("Tu");
			} else {
				days.push("Th");
			}
			index += 2;
		} else if (time[index] === "W") {
			days.push("W");
			index++;
		} else {
			days.push("F");
			index++;
		}
	}

	const weeklyTimes = days.map(function(day) {
		return mapToWeeklyTime(hour + " " + day);
	});

	console.log(weeklyTimes);
}

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
// @input time in format such as: 10-10:50 M
//
function mapToWeeklyTime(time) {
	let currentWeekday = new Date().getDay();
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
		if (time[i] === " ") {
			weekday = time.substring(i+1);
			//map to this weekday to real date
			const diff = currentWeekday - weekdays[weekday];

			realDate.setDate(realDate.getDate() - diff);
			realDate = getISOSDate(realDate);

			break;
		}
		i++;
	}

	//hour in form of 10-10:50, 9-9:50
	const hour = time.substring(0,i);
	const duration = getStartEnd(hour);
	if (parseInt(duration.start.substring(0,2)) > parseInt(duration.end.substring(0.2))) {
		convertToTwentyFourFormattedHour(hour);
		duration = getStartEnd(hour);
	}

	const weeklyTime = {
		start: realDate + duration.start,
		end: realDate + duration.end,
	}

	return weeklyTime;
}


// 7-10:00 => 7-22:00
function convertToTwentyFourFormattedHour(hour) {
	let index = 0;
	let start;
	let end = hour.length;
	while (index < hour.length) {
		if (hour[index] === '-') {
			start = index + 1;
		}

		if (start && hour[index] === ':') {
			end = index;
		}
	}
	const newEnd = parseInt(hour.substring(start, end-start)) + 12;
	hour.replace(hour.substring(start, end-start), newEnd.toString());
	console.log('hour')
}

// 10-10:50 => 10:00-10:50
function getStartEnd(hour) {
	let index = 0;
	let start;
	let end;
	while (index < hour.length) {
		if (hour[index] === '-') {
			start = hour.substring(0, index);
			end = hour.substring(index+1);
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
// hour should be range 8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,
function getFormattedHour(hour) {
	const TWLVE_HOURS = 12;
	const EARLIEST_CLASS = 8;
	let res = '';
	const zero = '0';
	const index = hour.indexOf(':');
	if (index > 0) { // has ":"
		let hourOfTime = parseInt(hour.substring(0, index));
		if (hourOfTime < EARLIEST_CLASS) { // < 8, add 12 hours, 5 => 17
			formattedHourOfTime = hourOfTime + TWLVE_HOURS;
			hour = hour.replace(hour.substring(0, index), formattedHourOfTime.toString());
		}
		if (hour.substring(0, index).length === 1) { // in form of 9:00
			res = zero.concat(hour); // 09:00
		}
		return hour;
	}

	// doesn't have ":"
	if (parseInt(hour) < EARLIEST_CLASS) {
		const temp = parseInt(hour) + TWLVE_HOURS;
		hour = temp.toString();
	}
	if (hour.length === 1 && parseInt(hour) < EARLIEST_CLASS) {
		res = zero.concat(hour);
	}

	return hour.concat(':00');
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

function loadCourses() {
	const url = "http://localhost:8080/api/courses";
	$.ajax({
		url: url,
		dataType: 'json',
		type: "GET",
		cache: false,
		success: function(data) {
			COURSES = data;
			console.log(COURSES);
			loadEventsFromSource();
		}
	});
}
