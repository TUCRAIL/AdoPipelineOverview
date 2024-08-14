import {IVssRestClientOptions} from "@tucrail/azure-devops-extension-api/Common/Context";
import {Build} from "@tucrail/azure-devops-extension-api/Build";

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
    id: -1,
    result: BuildResult.Succeeded
});

interface MockBuild {
    _links: {
        web: {
            href: string
        }
    },
    buildNumber: number,
    id: number,
    result: BuildResult
}

export function createBuild(result: BuildResult) {
    return {
        _links: {
            web: {
                href: "https://buildUrl.com"
            }
        },
        buildNumber: -1,
        id: -1,
        result: result
    };
}

export const mockGetBuilds = jest.fn().mockReturnValue([]);

export function createDefinition(id: number = 1, name: string = "definitionName") {
    return {
        id: id,
        name: name,
        repository: {
            id: id
        }
    };
}

export const mockGetDefinitions = jest.fn().mockReturnValue([]);

export const mockGetTimeline = jest.fn().mockReturnValue({
    records: [
        {
            id: "1",
            result: TaskResult.Succeeded,
            state: TimelineRecordState.Completed,
            errorCount: 0,
            attempt: 1,
            type: "Stage"
        },
        {
            id: "2",
            result: TaskResult.Succeeded,
            state: TimelineRecordState.Completed,
            errorCount: 0,
            attempt: 1,
            type: "Stage"
        }
    ]
});

interface MockTimelineRecord {
    id: string, result?: TaskResult | undefined, state?: TimelineRecordState,
    errorCount?: number, attempt?: number
}

export function createRecordsForTimeline(records : MockTimelineRecord[]) {
    let recordArray : MockTimelineRecord[]  = [];
    for (const record of records) {
        recordArray.push(createTimelineRecord(record.id, record.result, record.state, record.errorCount, record.attempt));
    }
    return {
        records: recordArray
    };
}

export function createTimelineRecord(id: string, result?: TaskResult | undefined, state?: TimelineRecordState,
                                     errorCount = 0, attempt: number = 1) {
    return {
        id: id,
        result: !result ? undefined : result,
        state: state,
        errorCount: errorCount,
        attempt: attempt,
        type: "Stage"
    }
}

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

    public getBuilds(project: string, definitions?: number[], queues?: number[], buildNumber?: string,
                     minTime?: Date, maxTime?: Date, requestedFor?: string, reasonFilter?: BuildReason,
                     statusFilter?: BuildStatus, resultFilter?: BuildResult, tagFilters?: string[],
                     properties?: string[], top?: number, continuationToken?: string, maxBuildsPerDefinition?: number,
                     deletedFilter?: QueryDeletedOption, queryOrder?: BuildQueryOrder, branchName?: string,
                     buildIds?: number[],
                     repositoryId?: string, repositoryType?: string): Promise<Build[]> {

        if(project === "buildClient")
        {
            if(definitions && definitions.length > 0)
            {
                return new Promise((resolve) => resolve(mockGetBuilds() as any));
            }
            else {
                return  new Promise((resolve) => []);
            }
        }
        else {
            throw new Error(`The project collection does not exists: ${project}`);
        }
    }

    public getDefinitions(project: string, name?: string, repositoryId?: string, repositoryType?: string,
                          queryOrder?: DefinitionQueryOrder, top?: number, continuationToken?: string,
                          minMetricsTime?: Date, definitionIds?: number[], path?: string, builtAfter?: Date,
                          notBuiltAfter?: Date, includeAllProperties?: boolean, includeLatestBuilds?: boolean,
                          taskIdFilter?: string, processType?: number, yamlFilename?: string)
        : Promise<BuildDefinitionReference[]> {
        if(project === "buildClient") {
            return new Promise((resolve) => resolve(mockGetDefinitions() as any));
        }
        else {
            throw new Error(`The project collection does not exists: ${project}`);
        }
    }

}

//#region Build Class

export enum BuildReason {
    /**
     * No reason. This value should not be used.
     */
    None = 0,
    /**
     * The build was started manually.
     */
    Manual = 1,
    /**
     * The build was started for the trigger TriggerType.ContinuousIntegration.
     */
    IndividualCI = 2,
    /**
     * The build was started for the trigger TriggerType.BatchedContinuousIntegration.
     */
    BatchedCI = 4,
    /**
     * The build was started for the trigger TriggerType.Schedule.
     */
    Schedule = 8,
    /**
     * The build was started for the trigger TriggerType.ScheduleForced.
     */
    ScheduleForced = 16,
    /**
     * The build was created by a user.
     */
    UserCreated = 32,
    /**
     * The build was started manually for private validation.
     */
    ValidateShelveset = 64,
    /**
     * The build was started for the trigger ContinuousIntegrationType.Gated.
     */
    CheckInShelveset = 128,
    /**
     * The build was started by a pull request. Added in resource version 3.
     */
    PullRequest = 256,
    /**
     * The build was started when another build completed.
     */
    BuildCompletion = 512,
    /**
     * The build was started when resources in pipeline triggered it
     */
    ResourceTrigger = 1024,
    /**
     * The build was triggered for retention policy purposes.
     */
    Triggered = 1967,
    /**
     * All reasons.
     */
    All = 2031
}

