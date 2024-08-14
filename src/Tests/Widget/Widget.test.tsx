import {fireEvent, render, screen} from "@testing-library/react";
import {Widget} from "../../widget";
import React from "react";
import {WidgetSettings} from "@tucrail/azure-devops-extension-api/Dashboard";
import {mockGetProject, spyWidgetCallBackAccessor} from "../../__mocks__/azure-devops-extension-sdk";
import {
    filledWidgetConfiguration, resetMocks
} from "../../__mocks__/Common";
import {BuildResult, createBuild, mockGetBuilds, mockGetTags} from "../../__mocks__/@tucrail/azure-devops-extension-api/Build";


jest.mock('../../Common');


describe("Widget", () => {
    afterEach(() => {
        resetMocks();
    })

    test('Widget - Render with no configuration', async() => {
        render(
                <Widget></Widget>

        )

        await delay(1);
        const args: WidgetSettings = {
            name: "settings",
            size: {
                rowSpan: 3,
                columnSpan: 3
            },
            lightboxOptions: undefined,
            customSettings: {
                version: undefined,
                data: null!
            }
        }

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as Widget;

        await widget.load(args);
        await widget.reload(args);

        await delay(1);


    })

    test('Widget - Render with filled configuration', async() => {
        render(
            <Widget></Widget>

        )

        await delay(1);
        const args: WidgetSettings = {
            name: "settings",
            size: {
                rowSpan: 3,
                columnSpan: 3
            },
            lightboxOptions: undefined,
            customSettings: {
                version: undefined,
                data: JSON.stringify(filledWidgetConfiguration)
            }
        }

        mockGetBuilds.mockReturnValue([
            createBuild(BuildResult.Succeeded)
        ]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as Widget;

        await widget.preload(args);
        await widget.load(args);

        await delay(1);


    })

    test('Widget - Render with filled configuration and tags', async() => {
        render(
            <Widget></Widget>

        )

        await delay(1);
        const args: WidgetSettings = {
            name: "settings",
            size: {
                rowSpan: 3,
                columnSpan: 3
            },
            lightboxOptions: undefined,
            customSettings: {
                version: undefined,
                data: JSON.stringify(filledWidgetConfiguration)
            }
        }

        mockGetBuilds.mockReturnValue([
            createBuild(BuildResult.Succeeded)
        ]);

        mockGetTags.mockReturnValue([
            "tag1",
            "tag2"
        ])

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as Widget;

        await widget.preload(args);
        await widget.load(args);
        await widget.reload(args);

        await delay(1);


    })

    it.each([
        true,
        false
    ])('Widget - Render with filled configuration, pre-selected tag and "matchAnyTag" set to %s', async(matchAnyTag) => {
        render(
            <Widget></Widget>

        )

        await delay(1);
        let configuration = filledWidgetConfiguration;
        configuration.defaultTag = "tag1";
        configuration.matchAnyTag = matchAnyTag;
        const args: WidgetSettings = {
            name: "settings",
            size: {
                rowSpan: 3,
                columnSpan: 3
            },
            lightboxOptions: undefined,
            customSettings: {
                version: undefined,
                data: JSON.stringify(configuration)
            }
        }

        mockGetBuilds.mockReturnValue([
            createBuild(BuildResult.Succeeded)
        ]);

        mockGetTags.mockReturnValue([
            "tag1",
            "tag2"
        ])

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as Widget;

        await widget.preload(args);
        await widget.load(args);

        await delay(1);


    })

    test("Widget - Render tag selection dropdown, select a tag then clear them all", async () => {
        render(
            <Widget></Widget>

        )

        await delay(1);
        const args: WidgetSettings = {
            name: "settings",
            size: {
                rowSpan: 3,
                columnSpan: 3
            },
            lightboxOptions: undefined,
            customSettings: {
                version: undefined,
                data: JSON.stringify(filledWidgetConfiguration)
            }
        }

        mockGetBuilds.mockReturnValue([
            createBuild(BuildResult.Succeeded)
        ]);

        mockGetTags.mockReturnValue([
            "tag1",
            "tag2"
        ])

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as Widget;

        await widget.preload(args);
        await widget.load(args);
        await widget.reload(args);

        await delay(1);

        await delay(500);

        const tagDropdown = screen.getByRole("button");
        fireEvent.click(tagDropdown);
        await delay(500);
        const tagElementToClick = screen.getByText("tag2", {exact: false});
        fireEvent.click(tagElementToClick);
        const clearElement = screen.getByText("Clear", {exact: false});
        fireEvent.click(clearElement);
    })

    test("Widget - Render with invalid data", async () => {
        render(
            <Widget></Widget>

        )

        await delay(1);
        const args: WidgetSettings = {
            name: "settings",
            size: {
                rowSpan: 3,
                columnSpan: 3
            },
            lightboxOptions: undefined,
            customSettings: {
                version: undefined,
                data: JSON.stringify(filledWidgetConfiguration)
            }
        }

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as Widget;

        mockGetProject.mockReturnValue({
            id: "invalidId",
            name: "Invalid project"
        })

        await widget.load(args);
        await widget.reload(args);

        await delay(1);
    });
})




function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}