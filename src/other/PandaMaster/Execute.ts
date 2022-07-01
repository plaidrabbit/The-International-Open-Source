import Market from './Market'
import ShardVision from './ShardVision'

export default function () {
     if (Memory.me != 'PandaMaster') return

     new ShardVision().Handle()
     new Market().HandleOrderEveryTick()
     RawMemory.segments[98] = JSON.stringify(Memory.stats)
}
