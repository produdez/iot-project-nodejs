const dotenv = require('dotenv');
const sensorService = require('./sensorService');
dotenv.config();

function pushEnvCondToFirebase(ref, sensor_data){
    if (global.LOG_FB_ENVCOND ){
        console.log('---------------------------------------')
        console.log('Pushing sensor data from ada to firebase')
    }
    sensor_data.date = new Date().toISOString();
    sensor_data.plant_name = sensorService.getPlantName(sensor_data.plant_id);
    new_ref = ref.push();
    new_ref.set(sensor_data)
    if (global.LOG_FB_ENVCOND){
        console.log(JSON.stringify(sensor_data))
        console.log('---------------------------------------')
    }
}

String.prototype.toHHMMSSMS = function () {
    var mili_sec_num = parseInt(this, 10); // don't forget the second param
    var mili = mili_sec_num % 1000

    var sec_num = Math.floor(mili_sec_num / 1000)
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds+':'+mili;
}

function pushWateringInterval(ref,old_relay_json, new_relay_json){
    old_date = new Date(Date.parse(old_relay_json.date)).getTime()
    new_date = new Date(Date.parse(new_relay_json.date)).getTime()
    time_interval_mili_sec = (new_date - old_date)

    interval_json = {
        date : new Date().toISOString(),
        time_interval : time_interval_mili_sec.toString().toHHMMSSMS(),
        plant_id : old_relay_json.plant_id,
        plant_name : old_relay_json.plant_name,
    }
    
    new_ref = ref.push();
    new_ref.set(interval_json)
    // console.log(JSON.stringify(interval_json))
    console.log('---------------------------------------')
}


exports.pushWateringInterval = pushWateringInterval;
exports.pushEnvCondToFirebase = pushEnvCondToFirebase; 
