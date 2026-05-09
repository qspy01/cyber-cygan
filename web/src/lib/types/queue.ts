import type { CyberCyganSaveRequestBody } from "$lib/types/api";
import type { CyberCyganPipelineItem, CyberCyganPipelineResultFileType } from "$lib/types/workers";

export type UUID = string;

type CyberCyganQueueBaseItem = {
    id: UUID,
    pipeline: CyberCyganPipelineItem[],
    canRetry?: boolean,
    originalRequest?: CyberCyganSaveRequestBody,
    filename: string,
    mimeType?: string,
    mediaType: CyberCyganPipelineResultFileType,
};

type CyberCyganQueueItemWaiting = CyberCyganQueueBaseItem & {
    state: "waiting",
};

export type CyberCyganQueueItemRunning = CyberCyganQueueBaseItem & {
    state: "running",
    pipelineResults: Record<UUID, File>,
};

type CyberCyganQueueItemDone = CyberCyganQueueBaseItem & {
    state: "done",
    resultFile: File,
};

type CyberCyganQueueItemError = CyberCyganQueueBaseItem & {
    state: "error",
    errorCode: string,
};

export type CyberCyganQueueItem = CyberCyganQueueItemWaiting
                            | CyberCyganQueueItemRunning
                            | CyberCyganQueueItemDone
                            | CyberCyganQueueItemError;

export type CyberCyganQueue = {
    [id: UUID]: CyberCyganQueueItem,
};
