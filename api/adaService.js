const mqtt = require('mqtt')
const dotenv = require('dotenv');
const lightService = require('./lightService');
const moistureService = require('./moistureService');
const humiTempService = require('./tempHumiService');
const relayService = require('./relayService')
const getJSON = require('./getJSON')
dotenv.config();


//!Choose server
const bk_un1 = "CSE_BBC"
const bk_un2 = "CSE_BBC1"
const local_un1 = "bkiot"
const local_un2 = "produde"
const soil_name = 'bk-iot-soil'
const light_name = 'bk-iot-light'
const relay_name = 'bk-iot-relay'
const temp_humi_name = 'bk-iot-temp-humid'

LOCAL = "LOCAL"
BK = "BK"

//!................ CHOSE SERVER HERE!
CHOSSEN_SERVER = global.CHOSSEN_SERVER

function get_feed_link(username, feed_name){
    return username + '/' + 'feeds/' + feed_name
}
function ada_connect_error(username){
    return 'Error connecting to adaFruit' + username
}
function ada_connect_success(username){
    return 'connect to adafruit '+username+' successfully'
}
function feed_connect_error(feed_name){
    return 'Error connecting to feed ' + feed_name
}
function feed_connect_success(feed_name){
    return 'connect to feed '+feed_name+' successfully'
}

function initial_information_setup(){
    if (CHOSSEN_SERVER === BK){
        // ada_info = JSON.parse(getJSON('http://dadn.herokuapp.com/'))
        // let [key1, key2] = ada_info.key.split(':')
        let key1 = process.env.BK_ADA_KEY1
        let key2 = process.env.BK_ADA_KEY2
        global.adaInfo = {
            user1: bk_un1,
            user2: bk_un2,
            pass1: key1,
            pass2: key2,
            feed_soil: get_feed_link(bk_un1,soil_name),
            feed_temp_humi: get_feed_link(bk_un1,temp_humi_name),
            feed_light: get_feed_link(bk_un2,light_name),
            feed_relay: get_feed_link(bk_un2,relay_name)
        }
    }else{
        //setup reading local env file
        global.adaInfo = {
            user1: local_un1,
            user2: local_un2,
            pass1: process.env.LOCAL_KEY_1,
            pass2: process.env.LOCAL_KEY_2,
            feed_soil: get_feed_link(local_un1,soil_name),
            feed_temp_humi: get_feed_link(local_un1,temp_humi_name),
            feed_light: get_feed_link(local_un2,light_name),
            feed_relay: get_feed_link(local_un2,relay_name)
        }
    }
}

function setupAdaService(){
    //! very important
    initial_information_setup()


    adaInfo = global.adaInfo
    console.log('Acc1: ',adaInfo.user1,'---',adaInfo.pass1)
    console.log('Acc2: ',adaInfo.user2,'---',adaInfo.pass2)


    console.log('-----------------------------------------------------')
    console.log('Ada server setup!')

    //! improve logging
    var client1Error = true
    var client2Error = true

    //! connect first server
    const options1 = {
        username: adaInfo.user1,
        password: adaInfo.pass1,
    };
    // console.log(options)
    const url1 = `mqtts://${options1.username}:${options1.password}@io.adafruit.com`;
    // console.log(url)
    const mqttClient1 = mqtt.connect(url1, 8883);
    mqttClient1.on('connect', (connack)=>{
        // console.log('Info:', connack)
        mqttClient1.subscribe(adaInfo.feed_soil, (err, granted) => {
            if (err) console.log(feed_connect_error(soil_name),err);
            if (granted) console.log(feed_connect_success(soil_name))
        })
        mqttClient1.subscribe(adaInfo.feed_temp_humi, (err, granted) => {
            if (err) console.log(feed_connect_error(temp_humi_name),err);
            if (granted) console.log(feed_connect_success(temp_humi_name))
        })

        client1Error = false
        console.log(ada_connect_success(adaInfo.user1))
    })
    mqttClient1.on('error', (error)=>{
        if (client1Error){
            console.log(ada_connect_error(adaInfo.user1), error)
        }
        client1Error = false
    })

    //! connect server 2
    const options2 = {
        username: adaInfo.user2,
        password: adaInfo.pass2,
    };
    // console.log(options)
    const url2 = `mqtts://${options2.username}:${options2.password}@io.adafruit.com`;
    // console.log(url)
    const mqttClient2 = mqtt.connect(url2, 8883);
    mqttClient2.on('connect', (connack)=>{

        mqttClient2.subscribe(adaInfo.feed_light, (err, granted) => {
            if (err) console.log(feed_connect_error(light_name),err);
            if (granted) console.log(feed_connect_success(light_name))
        })
        mqttClient2.subscribe(adaInfo.feed_relay, (err, granted) => {
            if (err) console.log(feed_connect_error(relay_name),err);
            if (granted) console.log(feed_connect_success(relay_name))
        })
        client2Error = false
        console.log(ada_connect_success(adaInfo.user2))
    })
    mqttClient2.on('error', (error)=>{
        if (client2Error){
            console.log(ada_connect_error(adaInfo.user2), error)
        }
        client2Error = false
    })

    //! set global client to use in other services
    global.mqttClient1 = mqttClient1;
    global.mqttClient2 = mqttClient2;
    //! setup specific Services
    moistureService.setup();
    lightService.setup();
    humiTempService.setup();
    relayService.setup();
}

firebase = require('firebase-admin')
DB_NAME = 'AdaAuth'
const ref = firebase.database().ref(DB_NAME)

ref.on('value', (snapshot) => {
    console.log('==============================')
    console.log('Current auth info in firebase!')
    console.log(snapshot.val());
    console.log('==============================')
});

var time_seconds = 60; // n-seconds
var interval = time_seconds * 1000; 
async function loop_update(){
    update_ada_auth_info_to_firebase(0)
}
function update_ada_auth_info_to_firebase(i){
    setTimeout(() => {
        // console.log('Inf ada info update loop: ',i)
        initial_information_setup();
        // console.log('Ada Keys: ', key1,key2)
        //update on firebase
        ref.set(global.adaInfo)
        update_ada_auth_info_to_firebase(++i);
    }, interval)
}

exports.setup = setupAdaService; 
exports.update_ada_info = loop_update;

