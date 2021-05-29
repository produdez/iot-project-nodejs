const mqtt = require('mqtt')
const dotenv = require('dotenv');
const notificationService = require('./notificationService')
dotenv.config();

function setupMoistureService(){
    const options = {
        username: process.env.BK_ADA_ID1,
        password: process.env.BK_ADA_KEY1,
    };
    // console.log(options)
    const url = `mqtts://${options.username}:${options.password}@io.adafruit.com`;
    // console.log(url)
    const mqttClient = mqtt.connect(url, 8883);
    mqttClient.on('connect', (connack)=>{
        // console.log('Info:', connack)
        mqttClient.subscribe('CSE_BBC/feeds/bk-iot-soil', (err, granted) => {if (err) console.log(err)})
        console.log('connect to adafruit successfully')
    })
    mqttClient.on('message', (topic,message)=>{
        console.log('Received moisture data from ada:')
        console.log(message.toString())
        var sensor_json_data = JSON.parse(message.toString())
        //generate moisture notification!  
        notificationService.sendNotification(sensor_json_data)
    })
    
    mqttClient.on('error', (error)=>{
        console.log('Error connecting to adaFruit! ', error)
    })


    //! delay alot and then publish some value
    //todo: delete this later
    function upload_mosisture_data(){        
        let random_moisture = Math.floor(Math.random() * 100);
        json_data = {
            id:'9',
            name:"SOIL",
            data:random_moisture,
            unit:"%"
        }
        console.log('Uploading moisture: ',json_data)
        mqttClient.publish('CSE_BBC/feeds/bk-iot-soil', JSON.stringify(json_data));
    }
    var i = 1;                  //  set your counter to 1
    var bound = 100;
    var delay = 10000
    function myLoop() {         //  create a loop function
        setTimeout(function() {   //  call a 3s setTimeout when the loop is called
            upload_mosisture_data();   //  your code here
            i++;                    //  increment the counter
            if (i < bound) {           //  if the counter < 10, call the loop function
            myLoop();             //  ..  again which will trigger another 
            }                       //  ..  setTimeout()
        }, delay)
    }
    myLoop(); 
}

exports.setup = setupMoistureService; 

