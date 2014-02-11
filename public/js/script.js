$(document).ready(function(){

	document.oncontextmenu = function() {return false;};

  $(document).mousedown(function(e){
    if( e.button == 2 ) {
      // alert('Right mouse button!');

      var promise = $.post("/notify",
      	{ uploader_email: $("#uploader_email").data("value"),
      	  reader_email:   $("#reader_email").data("value"),
      	  doc_id: $("#doc_id").data("value")
      	});
      promise.done(function() {
      	socket.emit('remove', {id: doc_id})
        window.location =  window.location.origin + "/timeout"
        // return;
      	alert("This document is not for saving, only viewing.  The recipient has been notified that a save attempt was made.");
      })
      return false;
    }
    return true;
  });

	// TIMER

	//tell the database the document was opened
	var doc_id = $('#doc_id').data('value');
	console.log('doc_id is', doc_id);

	var socket = io.connect();
  socket.emit('database', {fileOpen:true, id:doc_id});

  socket.on('timer', function(data){
		function msToS (ms) {
			return ms / 1000;
		};

		function toHHMMSS (str) {
		    var sec_num = parseInt(str, 10); // don't forget the second param
		    var hours   = Math.floor(sec_num / 3600);
		    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		    var seconds = sec_num - (hours * 3600) - (minutes * 60);

		    if (hours   < 10) {hours   = "0"+hours;}
		    if (minutes < 10) {minutes = "0"+minutes;}
		    if (seconds < 10) {seconds = "0"+seconds;}

		    var time    = hours+':'+minutes+':'+seconds;

				return time;
		};

		var $countdown,
			incrementTime = 70;
			currentTime = data.duration;//miliseconds

		$(function() {

			$countdown = $('#countdown');
			console.log("inside of script.js")
			var timer = $.timer(updateTimer, incrementTime, true);

	    function updateTimer() {

	   		var timeString = toHHMMSS(String(msToS(currentTime)));
				$countdown.html(timeString);

		   	if (currentTime === 0) {
	        timer.stop();
	        	socket.emit('remove', {id: doc_id})
		        window.location = "http://ghostdrop.io/timeout"
		        return;
		    }

	      currentTime -= incrementTime;
	      if (currentTime < 0){ currentTime = 0; }
	    }
		});
	});

});



