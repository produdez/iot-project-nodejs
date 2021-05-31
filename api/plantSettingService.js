firebase = require('firebase-admin')

//! types of env sensor data:
const SOIL = 'SOIL';
const LIGHT = 'LIGHT';
const TEMP = 'TEMP';
const HUMI = 'HUMID';

const DB_NAME = 'PlantSettings';

//lower or higher
HIGHER = '>';
LOWER = '<';
FAIL = [false,null];

class PlantSettingsService{
    constructor(plant_id){
        this.plant_id = plant_id;
        this.ref = firebase.database().ref(DB_NAME).child(this.plant_id);
        this.settings_data = undefined;
    }

    async get_setting_data(){
        await this.ref.once("value",snapshot => {
            // console.log('Receive settings data of plant: ', this.plant_id);
            // console.log('Data: ',snapshot.val())
            if (snapshot.exists()) this.settings_data = snapshot.val();
            // console.log('settings: ', JSON.stringify(this.settings_data));
        },{context:this});
    }
    

    check_env_threshold(sensor_data){ //todo: note to check all uper and lower limit, also 
        if (this.settings_data === undefined) return FAIL;

        let type = sensor_data.name
        let data = parseFloat(sensor_data.data)
        if( type === SOIL){
            if(data < this.settings_data.min_moist) return [true, LOWER];
            if(data > this.settings_data.max_moist) return [true, HIGHER];
        }

        if (type === LIGHT){
            if(data < this.settings_data.min_light) return [true, LOWER];
            if(data > this.settings_data.max_light) return [true, HIGHER];
        }

        if (type === TEMP){
            if(data < this.settings_data.min_temp) return [true, LOWER];
            if(data > this.settings_data.max_temp) return [true, HIGHER];
        }

        if (type === HUMI){
            if(data < this.settings_data.min_humi) return [true, LOWER];
            if(data > this.settings_data.max_humi) return [true, HIGHER];
        }

        return FAIL
    }

    get_threshold(sensor_data,sign){ //todo: note that there's exceed and under
        if (this.settings_data === undefined) return 'NO SETTINGS'
        let type = sensor_data.name
        if (type === SOIL) return sign === LOWER ? this.settings_data.min_moist : this.settings_data.max_moist;
        if (type === LIGHT) return sign === LOWER ? this.settings_data.min_light : this.settings_data.max_light;
        if (type === TEMP) return sign === LOWER ? this.settings_data.min_temp : this.settings_data.max_temp;
        if (type === HUMI) return sign === LOWER ? this.settings_data.min_humi : this.settings_data.max_humi;
        return 'NO SETTINGS'
    }
}

module.exports = PlantSettingsService;