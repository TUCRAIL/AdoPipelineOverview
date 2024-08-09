import {BuildRestClient} from "./Build";

/** Needed to not break the mock with AMD related ReferenceError: define is not defined */
export const CommonServiceIds = {
    ProjectPageService: "ms.vss-tfs-web.tfs-page-data-service"
}

export function getClient<T>(clientClass: any) {

    if (typeof clientClass === typeof BuildRestClient) {
        return new BuildRestClient({});
    }

}
