import { DepositHauler } from '../../creepClasses'

export function depositHaulerManager(room: Room, creepsOfRole: string[]) {
     for (const creepName of creepsOfRole) {
          const creep: DepositHauler = Game.creeps[creepName]
     }
}
