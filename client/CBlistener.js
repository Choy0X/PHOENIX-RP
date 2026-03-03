MRCore.Functions.RegisterClientCallback('MRCore:client:GetVehicleMods', async (VehicleNetID = 0) => {
    const Vehicle = NetworkGetEntityFromNetworkId(VehicleNetID);
    const VehicleProps = MRCore.Functions.GetVehicleProperties(Vehicle);
    return VehicleProps;
});

AddStateBagChangeHandler('PlayerData', `player:${MRCore.ServerID}`, (bagName, stateName, value) => {
    MRCore.PlayerData = value;
});