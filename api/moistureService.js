const mqtt = require('mqtt')
const dotenv = require('dotenv');
const notificationService = require('./notificationService')
dotenv.config();
const historyService = require('./historyService')

const DB_NAME = 'Moisture'
const ref = firebase.database().ref(DB_NAME)

function setupMoistureService(){
    var mqttClient = global.mqttClient1;
    mqttClient.on('message', (topic,message)=>{
        if (topic === 'CSE_BBC/feeds/bk-iot-soil'){
            console.log('******************************************')
            console.log('Received moisture data from ada:')
            console.log(message.toString())
            var sensor_json_data = JSON.parse(message.toString())
            //generate moisture notification!  
            notificationService.sendNotification(sensor_json_data)
            //push data to firebase
            historyService.pushEnvCondToFirebase(ref,sensor_json_data);
        }
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
        console.log('-----------------------------------------------------')
        console.log('Uploading moisture: ',json_data)
        mqttClient.publish('CSE_BBC/feeds/bk-iot-soil', JSON.stringify(json_data));
    }
    var i = 1;                  //  set your counter to 1
    var bound = 100;
    var delay = 20000
    function myLoop() {         //  create a loop function
        setTimeout(function() {   //  call a 3s setTimeout when the loop is called
            upload_mosisture_data();   //  your code here
            i++;                    //  increment the counter
            if (i < bound) {           //  if the counter < 10, call the loop function
            myLoop();             //  ..  again which will trigger another 
            }                       //  ..  setTimeout()
        }, delay)
    }
    if(global.UPLOAD_FAKE_DATA_TO_ADA) myLoop();
}

exports.setup = setupMoistureService; 

