import {IVssRestClientOptions} from "azure-devops-extension-api/Common/Context";
import {Build} from "azure-devops-extension-api/Build";

export enum TaskResult {
    Succeeded = 0,
    SucceededWithIssues = 1,
    Failed = 2,
    Canceled = 3,
    Skipped = 4,
    Abandoned = 5,
    ManuallyQueued = 6,
    DependentOnManualQueue = 7
}

export enum TimelineRecordState {
    Pending = 0,
    InProgress = 1,
    Completed = 2
}

export enum BuildResult {
    /**
     * No result
     */
    None = 0,
    /**
     * The build completed successfully.
     */
    Succeeded = 2,
    /**
     * The build completed compilation successfully but had other errors.
     */
    PartiallySucceeded = 4,
    /**
     * The build completed unsuccessfully.
     */
    Failed = 8,
    /**
     * The build was canceled before starting.
     */
    Canceled = 32
}

/**
 * Accessor mock to be able to overwrite the return value
 * returned by GitRestClient .getItems() method in a unit test
 */
export const mockGetTags = jest.fn().mockReturnValue([]);

export const mockGetBuild = jest.fn().mockReturnValue({
    _links: {
        web: {
            href: "https://buildUrl.com"
        }
    },
    buildNumber: -1,
    result: BuildResult.Succeeded
});

export const mockGetTimeline = jest.fn().mockReturnValue({
    records: [
        {
            id: "1",
            result: TaskResult.Succeeded,
            state: TimelineRecordState.Completed
        },
        {
            id: "2",
            result: TaskResult.Succeeded,
            state: TimelineRecordState.Completed
        }
    ]
});

export class BuildRestClient {
    constructor(options: IVssRestClientOptions) {
    }

    public getTags(project: string) : Promise<string[]> {
        if(project === "buildClient")
        {
            return new Promise((resolve) => resolve(mockGetTags() as string[]));
        }
        else {
            throw new Error(`The project collection does not exists: ${project}`);
        }
    }

    public getBuild(project: string, buildId: number, propertyFilters?: string) : Promise<Build> {
        if(project === "buildClient")
        {
            if(buildId === -1)
            {
                return new Promise((resolve) => resolve(mockGetBuild() as any));
            }
            else {
                throw new Error(`The build does not exists: ${buildId}`);
            }
        }
        else {
            throw new Error(`The project collection does not exists: ${project}`);
        }
    }

    public getBuildTimeline(project: string, buildId: number, timelineId?: string,
                            changeId?: number, planId?: string) : Promise<any> {
        if(project === "buildClient")
        {
            if(buildId === -1)
            {
                return new Promise((resolve) => resolve(mockGetTimeline() as any));
            }
            else {
                throw new Error(`The build does not exists: ${buildId}`);
            }
        }
        else {
            throw new Error(`The project collection does not exists: ${project}`);
        }
    }
}

//#region Build Class

//#endregion