const TERM = 4640;
const API_KEY = '3F8EQB3ziTJkYOZb';

const API_ENDPOINT = 'http://api.asg.northwestern.edu';
// const LOCAL_ENDPOINT = 

var select_subject, $select_subject;
var select_course, $select_course;

$select_subject = $('#select-subject').selectize({
	delimiter: ',',
	maxItems: 1,
	valueField: 'symbol',
	searchField: 'symbol',
	options: [],
	create: false,
	render: {
		option: function(data, escape) {
			return '<div class="option">' +
					'<span class="title subjects">' + escape(data.name) + '</span>'
				'</div>';
		},
		item: function(data, escape) {
			return '<div class="item subjects">' + escape(data.name) + '</div>';
		}
	},
	load: function(query, callback) {
		if (!query.length) return callback();
		const url = 'http://localhost:8080/api/subjects';
		$.ajax({
			url: url,
			dataType: 'json',
			type: "GET",
			cache: false,
			success: function(data) {
				callback(data);
			},
			error: function(error) {
				console.log('Error : ', error);
				callback();
			}
		});
	},
	onChange: function(value) {
		console.log('wo', value);
		if (!value.length) return;
		select_course.disable();
		select_course.clearOptions();

		select_course.load(function(callback) {
			const url2 = 'http://localhost:8080/api/courses';
			$.ajax({
				url: url2,
				dataType: 'json',
				contentType: 'application/json',
				type: "POST",
				data: JSON.stringify({subjects: value}),
				success: function(data) {
					// console.log(data);
					const newData = [];
					data.forEach((course) => {
						course.obj = JSON.stringify(course);
						newData.push(course);
					});
					select_course.enable();
					console.log('newData', newData);
					callback(newData);
				},
				error: function(error) {
					console.log('Error : ', error);
					callback();
				}
			});
		});
	},
});

$select_course = $('#select-course').selectize({
	plugins: ['remove_button'],
	valueField: 'obj',
	labelField: 'title',
	searchField: ['title'],
	options: [],
	create: false,
	render: {
		option: function(data, escape) {
			return '<div class="option">' +
					'<span class="title subjects">' + (data.subject) + ' ' + (data.catalog_num) + ' : ' + escape(data.title) + '</span>' +
				'</div>';
		},
		item: function(data, escape) {
			return '<div class="item subjects">' + (data.subject) + ' ' + (data.catalog_num) + ' : ' + escape(data.title) + '</div>';
		}
	},
	onChange: function(value) {
		const data = [];
		value.forEach((val) => {
			data.push(JSON.parse(val));
		});
		console.log(data);

		calendarData = getCalendarData(data);

		$('#calendar').fullCalendar('removeEvents');
		$('#calendar').fullCalendar('addEventSource', calendarData);
		$('#calendar').fullCalendar('refetchEvents');

	},
});


select_subject = $select_subject[0].selectize;
select_course  = $select_course[0].selectize;

// {
// 	title: 'EECS202',
// 	start: '2016-11-02T11:30',
// 	end: '2016-11-02T14:50',
// 	allDay: false,
// },
function getCalendarData(data) {
	const calendarData = [];
	data.forEach((course) => {
		console.log('course', course);
		const meeting_days = [];
		var i;
		for (i = 0; i < course.meeting_days.length;) {
			const weekday = course.meeting_days.substring(i, i+2);
			meeting_days.push(weekdayToFullDate(weekday));
			i = i + 2;
		}

		meeting_days.forEach((day) => {
			const start = day + course.start_time;
			const end = day + course.end_time;

			calendarData.push({
				title: course.subject + ' ' + course.catalog_num,
				start: start,
				end: end,
				allDay: false,
			});
		});

	});

	console.log('calendarData', calendarData);
	return calendarData;
}

function loadAllSubjects() {
	// const url = API_ENDPOINT + '/subjects/' + '?' + 'key=' + API_KEY + '&' + 'term=' + TERM;
	const url = 'http://localhost:8080/api/subjects';
	$.ajax({
		url: url,
		dataType: 'json',
		type: "GET",
		cache: false,
		success: function(data) {
			console.log(data);
		},
		error: function(error) {
			console.log('Error : ', error);
		}
	});
}

weekdayToFullDate('Mo');
$(document).ready(function() {
	$('#calendar').fullCalendar({
		defaultView: 'agendaWeek',
		eventColor: '#408bed',
		overlap: true,
		eventSources: [
			[
				{
					title: 'EECS202',
					start: '2016-11-02T11:30',
					end: '2016-11-02T14:50',
					allDay: false,
				},
			  {
					start: '2016-11-03T11:30',
					end: '2016-11-03T14:50',
			    title: 'EECS302',
			    allDay: false,
			  },
			],
		],
		editable: false,
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
