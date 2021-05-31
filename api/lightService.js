const mqtt = require('mqtt')
const dotenv = require('dotenv');
const notificationService = require('./notificationService')
dotenv.config();

function setupLightService(){
    var mqttClient = global.mqttClient2;
    mqttClient.on('message', (topic,message)=>{
        if(topic === 'CSE_BBC1/feeds/bk-iot-light'){
            console.log('-----------------------------------------------------')
            console.log('Received light data from ada:')
            console.log(message.toString())
            var sensor_json_data = JSON.parse(message.toString())
            //generate light notification!  
            notificationService.sendNotification(sensor_json_data)
        }
    })


    //! delay alot and then publish some value
    //todo: delete this later
    function upload_light_data(){        
        let random_light = Math.floor(Math.random() * 100);
        json_data = {
            id:'13',
            name:"LIGHT",
            data:random_light,
            unit:""
        }
        console.log('-----------------------------------------------------')
        console.log('Uploading light: ',json_data)
        mqttClient.publish('CSE_BBC1/feeds/bk-iot-light', JSON.stringify(json_data));
    }
    var i = 1;                  //  set your counter to 1
    var bound = 100;
    var delay = 35000
    function myLoop() {         //  create a loop function
        setTimeout(function() {   //  call a 3s setTimeout when the loop is called
            upload_light_data();   //  your code here
            i++;                    //  increment the counter
            if (i < bound) {           //  if the counter < 10, call the loop function
            myLoop();             //  ..  again which will trigger another 
            }                       //  ..  setTimeout()
        }, delay)
    }
    if(global.UPLOAD_FAKE_DATA_TO_ADA) myLoop();
}

exports.setup = setupLightService; 

