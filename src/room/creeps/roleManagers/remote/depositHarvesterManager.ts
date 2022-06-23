import { DepositHarvester } from '../../creepClasses'

export function depositHarvesterManager(room: Room, creepsOfRole: string[]) {
     for (const creepName of creepsOfRole) {
          const creep: DepositHarvester = Game.creeps[creepName]

          // Try to find a deposit. If one couldn't be found, iterate

          if (!creep.findDeposit()) continue

          creep.say(creep.memory.depositName)

          // If the creep needs resources

          if (room.name === creep.memory.depositName) {
               // Try to move to deposit. If creep moved then iterate

               if (creep.travelToDeposit()) continue

               // Try to normally harvest. Iterate if creep harvested

               if (creep.advancedHarvestDeposit(room.get('deposit'))) continue

               continue
          }

          creep.createMoveRequest({
               origin: creep.pos,
               goal: {
                    pos: new RoomPosition(25, 25, creep.memory.depositName),
                    range: 25,
               },
               avoidEnemyRanges: true,
               cacheAmount: 200,
               weightGamebjects: {
                    1: room.get('road'),
               },
          })
     }
}
