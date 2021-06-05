const mqtt = require('mqtt')
const dotenv = require('dotenv');
const lightService = require('./lightService');
const moistureService = require('./moistureService');
const humiTempService = require('./tempHumiService');
dotenv.config();

function setupAdaService(){
    console.log('-----------------------------------------------------')
    console.log('Ada server setup!')

    //! connect first server
    const options1 = {
        username: process.env.BK_ADA_ID1,
        password: process.env.BK_ADA_KEY1,
    };
    // console.log(options)
    const url1 = `mqtts://${options1.username}:${options1.password}@io.adafruit.com`;
    // console.log(url)
    const mqttClient1 = mqtt.connect(url1, 8883);
    mqttClient1.on('connect', (connack)=>{
        // console.log('Info:', connack)
        mqttClient1.subscribe('CSE_BBC/feeds/bk-iot-soil', (err, granted) => {
            if (err) console.log('soil feed subscription error: ',err);
            if (granted) console.log('Subed to soil feed')
        })
        mqttClient1.subscribe('CSE_BBC/feeds/bk-iot-temp-humid', (err, granted) => {
            if (err) console.log('Temp-Humid feed subscription error: ',err);
            if (granted) console.log('Subed to Temp-Humid feed')
        })
        console.log('connect to adafruit CSE_BBC successfully')
    })
    mqttClient1.on('error', (error)=>{
        console.log('Error connecting to adaFruit CSE_BBC! ', error)
    })

    //! connect server 2
    const options2 = {
        username: process.env.BK_ADA_ID2,
        password: process.env.BK_ADA_KEY2,
    };
    // console.log(options)
    const url2 = `mqtts://${options2.username}:${options2.password}@io.adafruit.com`;
    // console.log(url)
    const mqttClient2 = mqtt.connect(url2, 8883);
    mqttClient2.on('connect', (connack)=>{
        // console.log('Info:', connack)
        mqttClient2.subscribe('CSE_BBC1/feeds/bk-iot-light', (err, granted) => {
            if (err) console.log('Light feed subscription error: ',err);
            if (granted) console.log('Subed to light feed')
        })
        console.log('connect to adafruit CSE_BBC1 successfully')
    })
    mqttClient2.on('error', (error)=>{
        console.log('Error connecting to adaFruit CSE_BBC1! ', error)
    })

    //! set global client to use in other services
    global.mqttClient1 = mqttClient1;
    global.mqttClient2 = mqttClient2;
    //! setup specific Services
    moistureService.setup();
    lightService.setup();
    humiTempService.setup();
}

firebase = require('firebase-admin')
DB_NAME = 'AdaAuth'
const ref = firebase.database().ref(DB_NAME)
const getJSON = require('./getJSON')

ref.on('value', (snapshot) => {
    console.log('Ada auth info updated in firebase!')
    console.log(JSON.stringify(snapshot.val()));
});

var time_seconds = 60; // n-seconds
var interval = time_seconds * 1000; 
async function loop_update(){
    update_ada_auth_info_to_firebase(0)
}
function update_ada_auth_info_to_firebase(i){
    setTimeout(() => {
        console.log('Inf loop: ',i)
        //get from link
        ada_info = JSON.parse(getJSON('http://dadn.esp32thanhdanh.link/'))
        let [key1, key2] = ada_info.key.split(':')
        console.log('Ada Keys: ', key1,key2)
        //update on firebase
        let ada_info_json = {
            id1: "CSE_BBC",
            id2: "CSE_BBC1",
            key1: key1,
            key2: key2,
        }
        ref.set(ada_info_json)
        update_ada_auth_info_to_firebase(++i);
    }, interval)
}

exports.setup = setupAdaService; 
exports.update_ada_info = loop_update;

