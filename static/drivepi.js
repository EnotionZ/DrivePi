(function() {

	window.DrivePi = {};
	var debug = true;
	var mediaStream;

	var startVideo = function() {
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia;
		if(typeof navigator.getUserMedia !== 'function') return;
		navigator.getUserMedia({video: true, audio: false}, function(localMediaStream){
			mediaStream = localMediaStream;
			webrtcVideo.src = (window.URL || window.webkitURL).createObjectURL(localMediaStream);
		});

		webrtcVideo.addEventListener('loadeddata', function() {
			var videoRatio = webrtcVideo.videoHeight/webrtcVideo.videoWidth;
			var videoWidth = 300, videoHeight = videoWidth*videoRatio;
			var interval = 10, videoTimer;
			canvas.width = videoWidth;
			canvas.height = videoHeight;
			var ctx = canvas.getContext('2d');
			ctx.strokeStyle = '#ff0000';
			var initialArea;

			var processVideo = function() {
				ctx.drawImage(webrtcVideo, 0, 0, videoWidth, videoHeight);
				var c = ccv.detect_objects({
					canvas : (canvas),
					cascade : cascade,
					interval : interval,
					min_neighbors : 1
				});
				if(c.length) {
					if(!initialArea) initialArea = c[0].width*c[0].height;
					ctx.strokeRect(c[0].x, c[0].y, c[0].width, c[0].height);

					var normalizedTurnValue = (c[0].x-150)/10;
					turnRng.value = normalizedTurnValue;
					//driveRng.value = (c[0].width*c[0].height-initialArea)/initialArea;
				}
			};
			DrivePi.pause = function() { if(videoTimer) clearInterval(videoTimer); };
			DrivePi.play = function() {
				DrivePi.pause();
				videoTimer = setInterval(function() {
					if(mediaStream) processVideo();
				}, interval);
			};

			DrivePi.play();
			btnPlay.addEventListener('click', DrivePi.play);
			btnPause.addEventListener('click', DrivePi.pause);
		});
	};

	var ws = new WebSocket('WS://' + location.host + '/websocket');
	ws.onopen = function() {

		var changeHandler = function() { ws.send(this.name + ' ' + this.value); };
		var mouseupHandler = function() { this.value = 0; changeHandler.call(this); };

		turnRng.addEventListener('change', changeHandler);
		turnRng.addEventListener('mouseup', mouseupHandler);
		driveRng.addEventListener('change', changeHandler);
		driveRng.addEventListener('mouseup', mouseupHandler);

		if(debug) ws.send('Connected ' + (new Date()));

		startVideo();
	};
	if(debug) ws.addEventListener('message', function(e) { console.log(e.data); });
})();
