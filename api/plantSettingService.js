
//! types of env sensor data:
const SOIL = 'SOIL';
const LIGHT = 'LIGHT';
const TEMP = 'TEMP';
const HUMID = 'HUMID';


//TODO: get threshold data from firebase
const moisture_threshold = 80; // lower than this send noti too dry

function check_env_threshold(sensor_data){
    type = sensor_data.name
    if( type === SOIL){
        return sensor_data.data < moisture_threshold
    }else if (type === LIGHT){
        //todo: add
        return false
    }

    return false
}

function get_threshold(sensor_data){
    type = sensor_data.name
    if (type === SOIL) return moisture_threshold;
    //todo: add other thresholds
}
exports.check_env_threshold = check_env_threshold;
exports.get_threshold = get_threshold;