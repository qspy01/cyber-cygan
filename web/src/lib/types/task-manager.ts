import type { CyberCyganPipelineItem, CyberCyganWorkerProgress } from "$lib/types/workers";
import type { UUID } from "./queue";

export type CyberCyganCurrentTaskItem = {
    type: CyberCyganPipelineItem['worker'],
    parentId: UUID,
    progress?: CyberCyganWorkerProgress,
}

export type CyberCyganCurrentTasks = {
    [id: UUID]: CyberCyganCurrentTaskItem,
}