export enum BuildStatus {
    /**
     * No status.
     */
    None = 0,
    /**
     * The build is currently in progress.
     */
    InProgress = 1,
    /**
     * The build has completed.
     */
    Completed = 2,
    /**
     * The build is cancelling
     */
    Cancelling = 4,
    /**
     * The build is inactive in the queue.
     */
    Postponed = 8,
    /**
     * The build has not yet started.
     */
    NotStarted = 32,
    /**
     * All status.
     */
    All = 47
}

export enum QueryDeletedOption {
    /**
     * Include only non-deleted builds.
     */
    ExcludeDeleted = 0,
    /**
     * Include deleted and non-deleted builds.
     */
    IncludeDeleted = 1,
    /**
     * Include only deleted builds.
     */
    OnlyDeleted = 2
}

export enum BuildQueryOrder {
    /**
     * Order by finish time ascending.
     */
    FinishTimeAscending = 2,
    /**
     * Order by finish time descending.
     */
    FinishTimeDescending = 3,
    /**
     * Order by queue time descending.
     */
    QueueTimeDescending = 4,
    /**
     * Order by queue time ascending.
     */
    QueueTimeAscending = 5,
    /**
     * Order by start time descending.
     */
    StartTimeDescending = 6,
    /**
     * Order by start time ascending.
     */
    StartTimeAscending = 7
}

export interface PagedList<T> extends Array<T> {
    /**
     * A string that can be passed to the same endpoint that returned this PagedList in order to retrieve the next page of results.
     */
    continuationToken: string | null;
}

//#endregion

//#region BuildDefinitionReference class
export interface BuildDefinitionReference extends DefinitionReference {
    _links: any;
    /**
     * The author of the definition.
     */
    authoredBy: IdentityRef;
    /**
     * A reference to the definition that this definition is a draft of, if this is a draft definition.
     */
    draftOf: DefinitionReference;
    /**
     * The list of drafts associated with this definition, if this is not a draft definition.
     */
    drafts: DefinitionReference[];
    latestBuild: Build;
    latestCompletedBuild: Build;
}

export interface IdentityRef{
    /**
     * Deprecated - Can be retrieved by querying the Graph user referenced in the "self" entry of the IdentityRef "_links" dictionary
     */
    directoryAlias: string;
    id: string;
    /**
     * Deprecated - Available in the "avatar" entry of the IdentityRef "_links" dictionary
     */
    imageUrl: string;
    /**
     * Deprecated - Can be retrieved by querying the Graph membership state referenced in the "membershipState" entry of the GraphUser "_links" dictionary
     */
    inactive: boolean;
    /**
     * Deprecated - Can be inferred from the subject type of the descriptor (Descriptor.IsAadUserType/Descriptor.IsAadGroupType)
     */
    isAadIdentity: boolean;
    /**
     * Deprecated - Can be inferred from the subject type of the descriptor (Descriptor.IsGroupType)
     */
    isContainer: boolean;
    isDeletedInOrigin: boolean;
    /**
     * Deprecated - not in use in most preexisting implementations of ToIdentityRef
     */
    profileUrl: string;
    /**
     * Deprecated - use Domain+PrincipalName instead
     */
    uniqueName: string;
}

export interface DefinitionReference {
    /**
     * The date this version of the definition was created.
     */
    createdDate: Date;
    /**
     * The ID of the referenced definition.
     */
    id: number;
    /**
     * The name of the referenced definition.
     */
    name: string;
    /**
     * The folder path of the definition.
     */
    path: string;
    /**
     * The definition revision number.
     */
    revision: number;
    /**
     * The definition's URI.
     */
    uri: string;
    /**
     * The REST URL of the definition.
     */
    url: string;
}

export enum DefinitionQueryOrder {
    /**
     * No order
     */
    None = 0,
    /**
     * Order by created on/last modified time ascending.
     */
    LastModifiedAscending = 1,
    /**
     * Order by created on/last modified time descending.
     */
    LastModifiedDescending = 2,
    /**
     * Order by definition name ascending.
     */
    DefinitionNameAscending = 3,
    /**
     * Order by definition name descending.
     */
    DefinitionNameDescending = 4
}

//#endregion