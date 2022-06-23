import { constants, depositNeedsIndex } from 'international/constants'
import { getRange, getRangeBetween, unpackAsPos, unpackAsRoomPos } from 'international/generalFunctions'
import { DepositHarvester } from 'room/creeps/creepClasses'

DepositHarvester.prototype.findDeposit = function () {
     const creep = this
     // If the creep already has a deposit, inform true

     if (creep.memory.depositName) return true

     // Otherwise, get the creep's role

     const role = creep.memory.role as 'depositHarvester'
     // Get deposits by their efficacy

     const depositNamesByEfficacy: string[] = Game.rooms[creep.memory.communeName]?.get('depositNamesByEfficacy')

     // Loop through each deposit name

     for (const roomName of depositNamesByEfficacy) {
          // Get the deposit's memory using its name

          const roomMemory = Memory.rooms[roomName]

          // If the needs of this remdepositote are met, iterate

          if (roomMemory.needs[depositNeedsIndex[role]] <= 0) continue

          // Otherwise assign the deposit to the creep and inform true

          creep.memory.depositName = roomName
          roomMemory.needs[depositNeedsIndex[role]] -= creep.partsOfType(WORK)

          return true
     }

     // Inform false

     return false
}

DepositHarvester.prototype.travelToDeposit = function () {
     const creep = this
     const { room } = creep

     // Try to find a harvestPosition, inform false if it failed

     if (!creep.findDepositHarvestPos()) return false

     creep.say('🚬')

     // Unpack the harvestPos

     const harvestPos = unpackAsPos(creep.memory.packedPos)

     // If the creep is at the creep's packedHarvestPos, inform false

     if (getRange(creep.pos.x - harvestPos.x, creep.pos.y - harvestPos.y) === 0) return false

     // Otherwise say the intention and create a moveRequest to the creep's harvestPos, and inform the attempt

     creep.say(`⏩ Deposit`)

     creep.createMoveRequest({
          origin: creep.pos,
          goal: {
               pos: new RoomPosition(harvestPos.x, harvestPos.y, room.name),
               range: 0,
          },
          avoidEnemyRanges: true,
          weightGamebjects: {
               1: room.get('road'),
          },
     })

     return true
}

DepositHarvester.prototype.advancedHarvestDeposit = function (deposit) {
     const creep = this
     const { room } = creep

     // Try to find a harvestPosition, inform false if it failed

     if (!creep.findDepositHarvestPos()) return false

     creep.say('🚬')

     // Unpack the creep's packedHarvestPos

     const harvestPos = unpackAsRoomPos(creep.memory.packedPos, room.name)

     // If the creep is not standing on the harvestPos

     if (getRangeBetween(creep.pos.x, creep.pos.y, harvestPos.x, harvestPos.y) > 0) {
          creep.say('⏩M')

          // Make a move request to it

          creep.createMoveRequest({
               origin: creep.pos,
               goal: { pos: harvestPos, range: 0 },
               avoidEnemyRanges: true,
               weightGamebjects: {
                    1: room.get('road'),
               },
          })

          // And inform false

          return false
     }

     // Harvest the mineral, informing the result if it didn't succeed

     if (creep.harvest(deposit) !== OK) return false

     // Find amount of minerals harvested and record it in data

     const depositsHarvested = creep.partsOfType(WORK) * HARVEST_POWER
     Memory.stats.depositsHarvested += depositsHarvested

     creep.say(`⛏️${depositsHarvested}`)

     // Inform true

     return true
}
