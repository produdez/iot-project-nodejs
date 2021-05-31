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
    if (check_result){
        sensor_data.plant_name = sensorService.getPlantName(sensor_data.plant_id);
        sensor_data.threshold = check_service.get_threshold(sensor_data, check_sign);
        sensor_data.sign = check_sign;
        push_to_firebase(sensor_data);
    }else{
        console.log('Environments conditions not met to push notification')
        console.log(
            'Type: ', sensor_data.name, 
            'Val: ', sensor_data.data, 
            'Thresh_max: ', check_service.get_threshold(sensor_data,'>'),
            'Thresh_min: ', check_service.get_threshold(sensor_data,'<'))
    }
}
function push_to_firebase(firebase_json){
    var newRef = ref.push();
    console.log('Pusing Notification To Firebase: ')
    console.log(JSON.stringify(firebase_json))
    newRef.set(firebase_json);
}

exports.sendNotification = sendNotification;

