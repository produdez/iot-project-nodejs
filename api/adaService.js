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

exports.setup = setupAdaService; 

