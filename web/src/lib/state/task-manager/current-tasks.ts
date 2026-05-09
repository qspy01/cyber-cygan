import { readonly, writable } from "svelte/store";

import type { CyberCyganWorkerProgress } from "$lib/types/workers";
import type { CyberCyganCurrentTasks, CyberCyganCurrentTaskItem } from "$lib/types/task-manager";

const currentTasks_ = writable<CyberCyganCurrentTasks>({});
export const currentTasks = readonly(currentTasks_);

export function addWorkerToQueue(workerId: string, item: CyberCyganCurrentTaskItem) {
    currentTasks_.update(tasks => {
        tasks[workerId] = item;
        return tasks;
    });
}

export function removeWorkerFromQueue(id: string) {
    currentTasks_.update(tasks => {
        delete tasks[id];
        return tasks;
    });
}

export function updateWorkerProgress(workerId: string, progress: CyberCyganWorkerProgress) {
    currentTasks_.update(allTasks => {
        allTasks[workerId].progress = progress;
        return allTasks;
    });
}

export function clearCurrentTasks() {
    currentTasks_.set({});
}
