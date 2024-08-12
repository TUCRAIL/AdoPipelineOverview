import {IVssRestClientOptions} from "azure-devops-extension-api/Common/Context";
import {GitCommitRef, GitVersionOptions, GitVersionType} from "azure-devops-extension-api/Git/Git";


export interface GitVersionDescriptor {
    /**
     * Version string identifier (name of tag/branch, SHA1 of commit)
     */
    version: string;
    /**
     * Version options - Specify additional modifiers to version (e.g Previous)
     */
    versionOptions: GitVersionOptions;
    /**
     * Version type (branch, tag, or commit). Determines how Id is interpreted
     */
    versionType: GitVersionType;
}

export interface GitBranchStats {
    /**
     * Number of commits ahead.
     */
    aheadCount: number;
    /**
     * Number of commits behind.
     */
    behindCount: number;
    /**
     * Current commit.
     */
    commit: GitCommitRef;
    /**
     * True if this is the result for the base version.
     */
    isBaseVersion: boolean;
    /**
     * Name of the ref.
     */
    name: string;
}

export function createBranchStat(name: string) : GitBranchStats {
    return {
        name: name,
        aheadCount: 0,
        behindCount: 0,
        commit: {
            _links:  {},
            commitId: 'id',
            author: null!,
            url: null!,
            comment: null!,
            commentTruncated: false,
            changes: [],
            committer: null!,
            parents: [],
            push: null!,
            changeCounts: null!,
            commitTooManyChanges: false,
            remoteUrl: null!,
            statuses: null!,
            workItems: null!
        },
        isBaseVersion: true
    }
}

export const mockGetBranches = jest.fn().mockReturnValue([]);

export class GitRestClient {
    constructor(options: IVssRestClientOptions) {
    }

    public getBranches(repositoryId: string, project?: string, baseVersionDescriptor?: GitVersionDescriptor) : Promise<GitBranchStats[]> {
        return new Promise((resolve) => resolve(mockGetBranches()));
    }
}