
function getPlantName(plant_id){
    //TODO: actually uses database to map id to name
    return "Plant" + plant_id
}
function getPlantID(sensor_id){
    //todo: actually read database and map sensor_id to plant_id
    return "1"
}
exports.getPlantName = getPlantName;
exports.getPlantID = getPlantID;