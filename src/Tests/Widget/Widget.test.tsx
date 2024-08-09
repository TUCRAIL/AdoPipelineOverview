import {render} from "@testing-library/react";
import {Widget} from "../../widget";
import React from "react";
import {WidgetSettings} from "azure-devops-extension-api/Dashboard";
import {spyWidgetCallBackAccessor} from "../../__mocks__/azure-devops-extension-sdk";
import {filledWidgetConfiguration} from "../../__mocks__/Common";
import {BuildResult, createBuild, mockGetBuilds, mockGetTags} from "../../__mocks__/azure-devops-extension-api/Build";


jest.mock('../../Common');

describe("Widget", () => {
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

        widget.load(args);

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
        widget.load(args);

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
        widget.load(args);

        await delay(1);


    })

    test('Widget - Render with filled configuration and pre-selected tag', async() => {
        render(
            <Widget></Widget>

        )

        await delay(1);
        let configuration = filledWidgetConfiguration;
        configuration.defaultTag = "tag1";
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
        widget.load(args);

        await delay(1);


    })


})



function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}