import './roomFunctions'

import './roomTaskManager'

import { remoteManager } from './remoteManager'
import { communeManager } from './communeManager'

import { roleManager } from './creeps/roleManager'

import { powerCreepManager } from './powerCreeps/powerCreepManager'

const specificRoomManagers: {[key: string]: Function} = {
    remote: roomManager,
    commune: communeManager,
}

export function roomManager() {

    let i = 0

    for (let roomName in Game.rooms) {

        const room: Room = Game.rooms[roomName]

        const controller = room.controller

        global.customLog('Room', room.name, undefined, global.colors.lightGrey)

        //

        global.advancedRun(() => roleManager(room))

        // Check if there is a roomManager for this room's type

        const specificRoomManager = specificRoomManagers[room.memory.type]
        if (specificRoomManager) {

            // Run specific manager

            specificRoomManager(room)
        }

        // Testing

        let cpuUsed = Game.cpu.getUsed()

        const harvPositions = room.get('source1HarvestPositions')
        global.customLog('HarvestPositions', harvPositions)

        cpuUsed = Game.cpu.getUsed() - cpuUsed
        global.customLog('HarvestPositions CPU', cpuUsed.toFixed(2))

        i++
    }
}
