import { DepositHarvester } from '../../creepClasses'

export function depositHarvesterManager(room: Room, creepsOfRole: string[]) {
     for (const creepName of creepsOfRole) {
          const creep: DepositHarvester = Game.creeps[creepName]
     }
}
