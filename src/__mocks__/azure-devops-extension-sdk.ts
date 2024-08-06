import {IHostContext, IUserContext} from "azure-devops-extension-sdk";

/**
 * Mocking SDK's init function to return
 * resolve(successful execution/init) to activate the .then block
 */
export function init() : Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

/**
 * Indirect accessor to mocked getConfiguration values
 * here for "RepositoryId" with defaultValue "gitrepo".
 * The value can be overwritten in the test file by importing mockRepositoryId
 * and calling mockRepositoryId.mockReturnValue("other_value")
 */
export const mockRepositoryId = jest.fn().mockReturnValue("gitrepo");

/**
 * Mocking SDK.getConfiguration(), will return witInput parameters for all controls
 */
export function getConfiguration() {
    return {
        witInputs: {
            AppInsightsInstrumentationKey: "",
            LoggingLevel: "0",
            baseEndpointURL: "https://localhost:5000",
            DevOpsBaseUrl: "https://dev.azure.com/",
            RepositoryId: mockRepositoryId(),
            ProjectName: "react-unit-test",
            BranchName: "master",
            FieldName: "myField"
        }
    }
}

/**
 * Mocking SDK.getHost() and provide fixed values
 */
export function getHost(): IHostContext {
    return {
        id: "react-unit-test",
        name: "react-unit-test",
        isHosted: false,
        serviceVersion: "mockedVersion",
        type: 1
    }
}

/**
 * Mocking SDK.getUser() and provide fixed values
 */
export function getUser() : IUserContext {
    return {
        descriptor: "aad.base64",
        id: "jestwagner",
        displayName: "Jest Wagner",
        imageUrl: "https://someimageurl/jw.png",
        name: "jestwagner@email.com",
    }
}

export const mockGetFieldValue = jest.fn(); // .getFieldValue()