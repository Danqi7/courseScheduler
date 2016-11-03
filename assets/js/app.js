const TERM = 4640;
const API_KEY = '3F8EQB3ziTJkYOZb';

const API_ENDPOINT = 'http://api.asg.northwestern.edu';

var select_subject, $select_subject;
var select_course, $select_course;

$select_subject = $('#select-subject').selectize({
	plugins: ['remove_button'],
	delimiter: ',',
	maxItems: 5,
	valueField: 'symbol',
	searchField: 'symbol',
	options: [],
	create: false,
	render: {
		option: function(data, escape) {
			console.log('options: ', data);
			return '<div class="option">' +
					'<span class="title">' + escape(data.name) + '</span>' +
				'</div>';
		},
		item: function(data, escape) {
			return '<div class="item">' + escape(data.name) + '</div>';
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
					console.log(data);
					// callback(data);
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
	valueField: 'name',
	labelField: 'name',
	searchField: ['name']
});


select_subject = $select_subject[0].selectize;
select_course  = $select_course[0].selectize;


function loadAllSubjects() {
	// const url = API_ENDPOINT + '/subjects/' + '?' + 'key=' + API_KEY + '&' + 'term=' + TERM;
	const url = 'http://localhost:8080/api/subjects';
	$.ajax({
		url: url,
		dataType: 'json',
		type: "GET",
		cache: false,
		success: function(data) {
			console.log('yooo', data);
		},
		error: function(error) {
			console.log('Error : ', error);
		}
	});
	// $.getJSON(url, function(data) {
	// 	console.log(data);
	// });
}
loadAllSubjects();





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
