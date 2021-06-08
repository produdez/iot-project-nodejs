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

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function pushWateringInterval(ref,old_relay_json, new_relay_json){
    old_date = new Date(Date.parse(old_relay_json.date)).getTime()
    new_date = new Date(Date.parse(new_relay_json.date)).getTime()
    time_interval_sec = (new_date - old_date) / 1000

    interval_json = {
        date : new Date().toISOString(),
        time_interval : time_interval_sec.toString().toHHMMSS(),
        plant_id : old_relay_json.plant_id,
        plant_name : old_relay_json.plant_name,
    }
    
    new_ref = ref.push();
    new_ref.set(interval_json)
    console.log(JSON.stringify(interval_json))
    console.log('---------------------------------------')
}


exports.pushWateringInterval = pushWateringInterval;
exports.pushEnvCondToFirebase = pushEnvCondToFirebase; 
