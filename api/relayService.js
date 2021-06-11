const mqtt = require('mqtt')
const dotenv = require('dotenv');
const historyService = require('./historyService')
const sensorService = require('./sensorService')

dotenv.config();

const DB_NAME = 'Relay'
const ref = firebase.database().ref(DB_NAME)

const water_interval_ref = firebase.database().ref('WaterInterval')
const latest_relay_ref = firebase.database().ref(DB_NAME)
                .orderByChild("dateAdded").limitToLast(1);
const last_50_relays = firebase.database().ref(DB_NAME)
                .orderByChild("dateAdded").limitToLast(50)


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

    setupFirebaseRelayListener();

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
    var delay = 10000
    function myLoop() {         //  create a loop function
        setTimeout(function() {   //  call a 3s setTimeout when the loop is called
            upload_relay_data();   //  your code here
            i++;                    //  increment the counter
            if (i < bound) {           //  if the counter < 10, call the loop function
            myLoop();             //  ..  again which will trigger another 
            }                       //  ..  setTimeout()
        }, delay)
    }
    if(global.UPLOAD_FAKE_RELAY) myLoop();
}

var last_on_relay_json = null;

async function setupFirebaseRelayListener(){
    water_interval_ref.on("child_added",function(snapshot){
        if (last_on_relay_json != null){
            console.log('Water interval update from fb')
            console.log(JSON.stringify(snapshot.val()))
        }   
    })
    
    await last_50_relays.once("value", function(snapshot){
        const last_relay_jsons = snapshot.val()
        if (last_on_relay_json === null) return
        for (const [key, value] of Object.entries(last_relay_jsons).reverse()) {
            if(value.data === '1'){
                last_on_relay_json = value
                break
            }
        }
    })
    console.log('......')
    console.log('Last ON Relay:  ', JSON.stringify(last_on_relay_json))
    console.log('......')
    newItems = false;
    latest_relay_ref.on("child_added", function (snapshot) {
        if(!newItems) return //To skip the first data pull 
        let new_relay_json = snapshot.val()        
        let new_val = parseInt(new_relay_json.data)
        if (last_on_relay_json === null) { // case database empty
            console.log('Relay database empty, setting last to first receive!')
            last_on_relay_json = new_val;
            return
        }
        
        let old_val = parseInt(last_on_relay_json.data)
        if (new_val === 1){ // if it's a turn on, just record
            last_on_relay_json = new_relay_json;
            return
        }

        if (old_val === 1 && new_val ===0){ //one water interval
            console.log('----------------------------')
            console.log('Water off, pushing watering interval')
            // console.log('Last on: ', JSON.stringify(last_on_relay_json))
            // console.log('Off: ', JSON.stringify(new_relay_json))
            historyService.pushWateringInterval(water_interval_ref,last_on_relay_json, new_relay_json);
        }
    })

    latest_relay_ref.once('value', function(messages) {
        newItems = true;
    });
}

exports.setup = setupRelayService; 

