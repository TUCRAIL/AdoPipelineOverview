// import {Build} from "@tucrail/azure-devops-extension-api/Build";
// import {
//     BuildQueryOrder,
//     BuildReason,
//     BuildResult,
//     BuildStatus,
//     QueryDeletedOption
// } from "../__mocks__/azure-devops-extension-api/Build";
//
// module RestClients {
//     export class BuildRestClient {
//         private readonly accessToken : string;
//         private readonly baseUrl: string;
//
//         private readonly getBuildsUrl = '/_apis/build/builds';
//         private readonly getBuildUrl = (id: number) => {
//             return `${this.getBuildsUrl}/${id}`;
//         }
//         private readonly getDefinitionsUrl = '/_apis/build/definitions';
//         private readonly getBuildTimelineUrl = (buildId: number) => {
//             return `${this.getBuildUrl(buildId)}/timeline`;
//         }
//         private readonly getTagsUrl = (project: string) => {
//             return `/_apis/build/tags`;
//         }
//
//         public static apiVersion = '5.1';
//
//         constructor(baseUrl: string, accessToken: string) {
//             this.baseUrl = baseUrl;
//             this.accessToken = accessToken;
//         }
//
//         async getBuilds() : Promise<Build[]> {
//
//
//         }
//     }
// }
//
