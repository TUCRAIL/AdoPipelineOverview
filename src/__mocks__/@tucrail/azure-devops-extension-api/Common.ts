import {BuildRestClient} from "./Build";
import {GitRestClient} from "./Git";

/** Needed to not break the mock with AMD related ReferenceError: define is not defined */
export const CommonServiceIds = {
    ProjectPageService: "ms.vss-tfs-web.tfs-page-data-service",
    HostPageLayoutService: "ms.vss-features.host-page-layout-service"
}

export function getClient<T>(clientClass: any) {

    if (clientClass.name === BuildRestClient.name) {
        return new BuildRestClient({});
    }
    if(clientClass.name === GitRestClient.name) {
        return new GitRestClient({});
    }

    throw new Error("Client not supported for tests");
}

export const mockGetProject = jest.fn().mockReturnValue({
    id: "buildClient",
    name: "buildClient"
});


export class IProjectPageService {
    /**
     * Gets the project associated with the current page
     */
    getProject(): Promise<IProjectInfo | undefined> {
        return new Promise((resolve) => resolve(mockGetProject()));
    };
}

interface IProjectInfo {
    /**
     * Unique identifier (GUID) of the project
     */
    id: string;
    /**
     * Name of the project
     */
    name: string;
}