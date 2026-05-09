import type { FileInfo } from "$lib/types/libav";
import type { UUID } from "./queue";

export const resultFileTypes = ["video", "audio", "image", "file"] as const;

export type CyberCyganPipelineResultFileType = typeof resultFileTypes[number];

export type CyberCyganWorkerProgress = {
    percentage?: number,
    speed?: number,
    size: number,
};

type CyberCyganFFmpegWorkerArgs = {
    files: File[],
    ffargs: string[],
    output: FileInfo,
};

type CyberCyganPipelineItemBase = {
    workerId: UUID,
    parentId: UUID,
    dependsOn?: UUID[],
};

type CyberCyganRemuxPipelineItem = CyberCyganPipelineItemBase & {
    worker: "remux",
    workerArgs: CyberCyganFFmpegWorkerArgs,
}

type CyberCyganEncodePipelineItem = CyberCyganPipelineItemBase & {
    worker: "encode",
    workerArgs: CyberCyganFFmpegWorkerArgs,
}

type CyberCyganFetchPipelineItem = CyberCyganPipelineItemBase & {
    worker: "fetch",
    workerArgs: { url: string },
}

export type CyberCyganPipelineItem = CyberCyganEncodePipelineItem
                               | CyberCyganRemuxPipelineItem
                               | CyberCyganFetchPipelineItem;
