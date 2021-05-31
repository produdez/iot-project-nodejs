const mqtt = require('mqtt')
const dotenv = require('dotenv');
const notificationService = require('./notificationService')
dotenv.config();
const historyService = require('./historyService')


const DB_NAME1 = 'Temperature'
const ref1 = firebase.database().ref(DB_NAME1)
const DB_NAME2 = 'Humidity'
const ref2 = firebase.database().ref(DB_NAME2)

function setupTempHumiService(){
    var mqttClient = global.mqttClient1;
    mqttClient.on('message', (topic,message)=>{
        if(topic === 'CSE_BBC/feeds/bk-iot-temp-humid'){
            console.log('******************************************')
            console.log('Received temp-humid data from ada:')
            console.log(message.toString())

            //todo: split temp-humid and check notification seperately
            var sensor_json_data = JSON.parse(message.toString())
            //split json 
            let [temp, humi] = sensor_json_data.data.split('-')
            var temp_sensor_json = {
                id:sensor_json_data.id,
                name:"TEMP",
                data: temp,
                unit:"C"
            }
            var humi_sensor_json = {
                id: sensor_json_data.id,
                name: "HUMID",
                data: humi,
                unit: "%"
            }
            //generate notification
            notificationService.sendNotification(temp_sensor_json)
            notificationService.sendNotification(humi_sensor_json)

            //push data to firebase
            historyService.pushEnvCondToFirebase(ref1,temp_sensor_json);
            historyService.pushEnvCondToFirebase(ref2,humi_sensor_json);
        }
    })


    //! delay alot and then publish some value
    //todo: delete this later
    function upload_humi_temp_data(){        
        let random_humi = Math.floor(Math.random() * 100);
        let random_temp = Math.floor(Math.random() * 100);
        json_data = {
            id:'7',
            name:"TEMP-HUMID",
            data: random_temp.toString() + '-' + random_humi.toString(),
            unit:"C-%"
        }
        console.log('-----------------------------------------------------')
        console.log('Uploading uploading humid+temp: ',json_data)
        mqttClient.publish('CSE_BBC/feeds/bk-iot-temp-humid', JSON.stringify(json_data));
    }
    var i = 1;                  //  set your counter to 1
    var bound = 100;
    var delay = 50000
    function myLoop() {         //  create a loop function
        setTimeout(function() {   //  call a 3s setTimeout when the loop is called
            upload_humi_temp_data();   //  your code here
            i++;                    //  increment the counter
            if (i < bound) {           //  if the counter < 10, call the loop function
            myLoop();             //  ..  again which will trigger another 
            }                       //  ..  setTimeout()
        }, delay)
    }
    if(global.UPLOAD_FAKE_DATA_TO_ADA) myLoop();
}

exports.setup = setupTempHumiService; 

