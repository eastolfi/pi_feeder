var http = require("http");
var gpio = require("rpi-gpio");

const PORT = process.env.PORT || 3000;
const LED_PIN = 11;
const SERVO_PIN = 7;
const OPEN_TIME = 1500;

function handleError(error) {
  if (error) throw error;
}

function openCloseServo(open, cb) {
  //gpio.write(LED_PIN, open, cb);
  console.log("Open: " + open);
}

//gpio.setup(LED_PIN, gpio.DIR_OUT, handleError);

http
  .createServer(function(req, res) {
    if (req.method === "GET") {
      if (req.url === "/feeder/api/open") {
        openCloseServo(true, function(error) {
	  handleError(error);
	  setTimeout(function() {
	    console.log("timeout");
	    openCloseServo(false, handleError);
    	  }, OPEN_TIME);
	});
        res.end("Open feeder");
      }
    }
  })
  .listen(PORT, function() {
    console.log("Server listening");
  });