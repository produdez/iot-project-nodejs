const dotenv = require('dotenv');
const sensorService = require('./sensorService');
dotenv.config();

function pushEnvCondToFirebase(ref, sensor_data){
    console.log('---------------------------------------')
    console.log('Pushing sensor data from ada to firebase')
    sensor_data.date = new Date().toISOString();
    sensor_data.plant_name = sensorService.getPlantName(sensor_data.plant_id);
    new_ref = ref.push();
    new_ref.set(sensor_data)
    console.log(JSON.stringify(sensor_data))
    console.log('---------------------------------------')
}




exports.pushEnvCondToFirebase = pushEnvCondToFirebase; 
