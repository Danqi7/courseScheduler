$(document).ready(function() {
	$('#calendar').fullCalendar('today');
	$('#calendar').fullCalendar({
		header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,basicWeek,basicDay'
		},
		events: [
			{
				title: 'EECS202',
				start: '2016-09-08T11:30:00',
				end: '2016-09-08T14:30:00',
				allDay: false,
			},
		],
		editable: true,

	});
	// $('#todayButton').click(function(){
	// 	console.log('yo');
	// 	$('#calendar').fullCalendar('today');
	// });
});
