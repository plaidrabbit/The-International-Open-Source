let haulerManager = require("module.haulerManager")
let trafficManager = require("module.trafficManager")
let allyList = require("module.allyList");

module.exports = {
    run: function spawns() {

        let remoteRoles = ["remoteHarvester1", "remoteHauler", "remoteHarvester2", "reserver"]

        let rolesList = ["harvester1", "hauler", "harvester2", "upgrader", "builder", "repairer", "barricadeUpgrader", "rangedDefender", "upgradeHauler", "claimer", "revolutionaryBuilder", "miner", "scientist", "robber", "scout", "stationaryHauler", "communeDefender", "remoteHarvester1", "remoteHauler", "remoteHarvester2", "reserver", "remoteBuilder", "antifaSupporter", "antifaAssaulter"]

        let creepsOfRemoteRole = {}
        let creepsOfRole = {}
        let creepCollectionsOfRole = {}

        let haulers = []

        for (let name in Game.creeps) {

            let creep = Game.creeps[name]

            if (!creepCollectionsOfRole[creep.memory.role]) {

                creepCollectionsOfRole[creep.memory.role] = []
            }

            (creepCollectionsOfRole[creep.memory.role]).push({ name: creep.name, role: creep.memory.role, roomFrom: creep.memory.roomFrom })

            if (creep.memory.dying != true) {

                if (!creepsOfRole[[creep.memory.role, creep.memory.roomFrom]]) {

                    creepsOfRole[[creep.memory.role, creep.memory.roomFrom]] = 0
                }

                creepsOfRole[[creep.memory.role, creep.memory.roomFrom]] += 1

                if (creep.memory.remoteRoom) {

                    if (!creepsOfRemoteRole[[creep.memory.role, creep.memory.remoteRoom]]) {

                        creepsOfRemoteRole[[creep.memory.role, creep.memory.remoteRoom]] = 0
                    }

                    creepsOfRemoteRole[[creep.memory.role, creep.memory.remoteRoom]] += 1
                }
            }

            if (creep.memory.role == "hauler") {

                haulers.push({ creep: creep, roomFrom: creep.memory.roomFrom })
            }
        }

        let boostedSquads = false

        let squadType = "dismantle" // May be rangedAttack attack and dismantle

        if (Game.shard.name == "shard2") {

            //var newCommune = "E32N8"

            var newCommune

            //var attackTarget = "E32N8"

            var attackTarget

        } else {

            // var newCommune = "E29N11"

            var newCommune

            //var attackTarget = "E29N11"

            var attackTarget
        }

        Memory.global.newCommune = newCommune

        let communeEstablisher = findCommuneEstablisher()
        Memory.global.communeEstablisher = communeEstablisher

        function findCommuneEstablisher() {
            if (newCommune) {

                for (let maxDistance = 1; maxDistance <= 12; maxDistance++) {

                    for (let room of Object.keys(Game.rooms)) {

                        room = Game.rooms[room]

                        if (room.controller && room.controller.my && room.memory.stage >= 3) {

                            let distance = Game.map.getRoomLinearDistance(newCommune, room.name)

                            if (distance < maxDistance) {

                                console.log("NC, D: " + distance + ", MD: " + maxDistance + ", RN: " + room.name)

                                return room
                            }
                        }
                    }
                }
            }
        }

        Memory.global.attackTarget = attackTarget

        let attackingRoom = findAttackingRooms()
        Memory.global.attackingRoom = attackingRoom

        function findAttackingRooms() {

            if (attackTarget) {

                for (let stage = 8; stage != 0; stage--) {
                    for (let maxDistance = 1; maxDistance <= 10; maxDistance++) {

                        for (let room of Object.keys(Game.rooms)) {

                            room = Game.rooms[room]

                            if (room.controller && room.controller.my && room.memory.stage && room.memory.stage >= stage && room.memory.totalEnergy && room.memory.totalEnergy >= 30000) {

                                let distance = Game.map.getRoomLinearDistance(attackTarget, room.name)

                                if (distance < maxDistance) {

                                    console.log("AT, D: " + distance + ", MD: " + maxDistance + ", RN: " + room.name)

                                    return room
                                }
                            }
                        }
                    }
                }
            }
        }

        _.forEach(Game.rooms, function(room) {
            if (room.controller && room.controller.my) {

                haulerManager.run(room, haulers)

                /*Integral values for spawning considerations*/

                let remoteBuilderNeed = false

                _.forEach(Game.rooms, function(myRooms) {

                    if (myRooms.memory.builderNeed == true && myRooms.memory.myRoom != false) {

                        let remoteRoomDistance = Game.map.getRoomLinearDistance(room.name, myRooms.name)

                        if (remoteRoomDistance == 1) {

                            remoteBuilderNeed = true
                            return
                        }
                    }
                })

                let remoteEnemy = false

                _.forEach(Game.rooms, function(myRooms) {

                    if (myRooms.memory.enemy == true && myRooms.memory.myRoom != false) {

                        let remoteRoomDistance = Game.map.getRoomLinearDistance(room.name, myRooms.name)

                        if (remoteRoomDistance == 1) {

                            remoteEnemy = true
                            return
                        }
                    }
                })

                for (let role of rolesList) {

                    if (!creepsOfRole[[role, room.name]]) {

                        creepsOfRole[[role, room.name]] = 0
                    }
                }

                for (let role of remoteRoles) {

                    for (let remoteRoom of room.memory.remoteRooms) {

                        if (!creepsOfRemoteRole[[role, remoteRoom.name]]) {

                            creepsOfRemoteRole[[role, remoteRoom.name]] = 0
                        }
                    }
                }

                room.memory.remoteRooms = room.memory.remoteRooms.slice(0, Math.floor(room.memory.spawns.length * 2))

                if (room.memory.stage && room.memory.stage < 3) {

                    var hostile = room.find(FIND_HOSTILE_CREEPS, {
                        filter: (c) => {
                            return (allyList.run().indexOf(c.owner.username.toLowerCase()) === -1 && (c.body.some(i => i.type === ATTACK) || c.body.some(i => i.type === RANGED_ATTACK) || c.body.some(i => i.type === HEAL) || c.body.some(i => i.type === WORK) || c.body.some(i => i.type === CLAIM) || c.body.some(i => i.type === CARRY)))
                        }
                    })

                } else {

                    var hostile = room.find(FIND_HOSTILE_CREEPS, {
                        filter: (c) => {
                            return (allyList.run().indexOf(c.owner.username.toLowerCase()) === -1 && c.owner.username != "Invader" && (c.body.some(i => i.type === ATTACK) || c.body.some(i => i.type === RANGED_ATTACK) || c.body.some(i => i.type === HEAL) || c.body.some(i => i.type === WORK) || c.body.some(i => i.type === CLAIM) || c.body.some(i => i.type === CARRY)))
                        }
                    })
                }

                if (hostile.length > 0) {

                    Memory.global.lastDefence.time = Game.time
                    Memory.global.lastDefence.room = room.name
                }

                let roomMineral = room.find(FIND_MINERALS, {
                    filter: s => s.mineralAmount > 0
                })

                let mineralContainer = Game.getObjectById(room.memory.mineralContainer)

                let roomExtractor = room.find(FIND_MY_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_EXTRACTOR
                })

                let roomConstructionSite = room.find(FIND_MY_CONSTRUCTION_SITES)

                let repairStructure = room.find(FIND_STRUCTURES, {
                    filter: s => (s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_CONTAINER) && s.hits < s.hitsMax * 0.5
                })

                let barricadesToUpgrade = room.find(FIND_MY_STRUCTURES, {
                    filter: s => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < s.hitsMax * 0.9
                })

                let controllerContainer = Game.getObjectById(room.memory.controllerContainer)
                let sourceContainer1 = Game.getObjectById(room.memory.sourceContainer1)
                let sourceContainer2 = Game.getObjectById(room.memory.sourceContainer2)

                let baseLink = Game.getObjectById(room.memory.baseLink)
                let controllerLink = Game.getObjectById(room.memory.controllerLink)
                let sourceLink1 = Game.getObjectById(room.memory.sourceLink1)
                let sourceLink2 = Game.getObjectById(room.memory.sourceLink2)

                let remoteRoomsAmount = room.memory.remoteRooms.length

                let stage = room.memory.stage

                if (room.energyCapacityAvailable >= 9100) {

                    room.memory.stage = 8

                } else if (room.energyCapacityAvailable >= 4700) {

                    room.memory.stage = 7

                } else if (room.energyCapacityAvailable >= 2300) {

                    room.memory.stage = 6

                } else if (room.energyCapacityAvailable >= 1800) {

                    room.memory.stage = 5

                } else if (room.energyCapacityAvailable >= 1300) {

                    room.memory.stage = 4

                } else if (room.energyCapacityAvailable >= 800) {

                    room.memory.stage = 3

                } else if (room.energyCapacityAvailable >= 550) {

                    room.memory.stage = 2

                } else if (room.energyCapacityAvailable >= 300) {

                    room.memory.stage = 1

                }

                /*Minimum creeps definitions*/

                let minCreeps = {}

                for (let role of rolesList) {

                    minCreeps[role] = 0
                }

                switch (stage) {
                    case 1:

                        minCreeps["harvester1"] = 3

                        minCreeps["harvester2"] = 3

                        minCreeps["hauler"] = 4
                        break
                    case 2:

                        minCreeps["harvester1"] = 1

                        minCreeps["harvester2"] = 1

                        minCreeps["hauler"] = 5
                        break
                    case 3:

                        minCreeps["harvester1"] = 1

                        minCreeps["harvester2"] = 1

                        minCreeps["hauler"] = 4
                        break
                    case 4:

                        minCreeps["harvester1"] = 1

                        minCreeps["harvester2"] = 1

                        minCreeps["hauler"] = 3
                        break
                    case 5:

                        minCreeps["harvester1"] = 1

                        minCreeps["harvester2"] = 1

                        minCreeps["hauler"] = 3
                        break
                    case 6:

                        minCreeps["harvester1"] = 1

                        minCreeps["harvester2"] = 1

                        minCreeps["hauler"] = 3
                        break
                    case 7:

                        minCreeps["harvester1"] = 1

                        minCreeps["harvester2"] = 1

                        minCreeps["hauler"] = 2

                        minCreeps["scientist"] = 1
                        break
                    case 8:

                        minCreeps["harvester1"] = 1

                        minCreeps["harvester2"] = 1

                        minCreeps["hauler"] = 2

                        minCreeps["scientist"] = 1
                        break
                }

                (function() {

                    if (room.storage && room.storage.store[RESOURCE_ENERGY] <= 20000) {

                        return
                    }

                    if (attackingRoom && attackingRoom == room) {

                        minCreeps["antifaAssaulter"] = 4
                        minCreeps["antifaSupporter"] = minCreeps["antifaAssaulter"]
                    }
                })()

                if (roomConstructionSite.length > 0) {
                    if (!room.storage) {

                        if (stage <= 2) {

                            minCreeps["builder"] = 3
                        } else {

                            minCreeps["builder"] = 2
                        }
                    } else if (room.storage && room.storage.store[RESOURCE_ENERGY] >= 40000) {

                        if (stage <= 5) {

                            minCreeps["builder"] = 2
                        } else {

                            minCreeps["builder"] = 1
                        }
                    }
                }

                if (room.controller.ticksToDowngrade <= 15000) {

                    minCreeps["upgrader"] = 1
                }

                if (!room.storage) {

                    if (stage == 1) {

                        minCreeps["upgrader"] = 6

                    } else if (stage <= 3) {

                        minCreeps["upgrader"] = 4

                    } else {

                        minCreeps["upgrader"] = 3
                    }
                } else if (room.storage &&
                    room.storage.store[RESOURCE_ENERGY] >= 50000) {

                    if (stage <= 5) {

                        minCreeps["upgrader"] = 2

                    } else {

                        minCreeps["upgrader"] = 1
                    }
                }

                if (barricadesToUpgrade.length > 0) {
                    if (!room.storage) {

                        minCreeps["barricadeUpgrader"] = 1

                    } else if (room.storage &&
                        room.storage.store[RESOURCE_ENERGY] >= 30000) {

                        minCreeps["barricadeUpgrader"] = 1
                    }
                }

                if (baseLink != null) {

                    minCreeps["stationaryHauler"] = 1
                }

                if (hostile.length > 0) {

                    minCreeps["rangedDefender"] = 2
                }

                if (Game.flags.R && stage >= 4) {

                    minCreeps["robber"] = 2
                }

                if (repairStructure.length > 0) {

                    minCreeps["repairer"] = 1
                }

                if (newCommune && room == communeEstablisher) {

                    minCreeps["claimer"] = 1
                }

                if (newCommune && room == communeEstablisher) {

                    minCreeps["revolutionaryBuilder"] = 4
                }

                if (room.storage && room.storage.store[RESOURCE_ENERGY] >= 35000 && mineralContainer != null && roomExtractor.length > 0 && roomMineral.length > 0 && Memory.global.globalStage >= 1) {

                    minCreeps["miner"] = 1
                }

                if (Game.flags.S) {

                    minCreeps["scout"] = 1
                }

                if (remoteBuilderNeed && stage >= 4) {

                    minCreeps["remoteBuilder"] = Math.floor(room.memory.remoteRooms.length / 3)
                }

                if (remoteEnemy && stage >= 3) {

                    minCreeps["communeDefender"] = 1
                }
                (function() {

                    if (room.storage && room.storage.store[RESOURCE_ENERGY] <= 15000) {

                        return
                    }

                    for (let remoteRoom of room.memory.remoteRooms) {

                        if (stage <= 2) {

                            minCreeps["remoteHarvester1"] += 2

                            if (remoteRoom.sources == 2) {

                                minCreeps["remoteHarvester2"] += 2
                            }

                            minCreeps["remoteHauler"] += remoteRoom.sources * 2
                        }
                        if (stage >= 3) {

                            minCreeps["reserver"] += 1

                            minCreeps["remoteHarvester1"] += 1

                            if (remoteRoom.sources == 2) {

                                minCreeps["remoteHarvester2"] += 1
                            }

                            minCreeps["remoteHauler"] += Math.floor(remoteRoom.sources * 1.5)
                        }
                    }
                })()


                if (room.storage && room.storage.store[RESOURCE_ENERGY] >= 175000 && room.controller.level <= 7) {

                    minCreeps["upgrader"] += 1
                }
                if (room.terminal && room.terminal.store[RESOURCE_ENERGY] >= 80000 && room.controller.level <= 7) {

                    minCreeps["upgradeHauler"] = 1
                    minCreeps["upgrader"] += 2
                }

                if (!requiredCreeps) {

                    var requiredCreeps = {}
                }

                for (let role of rolesList) {

                    if (minCreeps[role] > creepsOfRole[[role, room.name]]) {

                        requiredCreeps[role] = minCreeps[role] - creepsOfRole[[role, room.name]]

                        //console.log(role +", "+ requiredCreeps[role] +", "+ room.name)
                    }
                }

                let roomFix = room.memory.roomFix

                if (roomFix == null) {

                    room.memory.roomFix = false
                }

                let roomFixMessage = ""

                if (creepsOfRole[["harvester1", room.name]] + creepsOfRole[["harvester2", room.name]] == 0 || creepsOfRole[["hauler", room.name]] == 0) {

                    room.memory.roomFix = true

                    roomFixMessage = "rf"

                    console.log(room.name + ": roomFix true")

                } else if (requiredCreeps["harvester1"] + requiredCreeps["harvester2"] + requiredCreeps["hauler"] == 0) {

                    room.memory.roomFix = false
                }

                // Remote room creep requirements

                if (!requiredRemoteCreeps) {

                    var requiredRemoteCreeps = {}
                }

                let minRemoteCreeps = {}

                for (let remoteRoom of room.memory.remoteRooms) {

                    if (stage <= 2) {

                        minRemoteCreeps[["remoteHarvester1", remoteRoom.name]] = 2

                        if (remoteRoom.sources == 2) {

                            minRemoteCreeps[["remoteHarvester2", remoteRoom.name]] = 2
                        }

                        minRemoteCreeps[["remoteHauler", remoteRoom.name]] = remoteRoom.sources * 2
                    }
                    if (stage >= 3) {

                        minRemoteCreeps[["reserver", remoteRoom.name]] = 1

                        minRemoteCreeps[["remoteHarvester1", remoteRoom.name]] = 1

                        if (remoteRoom.sources == 2) {

                            minRemoteCreeps[["remoteHarvester2", remoteRoom.name]] = 1
                        }

                        minRemoteCreeps[["remoteHauler", remoteRoom.name]] = Math.floor(remoteRoom.sources * 1.5)
                    }
                }

                for (let role of remoteRoles) {

                    for (let remoteRoom of room.memory.remoteRooms) {

                        if (minRemoteCreeps[[role, remoteRoom.name]] > creepsOfRemoteRole[[role, remoteRoom.name]]) {

                            requiredRemoteCreeps[[role, remoteRoom.name]] = minRemoteCreeps[[role, remoteRoom.name]] - creepsOfRemoteRole[[role, remoteRoom.name]]

                            //console.log(role + ", " + requiredRemoteCreeps[[role, remoteRoom.name]] + ", " + remoteRoom.name)
                        }
                    }
                }

                function findRemoteRoom(role) {

                    for (let remoteRoom of room.memory.remoteRooms) {

                        if (requiredRemoteCreeps[[role, remoteRoom.name]] > 0) {

                            return remoteRoom.name
                        }
                    }

                    return false
                }

                /*Creep spawn variables*/

                let freeEnergy = room.energyAvailable
                let capacityEnergy = room.energyCapacityAvailable

                function roleValues(parts, role, memoryAdditions) {

                    let body = []
                    let bodyTier = 0
                    let sliceAmount = 0
                    let cost = 0

                    for (let object of parts) {

                        sliceAmount = object.sliceAmount

                        if (roomFix && stage >= object.stage) {

                            getParts(freeEnergy)
                            break

                        } else if (!roomFix && stage >= object.stage) {

                            getParts(capacityEnergy)
                            break
                        }

                        function getParts(energyType) {

                            cost += object.defaultCost + object.extraCost

                            if (object.defaultParts[0]) {

                                body.push(object.defaultParts)
                                bodyTier++
                            }

                            var bodyAmount = Math.floor((energyType - object.defaultCost) / object.extraCost)

                            bodyTier = bodyAmount

                            if (bodyAmount != Infinity) {

                                for (let i = 0; i < bodyAmount; i++) {

                                    body.push(object.extraParts)
                                }
                            }
                        }
                    }

                    body = _.flattenDeep(body).slice(0, sliceAmount)

                    let memory = { role: role, roomFrom: room.name }

                    for (let property of Object.keys(memoryAdditions)) {

                        memory[property] = memoryAdditions[property]
                    }

                    return {
                        body: body,
                        tier: bodyTier,
                        role: role,
                        memory: { memory },
                        cost: cost
                    }
                }

                var haulerBody = roleValues(
                    [{
                            stage: 7,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [CARRY, CARRY, MOVE],
                            extraCost: 150,
                            sliceAmount: 48
                        }, {
                            stage: 5,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [CARRY, CARRY, MOVE],
                            extraCost: 150,
                            sliceAmount: 36
                        },
                        {
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [CARRY, MOVE],
                            extraCost: 100,
                            sliceAmount: 50
                        }
                    ],
                    "hauler", {})

                let harvester1Body = roleValues(
                    [{
                            stage: 6,
                            defaultParts: [CARRY],
                            defaultCost: 50,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 13
                        },
                        {
                            stage: 5,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 12
                        },
                        {
                            stage: 3,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 12
                        },
                        {
                            stage: 1,
                            defaultParts: [MOVE],
                            defaultCost: 50,
                            extraParts: [WORK],
                            extraCost: 100,
                            sliceAmount: 9
                        }
                    ],
                    "harvester1", {})

                let harvester2Body = roleValues(
                    [{
                            stage: 6,
                            defaultParts: [CARRY],
                            defaultCost: 50,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 13
                        },
                        {
                            stage: 5,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 12
                        },
                        {
                            stage: 3,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 12
                        },
                        {
                            stage: 1,
                            defaultParts: [MOVE],
                            defaultCost: 50,
                            extraParts: [WORK],
                            extraCost: 100,
                            sliceAmount: 9
                        }
                    ],
                    "harvester2", {})

                let upgraderBody = roleValues(
                    [{
                            stage: 8,
                            defaultParts: [CARRY, CARRY],
                            defaultCost: 100,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 5
                        },
                        {
                            stage: 3,
                            defaultParts: [CARRY],
                            defaultCost: 50,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 25
                        },
                        {
                            stage: 2,
                            defaultParts: [CARRY],
                            defaultCost: 50,
                            extraParts: [WORK, WORK, MOVE],
                            extraCost: 250,
                            sliceAmount: 25
                        },
                        {
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, MOVE, CARRY, MOVE],
                            extraCost: 250,
                            sliceAmount: 25
                        }
                    ],
                    "upgrader", {})

                let repairerBody = roleValues(
                    [{
                            stage: 5,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, CARRY, MOVE],
                            extraCost: 200,
                            sliceAmount: 18
                        },
                        {
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, MOVE, CARRY, MOVE],
                            extraCost: 250,
                            sliceAmount: 24
                        }
                    ],
                    "repairer", {})

                let builderBody = roleValues(
                    [{
                            stage: 8,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, CARRY, MOVE],
                            extraCost: 200,
                            sliceAmount: 36
                        }, {
                            stage: 5,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, CARRY, MOVE],
                            extraCost: 200,
                            sliceAmount: 24
                        },
                        {
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, MOVE, CARRY, MOVE],
                            extraCost: 250,
                            sliceAmount: 24
                        }
                    ],
                    "builder", {})

                let barricadeUpgraderBody = roleValues(
                    [{
                            stage: 8,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, CARRY, MOVE],
                            extraCost: 200,
                            sliceAmount: 30
                        }, {
                            stage: 5,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, CARRY, MOVE],
                            extraCost: 200,
                            sliceAmount: 18
                        },
                        {
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [WORK, MOVE, CARRY, MOVE],
                            extraCost: 250,
                            sliceAmount: 24
                        }
                    ],
                    "barricadeUpgrader",
                    "BaU", {})

                let remoteBuilderBody = roleValues(
                    [{
                        stage: 5,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [WORK, MOVE, CARRY, MOVE],
                        extraCost: 250,
                        sliceAmount: 24
                    }],
                    "remoteBuilder", {})

                let remoteHarvester1Body = roleValues(
                    [{
                        stage: 5,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [WORK, WORK, MOVE],
                        extraCost: 250,
                        sliceAmount: 12
                    }, {
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [WORK, MOVE],
                        extraCost: 150,
                        sliceAmount: 16
                    }],
                    "remoteHarvester1", {
                        remoteRoom: findRemoteRoom("remoteHarvester1")
                    })

                let remoteHarvester2Body = roleValues(
                    [{
                        stage: 5,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [WORK, WORK, MOVE],
                        extraCost: 250,
                        sliceAmount: 12
                    }, {
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [WORK, MOVE],
                        extraCost: 150,
                        sliceAmount: 16
                    }],
                    "remoteHarvester2", {
                        remoteRoom: findRemoteRoom("remoteHarvester2")
                    })

                let remoteHaulerBody = roleValues(
                    [{
                        stage: 5,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [CARRY, CARRY, MOVE],
                        extraCost: 150,
                        sliceAmount: 48
                    }, {
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [CARRY, MOVE],
                        extraCost: 100,
                        sliceAmount: 50
                    }],
                    "remoteHauler", {
                        remoteRoom: findRemoteRoom("remoteHauler")
                    })

                let reserverBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [CLAIM, MOVE, MOVE],
                        extraCost: 700,
                        sliceAmount: 6
                    }],
                    "reserver", {
                        remoteRoom: findRemoteRoom("reserver")
                    })

                let communeDefenderBody = roleValues(
                    [{
                        stage: 6,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, HEAL, MOVE],
                        extraCost: 950,
                        sliceAmount: 24
                    }, {
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [ATTACK, MOVE],
                        extraCost: 130,
                        sliceAmount: 20
                    }],
                    "communeDefender", {})

                let revolutionaryBuilderBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [WORK, MOVE, CARRY, MOVE],
                        extraCost: 250,
                        sliceAmount: 24
                    }],
                    "revolutionaryBuilder", {})

                let claimerBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [CLAIM, MOVE, MOVE],
                        defaultCost: 700,
                        extraParts: [],
                        extraCost: 0,
                        sliceAmount: 3
                    }],
                    "claimer", {})

                let rangedDefenderBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [RANGED_ATTACK, MOVE],
                        extraCost: 220,
                        sliceAmount: 50
                    }],
                    "rangedDefender", {})

                let scientistBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, MOVE],
                        defaultCost: 400,
                        extraParts: [],
                        extraCost: 0,
                        sliceAmount: 8
                    }],
                    "scientist", {})

                let stationaryHaulerBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [MOVE],
                        defaultCost: 50,
                        extraParts: [CARRY],
                        extraCost: 50,
                        sliceAmount: 17
                    }],
                    "stationaryHauler", {})

                let upgradeHaulerBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [CARRY, CARRY, MOVE],
                        extraCost: 150,
                        sliceAmount: 36
                    }],
                    "upgradeHauler", {})

                let minerBody = roleValues(
                    [{
                        stage: 8,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [WORK, WORK, WORK, WORK, MOVE],
                        extraCost: 450,
                        sliceAmount: 50
                    }],
                    "miner", {})

                let robberBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [],
                        defaultCost: 0,
                        extraParts: [CARRY, MOVE],
                        extraCost: 100,
                        sliceAmount: 24
                    }],
                    "robber", {})

                let scoutBody = roleValues(
                    [{
                        stage: 1,
                        defaultParts: [MOVE],
                        defaultCost: 50,
                        extraParts: [],
                        extraCost: 0,
                        sliceAmount: 1
                    }],
                    "scout", {})

                if (squadType == "ranged") {
                    var antifaAssaulterBody = roleValues(
                        [{
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [RANGED_ATTACK, MOVE],
                            extraCost: 200,
                            sliceAmount: 2
                        }],
                        "antifaAssaulter", {})

                    var antifaSupporterBody = roleValues(
                        [{
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 0,
                            extraParts: [HEAL, MOVE],
                            extraCost: 300,
                            sliceAmount: 2
                        }],
                        "antifaSupporter", {})
                } else if (squadType == "attack") {
                    var antifaAssaulterBody = roleValues(
                        [{
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 50,
                            extraParts: [],
                            extraCost: 0,
                            sliceAmount: 50
                        }],
                        "antifaAssaulter", {})

                    var antifaSupporterBody = roleValues(
                        [{
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 50,
                            extraParts: [],
                            extraCost: 0,
                            sliceAmount: 50
                        }],
                        "antifaSupporter", {})
                } else if (squadType == "dismantle") {
                    var antifaAssaulterBody = roleValues(
                        [{
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 50,
                            extraParts: [WORK, MOVE],
                            extraCost: 150,
                            sliceAmount: 20
                        }],
                        "antifaAssaulter", {})

                    var antifaSupporterBody = roleValues(
                        [{
                            stage: 1,
                            defaultParts: [],
                            defaultCost: 50,
                            extraParts: [HEAL, MOVE],
                            extraCost: 300,
                            sliceAmount: 2
                        }],
                        "antifaSupporter", {})
                }

                let bodies = [harvester1Body, haulerBody, harvester2Body, upgraderBody, builderBody, repairerBody, barricadeUpgraderBody, rangedDefenderBody, upgradeHaulerBody, claimerBody, revolutionaryBuilderBody, minerBody, scientistBody, robberBody, scoutBody, stationaryHaulerBody, communeDefenderBody, remoteHarvester1Body, remoteHaulerBody, remoteHarvester2Body, reserverBody, remoteBuilderBody, antifaSupporterBody, antifaAssaulterBody]

                let i = 0

                for (let role in requiredCreeps) {

                    i++

                    if (i <= room.memory.spawns.length) {

                        let correctBody = _.filter(bodies, function(body) { return body.role == role })

                        let bodyRole = correctBody[0]

                        if (bodyRole.role == role && freeEnergy >= 300) {

                            for (let spawns of room.memory.spawns) {

                                let spawn = Game.getObjectById(spawns)

                                let testSpawn = spawn.spawnCreep(bodyRole.body, bodyRole.role, { dryRun: true })

                                if (testSpawn == 0) {

                                    spawn.spawnCreep(bodyRole.body, (roomFixMessage + bodyRole.role + ", T" + bodyRole.tier + ", " + Game.time), bodyRole.memory)

                                    requiredCreeps[role] - 1

                                    Memory.data.energySpentOnCreeps += bodyRole.cost

                                } else if (testSpawn != -4) {

                                    console.log("Failed to spawn: " + testSpawn + ", " + bodyRole.role + ", " + bodyRole.body.length + ", " + bodyRole.tier + " " + JSON.stringify(bodyRole.memory))
                                }
                            }
                        }
                    }
                }
            }
        })
    }
}