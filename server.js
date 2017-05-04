var http = require("http");
var raspi = require("raspi");
var pwm = require("raspi-soft-pwm");
var schedule = require("node-schedule");

const PORT = process.env.PORT || 3000;
const LED_PIN = 11;
const SERVO_PIN = 7;
const OPEN_TIME = 1500;
const OPEN = 0.03;
const CLOSE = 0.11;
const REQUEST_INTERVAL = 30 * 60 * 1000;	// min -> ms

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

function feed() {
	console.log("feeding");
	
	openCloseServo(true, function(error) {
		handleError(error);
		setTimeout(function() {
			openCloseServo(false, handleError);

			//res.end("Open feeder");
		}, OPEN_TIME);
	});
}

var job = schedule.scheduleJob("02,04,06 * * * *", function() {
	http.request({
		host: "pi-feeder-eastolfi.c9users.io",
		port: 8080,
		path: "/feeder/job"
	}, function(res) {
		var result = "";
		
		res.on("error", function(error) {
			console.log(error);
		});
		
		res.on("data", function(data) {
			console.log(data);
			result += data;
		});
		
		res.on("end", function() {
			console.log(result);
			if (result == "1") feed();
		});
	})
	.end();
});