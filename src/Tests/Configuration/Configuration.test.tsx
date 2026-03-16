import {filledWidgetConfiguration, resetMocks} from "../../__mocks__/Common";
import {fireEvent, getByDisplayValue, getByText, render, screen, waitFor} from "@testing-library/react";
import {ConfigurationWidget} from "../../configuration";
import React from "react";
import {WidgetSettings} from "@tucrail/azure-devops-extension-api/Dashboard";
import {spyWidgetCallBackAccessor} from "../../__mocks__/azure-devops-extension-sdk";
import {IWidgetConfigurationContext} from "../../__mocks__/@tucrail/azure-devops-extension-api/Dashboard";
import {createDefinition, mockGetDefinitions, mockGetTags} from "../../__mocks__/@tucrail/azure-devops-extension-api/Build";
import {createBranchStat, mockGetBranches} from "../../__mocks__/@tucrail/azure-devops-extension-api/Git";
import {ConfigurationWidgetState} from "../../State";
import {Simulate} from "react-dom/test-utils";
import click = Simulate.click;


jest.mock('../../Common');

describe("Configuration", () => {
    afterEach(() => {
        resetMocks();
    });

    test('ConfigurationWidget - Render with no configuration settings', async () => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);
        await widget.reload(args);

        await delay(1);

        expect(widget.state).toEqual(ConfigurationWidgetState.getEmptyObject());
    });

    test('Configuration - Render with no configuration settings and definition not empty', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition()
        ]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);
    });

    test('Configuration - Render with configuration and definition not empty', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition()
        ]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);
    });

    test('Configuration - Render with configuration and definition or branches not empty', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition()
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);
    });

    test('Configuration - Render with matching branch', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )

        let configuration = filledWidgetConfiguration.clone();

        configuration.buildBranch = "master";


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
                data: JSON.stringify(configuration)
            }
        }
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition()
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        expect(widget.state.selectedBranches).toEqual("refs/heads/master");
    });

    test('Configuration - Render with matching branch starting with refs/heads/ in the configuration', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )

        let configuration = filledWidgetConfiguration.clone();

        configuration.buildBranch = "refs/heads/master";


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
                data: JSON.stringify(configuration)
            }
        }
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition()
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        expect(widget.state.selectedBranches.replace("refs/heads/", '')).toEqual("master");

    });

    test('Configuration - Render with matching branch starting with tags', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )

        let configuration = filledWidgetConfiguration.clone();

        configuration.buildBranch = "refs/heads/master";
        configuration.defaultTag = "uat";


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
                data: JSON.stringify(configuration)
            }
        }
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition()
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue(["uat"]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        expect(widget.state.selectedBranches.replace("refs/heads/", '')).toEqual("master");

    });

    test('Configuration - Test onBuildDropdownChange', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "test")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue(["uat"]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        const buildDefinitionDropdown = screen.getByDisplayValue("Select a build definition");

        click(buildDefinitionDropdown);

        await screen.findByText("test");

        click(screen.getByText("test"));

    });

    it.each([
        [NaN, 1],
        [
            5, 5
        ],
        [
            51, 1
        ],
        [
            0, 1
        ],
        [
            50, 50
        ]
    ])('Configuration - Test onBuildCountChanged with new value %d and expected result %d',
        async(newValue, expectedResult) => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "test")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue(["uat"]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        const buildCountTextField = screen.getByDisplayValue("1");

        fireEvent.change(buildCountTextField, {target: {value: newValue}});

        await delay(200);

        expect(widget.state.buildCount).toEqual(expectedResult);
    });

    test('Configuration - Test onShowStagesCHanged', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "test")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue(["uat"]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        const showStagesCheckbox = screen.getByRole("checkbox");

        click(showStagesCheckbox);

        await delay(200);

        expect(widget.state.showStages).toEqual(false);
    });

    test('Configuration - Test onTagToggleChanged', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "test")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue(["uat"]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        const matchAnySwitch = screen.getByRole("switch");

        click(matchAnySwitch);

        await delay(200);

        expect(widget.state.matchAnyTagSelected).toEqual(true);
    });

    test('Configuration - Test onTagDropdownSelectionClicked', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )


        let configuration = filledWidgetConfiguration.clone();

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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "definitionName")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue(["uat", "prd"]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        const tagDropdownContainer = screen.getByRole("tag-dropdown");


        const tagDropdown = tagDropdownContainer
            .getElementsByTagName("input")[0];

        click(tagDropdown);

        const uatTag = await screen.findByText("uat");

        click(uatTag);

        const prdTag = await screen.findByText("prd");

        click(prdTag);

        await waitFor(() => {
            expect(["uat,prd", "prd,uat"]).toContain(widget.state.selectedTag);
        });

    });

    test('Configuration - Test multi-branch selection with two branches', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )

        // Use a config with no pre-selected branch so items start selectable (not in "Select All" mode)
        let configuration = filledWidgetConfiguration.clone();
        configuration.buildBranch = "";

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
                data: JSON.stringify(configuration)
            }
        }
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "definitionName")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master"),
            createBranchStat("develop")
        ]);

        mockGetTags.mockReturnValue([]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        const branchDropdownContainer = screen.getByRole("branch-dropdown");
        const branchDropdown = branchDropdownContainer.getElementsByTagName("input")[0];

        click(branchDropdown);

        const masterBranch = await screen.findByText("master");
        click(masterBranch);

        const developBranch = await screen.findByText("develop");
        click(developBranch);

        await waitFor(() => {
            expect(["refs/heads/master,refs/heads/develop", "refs/heads/develop,refs/heads/master"])
                .toContain(widget.state.selectedBranches);
        });
    });

    test('Configuration - Test backward compat: old single branch (without refs/heads/) is normalized', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )

        let configuration = filledWidgetConfiguration.clone();
        configuration.buildBranch = "master";

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
                data: JSON.stringify(configuration)
            }
        }
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "definitionName")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue([]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        // Legacy "master" is auto-migrated to "refs/heads/master" in the multi-select state
        expect(widget.state.selectedBranches).toEqual("refs/heads/master");
    });

    test('Configuration - Validate that no branches selected results in invalid configuration', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
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
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "definitionName")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue([]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        // Simulate clearing all branch selections (state = "none" = no branches explicitly selected)
        widget.setState({ selectedBranches: "none" });

        await delay(200);

        const result = await widget.onSave();

        // @ts-ignore
        expect(result.isValid).toEqual(false);
    });

    test('Configuration - Validate that at least one branch selected results in valid configuration', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )

        let configuration = filledWidgetConfiguration.clone();
        configuration.buildBranch = "refs/heads/master";

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
                data: JSON.stringify(configuration)
            }
        }
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "definitionName")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue([]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        const result = await widget.onSave();

        // @ts-ignore
        expect(result.isValid).toEqual(true);
    });

    test('Configuration - Validate that "Select All" (selectedBranches="all") results in valid configuration', async() => {
        render(
            <ConfigurationWidget></ConfigurationWidget>
        )

        let configuration = filledWidgetConfiguration.clone();
        configuration.buildBranch = "refs/heads/master";

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
                data: JSON.stringify(configuration)
            }
        }
        const widgetContext = new IWidgetConfigurationContext();

        mockGetDefinitions.mockReturnValue([
            createDefinition(1, "definitionName")
        ]);

        mockGetBranches.mockReturnValue([
            createBranchStat("master")
        ]);

        mockGetTags.mockReturnValue([]);

        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;

        await widget.load(args, widgetContext);

        await delay(1);

        // Simulate "Select All" click which sets selectedBranches to "all"
        widget.setState({ selectedBranches: "all" });

        await delay(200);

        const result = await widget.onSave();

        // @ts-ignore
        expect(result.isValid).toEqual(true);
    });

    // it.each([])("Configuration - Test placeholder text for %s with expected result text '%s'",
    //     (element, placeholderText) => {});
})

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}