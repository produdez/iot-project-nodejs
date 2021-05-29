const mqtt = require('mqtt')
const express = require('express');
const dotenv = require('dotenv');
const plantSettingService = require('./plantSettingService')
const sensorService = require('./sensorService')
dotenv.config();

function setupEnvCondConnection(){
    const options = {
        username: process.env.ADA_ID,
        password: process.env.ADA_KEY,
    };
    // console.log(options)
    const url = `mqtts://${options.username}:${options.password}@io.adafruit.com`;
    // console.log(url)
    const mqttClient = mqtt.connect(url, 8883);
    mqttClient.on('connect', (connack)=>{
        // console.log('Info:', connack)
        mqttClient.subscribe('bkiot/feeds/notification', (err, granted) => {if (err) console.log(err)})
        console.log('connect to adafruit successfully')
    })
    mqttClient.on('message', (topic,message)=>{
        console.log(parseFloat(message.toString()))
        //TODO: generate notification and push to firebase!
    })
    
    mqttClient.on('error', (error)=>{
        console.log('Error connecting to adaFruit! ', error)
    })
}


const ref = firebase.database().ref('Test')
ref.on('value', (snapshot) => {
    console.log('Updated notification from firebase: ')
    console.log(snapshot.val());
});

function sendNotification(sensor_data){
    if (plantSettingService.check_env_threshold(sensor_data)){
        var notification_json = generate_notification_json(sensor_data);
        push_to_firebase(notification_json);
    }else{
        console.log('Environments conditions not met to push notification')
    }
}
function push_to_firebase(firebase_json){
    var newRef = ref.push();
    console.log('Pusing Notification To Firebase: ')
    console.log(firebase_json)
    newRef.set(firebase_json);
}

function generate_notification_json(sensor_data){
    //add all possible data into the already available sensor json and return that
    sensor_data.plant_id = sensorService.getPlantID(sensor_data.id);
    sensor_data.plant_name = sensorService.getPlantName(sensor_data.plant_id);
    sensor_data.threshold = plantSettingService.get_threshold(sensor_data);
    return sensor_data;
}


exports.setup = setupEnvCondConnection; 
exports.sendNotification = sendNotification;

