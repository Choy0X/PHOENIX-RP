MRCore = exports['PHOENIX-RP']:GetCoreObject()

-- Time in minutes
SalaryTimeMin = 15
UpdatePlayerDataTime = 5
CheckPlayerFoodTime = 0.5
WalkStyleTime = 3

MSToMin = (1000 * 60)

-- Health Minus
HealthMinus = 10

CreateThread(function()
    while true do
        if LocalPlayer.state.isLoggedIn then
            TriggerServerEvent("MRCore:ReceivedSalary")
        end
        Wait(MSToMin * SalaryTimeMin)
    end
end)

CreateThread(function()
    while true do
        if LocalPlayer.state.isLoggedIn then
            TriggerServerEvent('MRCore:UpdateEatStatus')
        end
        Wait(MSToMin * UpdatePlayerDataTime)
    end
end)

-- Check Player Food

CreateThread(function()
    while true do
        if LocalPlayer.state.isLoggedIn then
            local Ped = PlayerPedId()
            local PedHealth = GetEntityHealth(Ped)
            local PlayerData = MRCore.Functions.GetPlayerData()
            if PedHealth > 0 and (PlayerData.metadata['hunger'] <= 0 or PlayerData.metadata['thirst'] <= 0) then
                MRCore.Functions.Notify('Your body is in dire need of food and water!', 'error', 20000)
                SetEntityHealth(Ped, PedHealth - HealthMinus)
            end
        end
        Wait(MSToMin * CheckPlayerFoodTime)
    end
end)

--Walk Style Update
CreateThread(function()
    while true do
        if LocalPlayer.state.isLoggedIn then
            TriggerEvent('animations:client:set:walkstyle');
        end
        Wait(MSToMin * WalkStyleTime)
    end
end)