import { depositNeedsIndex } from 'international/constants'
import { RoomTask } from 'room/roomTasks'
import { DepositHauler } from '../../creepClasses'

export function depositHaulerManager(room: Room, creepsOfRole: string[]) {
     for (const creepName of creepsOfRole) {
          const creep: DepositHauler = Game.creeps[creepName]

          if (creep.needsResources()) {
               if (!creep.memory.depositName) {
                    const depositNamesByEfficacy: string[] =
                         Game.rooms[creep.memory.communeName]?.get('depositNamesByEfficacy')

                    for (const roomName of depositNamesByEfficacy) {
                         const roomMemory = Memory.rooms[roomName]

                         if (roomMemory.needs[depositNeedsIndex.depositHauler] <= 0) continue

                         creep.memory.depositName = roomName
                         roomMemory.needs[depositNeedsIndex.depositHauler] -= creep.partsOfType(CARRY)
                         break
                    }
               }

               //

               if (!creep.memory.depositName) continue

               creep.say(creep.memory.depositName)

               // If the creep is in the deposit

               if (room.name === creep.memory.depositName) {
                    // If creep has a task

                    if (global[creep.id]?.respondingTaskID) {
                         // Try to filfill task

                         const fulfillTaskResult = creep.fulfillTask()

                         // Iterate if the task wasn't fulfilled

                         if (!fulfillTaskResult) continue

                         // Otherwise find the task

                         const task: RoomTask = room.global.tasksWithResponders[global[creep.id].respondingTaskID]

                         // Delete it

                         task.delete()
                    }

                    // Try to find a new task

                    const findTaskResult = creep.findTask(new Set(['pickup']), RESOURCE_ENERGY)

                    // If a task wasn't found, iterate

                    if (!findTaskResult) continue

                    // Try to filfill task

                    const fulfillTaskResult = creep.fulfillTask()

                    // Iterate if the task wasn't fulfilled

                    if (!fulfillTaskResult) continue

                    // Otherwise find the task

                    const task: RoomTask = room.global.tasksWithResponders[global[creep.id].respondingTaskID]

                    // Delete it and iterate

                    task.delete()
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

               continue
          }

          // Otherwise

          if (room.name === creep.memory.communeName) {
               // Try to renew the creep

               creep.advancedRenew()

               // If the creep has a depositName, delete it

               if (creep.memory.depositName) delete creep.memory.depositName
               /*
            // If there is a storage

            if (room.storage) {

                creep.say('S')

                // Advanced transfer to it and stop

                creep.advancedTransfer(room.storage)
                return
            } */

               // If creep has a task

               if (global[creep.id]?.respondingTaskID) {
                    // Try to filfill task

                    const fulfillTaskResult = creep.fulfillTask()

                    // Iterate if the task wasn't fulfilled

                    if (!fulfillTaskResult) continue

                    // Otherwise find the task

                    const task: RoomTask = room.global.tasksWithResponders[global[creep.id].respondingTaskID]

                    // Delete it

                    task.delete()
               }

               // Try to find a new task

               const findTaskResult = creep.findTask(new Set(['transfer']), RESOURCE_ENERGY)

               // If a task wasn't found, iterate

               if (!findTaskResult) continue

               // Try to filfill task

               const fulfillTaskResult = creep.fulfillTask()

               // Iterate if the task wasn't fulfilled

               if (!fulfillTaskResult) continue

               // Otherwise find the task

               const task: RoomTask = room.global.tasksWithResponders[global[creep.id].respondingTaskID]

               // Delete it and iterate

               task.delete()
               continue
          }

          creep.say(creep.memory.communeName)

          creep.createMoveRequest({
               origin: creep.pos,
               goal: {
                    pos: new RoomPosition(25, 25, creep.memory.communeName),
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
