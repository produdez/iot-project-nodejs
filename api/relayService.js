const mqtt = require('mqtt')
const dotenv = require('dotenv');
const historyService = require('./historyService')
const sensorService = require('./sensorService')

dotenv.config();

const DB_NAME = 'Relay'
const ref = firebase.database().ref(DB_NAME)

// const water_interval_ref = firebase.database().ref('WaterInterval')
// const latest_relay_ref = firebase.database().ref(DB_NAME)
//                 .orderByChild("dateAdded")
//                 .limitToLast(1);
// const last_on_relay = firebase.database().ref(DB_NAME)
//                 .orderByChild('data').equalTo(1)
//                 .orderByChild("dateAdded").limitToLast(1)

var last_relay_dummy_val = 0

function setupRelayService(){
    var mqttClient = global.mqttClient2;
    mqttClient.on('message', (topic,message)=>{
        if(topic === global.adaInfo.feed_relay){
            console.log('******************************************')
            console.log('Received relay data from ada:')
            console.log(message.toString())
            var sensor_json = JSON.parse(message.toString())
            //switch the dummy var
            last_relay_dummy_val = parseInt(sensor_json.data)
            // push data to firebase
            sensor_json.plant_id = sensorService.getPlantID(sensor_json.id)
            historyService.pushEnvCondToFirebase(ref,sensor_json);
        }
    })

    // setupFirebaseRelayListener();

    // //! delay alot and then publish some value
    //todo: delete this later

    function upload_relay_data(){        
        value = last_relay_dummy_val === 0 ? 1 : 0;
        json_data = {
            id:'11',
            name:"RELAY",
            data:value.toString(),
            unit:""
        }
        console.log('-----------------------------------------------------')
        console.log('Uploading relay: ',json_data)
        mqttClient.publish(global.adaInfo.feed_relay, JSON.stringify(json_data));
    }
    var i = 1;                  //  set your counter to 1
    var bound = 100;
    var delay = 17000
    function myLoop() {         //  create a loop function
        setTimeout(function() {   //  call a 3s setTimeout when the loop is called
            upload_relay_data();   //  your code here
            i++;                    //  increment the counter
            if (i < bound) {           //  if the counter < 10, call the loop function
            myLoop();             //  ..  again which will trigger another 
            }                       //  ..  setTimeout()
        }, delay)
    }
    if(global.UPLOAD_FAKE_DATA_TO_ADA) myLoop();
}
// var last_relay_json = null;

// async function setupFirebaseRelayListener(){
    
//     await last_on_relay.once("value", function(snapshot){
//         console.log('Receive last waterOn relay from fb')
//         last_relay_json = snapshot.val()
//         console.log(last_relay_json)
//     })

//     latest_relay_ref.on("child_added", function (snapshot) {
//         let new_relay_json = snapshot.val()
//         console.log('Received new Relay data from fb:')
//         console.log(new_relay_json)
        
//         let relay_val = new_relay_json.data
//         // if (last_relay_json === null) {
//         //     last_relay_json = relay_val;
//         //     return
//         // }
//         if (relay_val === 1){ // if it's a turn on, just record
//             last_relay_json = new_relay_json;
//             return
//         }

//         if (last_relay_json.data === 1 && relay_val ===0){ //one water interval
//             historyService.pushWateringInterval(water_interval_ref,last_relay_json, new_relay_json);
//         }
//     })
// }

exports.setup = setupRelayService; 

