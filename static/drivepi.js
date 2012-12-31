(function() {
	var debug = true, mediaStream;
	var DrivePi = window.DrivePi = {};

	/**
	 * Setting up WebSocket handler
	 */
	var ws = DrivePi.ws = new WebSocket('WS://' + location.host + '/websocket');
	var changeHandler = function() { ws.send(this.name + ' ' + this.value); };
	var mouseupHandler = function() { this.value = 0; changeHandler.call(this); };
	if(debug) ws.addEventListener('message', function(e) { console.log(e.data); });
	ws.addEventListener('open',  function() {
		turnRng.addEventListener('change', changeHandler);
		turnRng.addEventListener('mouseup', mouseupHandler);
		driveRng.addEventListener('change', changeHandler);
		driveRng.addEventListener('mouseup', mouseupHandler);

		if(debug) ws.send('Connected ' + (new Date()));
	});


	/**
	 * Load WebRTC stream
	 */
	ws.addEventListener('open', function() {
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia;

		if(typeof navigator.getUserMedia !== 'function') return;
		navigator.getUserMedia({video: true, audio: false}, function(localMediaStream){
			mediaStream = localMediaStream;
			webrtcVideo.src = (window.URL || window.webkitURL).createObjectURL(localMediaStream);
		});

	});


	/**
	 * Face detection
	 */
	webrtcVideo.addEventListener('loadeddata', function() {
		var videoRatio = webrtcVideo.videoHeight/webrtcVideo.videoWidth;
		var videoWidth = 300, videoHeight = videoWidth*videoRatio;
		var interval = 10, videoTimer, ctx, initialArea;

		canvas.width = videoWidth;
		canvas.height = videoHeight;
		ctx = canvas.getContext('2d');
		ctx.strokeStyle = '#ff0000';

		DrivePi.pause = function() { if(videoTimer) clearInterval(videoTimer); };
		DrivePi.play = function() {
			DrivePi.pause();
			videoTimer = setInterval(function() {
				if(!mediaStream) return false;
				ctx.drawImage(webrtcVideo, 0, 0, videoWidth, videoHeight);
				var c = ccv.detect_objects({
					canvas : canvas,
					cascade : cascade,
					interval : interval,
					min_neighbors : 1
				});
				if(c.length) {
					if(!initialArea) initialArea = c[0].width*c[0].height;
					ctx.strokeRect(c[0].x, c[0].y, c[0].width, c[0].height);

					var normalizedTurnValue = (c[0].x-150)/10;
					turnRng.value = normalizedTurnValue;
					changeHandler.call(turnRng);
					//driveRng.value = (c[0].width*c[0].height-initialArea)/initialArea;
				}
			}, interval);
		};

		DrivePi.play();

		btnPlay.addEventListener('click', DrivePi.play);
		btnPause.addEventListener('click', DrivePi.pause);
	});
})();
