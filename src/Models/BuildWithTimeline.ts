import {Build, Timeline} from "@tucrail/azure-devops-extension-api/Build";

export class BuildWithTimeline {
    public build: Build
    public timeline: Timeline

    constructor(build: Build, timeline: Timeline) {
        this.build = build
        this.timeline = timeline
    }

}