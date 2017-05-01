var http = require("http");
var raspi = require("raspi");
//var gpio = require("raspi-gpio");
var pwm = require("raspi-soft-pwm");

const PORT = process.env.PORT || 3000;
const LED_PIN = 11;
const SERVO_PIN = 7;
const OPEN_TIME = 1500;
const OPEN = 0.03;
const CLOSE = 0.11;

var servo = null;

raspi.init(function() {
	servo = new pwm.SoftPWM("P1-7");
	servo.write(CLOSE);
});

function handleError(error) {
  if (error) throw error;
}

function openCloseServo(open, cb) {
	try {
		if (servo != null) {
			if (open) {
				console.log("Opening servo...");
				servo.write(OPEN);
			} else {
				console.log("Closing servo...");
				servo.write(CLOSE);
			}
		}
		
		cb(null);
	} catch (error) {
		cb(error);
	}
}


http
	.createServer(function(req, res) {
		if (req.method === "GET") {
			if (req.url === "/feeder/api/open") {
				openCloseServo(true, function(error) {
					handleError(error);
					
					setTimeout(function() {
						openCloseServo(false, function(error) {
							handleError(error);
							res.end("Open feeder");
						});
					}, OPEN_TIME);
				});
			}
		}
	})
	.listen(PORT, function() {
		console.log("Server listening");
	});