const mqtt = require('mqtt')
const express = require('express');
const dotenv = require('dotenv');
const sensorService = require('./sensorService')
const plantSettingService = require('./plantSettingService');
dotenv.config();


const DB_NAME = 'Notification'
const ref = firebase.database().ref(DB_NAME)
ref.on('value', (snapshot) => {
    console.log('Notification updated in firebase!')
    // console.log(JSON.stringify(snapshot.val()));
});

async function sendNotification(sensor_data){
    sensor_data.plant_id = sensorService.getPlantID(sensor_data.id);
    var check_service = new plantSettingService(sensor_data.plant_id);
    await check_service.get_setting_data();
    var [check_result, check_sign] = check_service.check_env_threshold(sensor_data);
    if (check_result ){
        if (check_service.settings_data.water_mode === true && check_sign === '<' && sensor_data.name === 'SOIL'){
            autoWater(sensor_data, check_service.settings_data);
            return
        }
        sensor_data.plant_name = sensorService.getPlantName(sensor_data.plant_id);
        sensor_data.threshold = check_service.get_threshold(sensor_data, check_sign);
        sensor_data.date = new Date().toISOString();
        sensor_data.sign = check_sign;
        push_to_firebase(sensor_data);
    }else{
        console.log('Environments conditions not met to push notification')
        console.log(
            'Type: ', sensor_data.name, 
            'Val: ', sensor_data.data, 
            'Thresh_min: ', check_service.get_threshold(sensor_data,'<'),
            'Thresh_max: ', check_service.get_threshold(sensor_data,'>'))
    }
}
function push_to_firebase(firebase_json){
    var newRef = ref.push();
    console.log('Pusing Notification To Firebase: ')
    console.log(JSON.stringify(firebase_json))
    newRef.set(firebase_json);
}

function autoWater(sensor_data,plant_settings){
    json_data = {
        id:'11',
        name:"RELAY",
        data:'1',
        unit:""
    }
    date = new Date().toISOString();
    water_interval = plant_settings.water_amount / 100 * 5 //NOTE: 100ml -> 5 secs
    global.mqttClient2.publish(global.adaInfo.feed_relay, JSON.stringify(json_data));
    setTimeout(() => {
        json_data.data = '0';
        global.mqttClient2.publish(global.adaInfo.feed_relay, JSON.stringify(json_data));
        push_auto_water_log(date,sensor_data,plant_settings,water_interval,plant_settings.water_amount);
    }, water_interval * 1000);


}
const ref_autowater_log = firebase.database().ref('AutoWaterLog')
ref_autowater_log.on('child_added',snapshot => {
    console.log('------------------------')
    console.log('Auto water data received')
    console.log(JSON.stringify(snapshot.val()))
    console.log('----------------------------')
})
function push_auto_water_log(date,sensor_data,plant_settings,water_interval,water_amount){
    var json = {
        date : date,
        data : sensor_data.data,
        min_moist: plant_settings.min_moist,
        water_amount: water_amount,
        water_interval: water_interval,
        type: 'AUTO'
    }
    let new_ref = ref_autowater_log.push()
    new_ref.set(json)
}
exports.sendNotification = sendNotification;

