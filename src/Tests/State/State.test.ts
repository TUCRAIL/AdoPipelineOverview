import {
    filledWidgetConfiguration,
    filledWidgetConfigurationAsConfigurationState,
    widgetConfigurationEqualsConfigurationWidgetState,
    widgetConfigurationEqualsWidgetState
} from "../../__mocks__/Common";
import {
    BuildResultRowState,
    ConfigurationWidgetState,
    IBuildResultRowProps,
    IStageResultCellProps,
    StageResultCellState,
    WidgetConfigurationSettings,
    WidgetState
} from "../../State";
import {TimelineRecord, TimelineRecordState} from "@tucrail/azure-devops-extension-api/Build";

jest.mock('../../Common');


describe("State", () => {

    describe("WidgetState", () => {

        test("State - WidgetState - Test configuration V1 to widget state", () => {
            const configuration = filledWidgetConfiguration;
            const state = WidgetState.fromWidgetConfigurationSettings(configuration);

            widgetConfigurationEqualsWidgetState(configuration, state);
        });

        test("State - WidgetState - Test configuration V2 to widget state", () => {
            let configuration = filledWidgetConfiguration;
            configuration.buildCount = 1;
            const  state = WidgetState.fromWidgetConfigurationSettings(configuration);

            widgetConfigurationEqualsWidgetState(configuration, state);
        });

        test("State - WidgetState - Can clone widget state", () => {
            const state = WidgetState.fromWidgetConfigurationSettings(filledWidgetConfiguration);

            const clonedState = state.clone();

            expect(state).toEqual(clonedState);
        });

        test("State - WidgetState - Can copy widget state", () => {

            const state = WidgetState.fromWidgetConfigurationSettings(filledWidgetConfiguration);
            const originalState = WidgetState.getEmptyObject();
            originalState.copy(state);

            expect(state).toEqual(originalState);
        });

        test("State - WidgetState - Can create empty object", () => {
            const emptyState = WidgetState.getEmptyObject();
            const expectedState = new WidgetState("", -1, "", "all", 1, true, false);

            expect(emptyState).toEqual(expectedState);
        });
    });

    describe("ConfigurationWidgetState", () => {

        test("State - ConfigurationWidgetState - Can copy configuration state", () => {

            const state = ConfigurationWidgetState.fromWidgetConfigurationSettings(filledWidgetConfiguration);
            const originalState = ConfigurationWidgetState.getEmptyObject();
            originalState.copy(state);

            expect(state).toEqual(originalState);
        });

        test("State - ConfigurationWidgetState - Can clone configuration state", () => {
            const state = ConfigurationWidgetState.fromWidgetConfigurationSettings(filledWidgetConfiguration);

            const clonedState = state.clone();

            expect(state).toEqual(clonedState);
        });

        test("State - ConfigurationWidgetState - Can create empty object", () => {
            const emptyState = ConfigurationWidgetState.getEmptyObject();
            const expectedState = new ConfigurationWidgetState(-1, "",
                "all", 1, true, true, false);

            expect(emptyState).toEqual(expectedState);
        });

        test("State - ConfigurationWidgetState - Test configuration V1 to widget state", () => {
            const configuration = filledWidgetConfiguration;
            const state = ConfigurationWidgetState.fromWidgetConfigurationSettings(configuration);

            widgetConfigurationEqualsConfigurationWidgetState(configuration, state, "definitionName");


        });

        test("State - ConfigurationWidgetState - Test configuration V2 to widget state", () => {
            let configuration = filledWidgetConfiguration;
            configuration.buildCount = 1;
            const  state = ConfigurationWidgetState.fromWidgetConfigurationSettings(configuration);

            widgetConfigurationEqualsConfigurationWidgetState(configuration, state, "definitionName");
        });

        test("State - ConfigurationWidgetState - Test widget state to configuration V2", () => {
            const state = filledWidgetConfigurationAsConfigurationState;
            const configuration = ConfigurationWidgetState.toWidgetConfigurationSettings(state,
                "definitionName");

            widgetConfigurationEqualsConfigurationWidgetState(configuration, state, "definitionName");
        })
    });

    describe("WidgetConfigurationSettings", () => {
        test("State - WidgetConfigurationSettings - Can create empty object", () => {
            const emptyState = WidgetConfigurationSettings.getEmptyObject();
            const expectedState = new WidgetConfigurationSettings(-1, "",
                "", 1, "all",
                true, false);

            expect(emptyState).toEqual(expectedState);
        });

        test("State - WidgetConfigurationSettings - Can clone object", () => {
            const emptyState = WidgetConfigurationSettings.getEmptyObject();
            const expectedState = emptyState.clone();

            expect(emptyState).toEqual(expectedState);
        });
    });

    describe("BuildResultRowState", () => {
       test("BuildResultRowState - Can create from properties", () => {
          const props = {
              buildIndex: 1,
              showStages: true,
              build: {
                  build: {
                      id: 0
                  },
                  timeline: {
                      id: 'test id'
                  }
              }
          } as IBuildResultRowProps;
          const state = BuildResultRowState.createStateFromProperties(props);

            expect(state.buildIndex).toEqual(1);
            expect(state.showStages).toBeTruthy();
            expect(state.build.build.id).toEqual(0);
            expect(state.build.timeline.id).toEqual('test id');
       });

       test("BuildResultRowState - Can retrieve previous timeline record", () => {
           const records = [
               {
                   state: TimelineRecordState.InProgress
               },
               {
                   state: TimelineRecordState.Completed
               }
           ] as TimelineRecord[];
           const recordState = BuildResultRowState.getPreviousTimelineRecordStateForIndex(records, 1);
            expect(recordState).toEqual(TimelineRecordState.InProgress);
       });

        test("BuildResultRowState - Can retrieve previous timeline record as undefined", () => {
            const records = [
                {
                    state: TimelineRecordState.InProgress
                }
            ] as TimelineRecord[];
            const recordState = BuildResultRowState.getPreviousTimelineRecordStateForIndex(records, 1);
            expect(recordState).toEqual(undefined);
        });
    });

    describe("StageResultCellState", () => {
        test("StageResultCellState - Can create from properties", () => {
           const props = {
               buildIndex: 0,
                isMultiStage: false,
                timelineIndex: 0,
                timelineRecord: {
                    id: '1',
                    state: TimelineRecordState.Completed
                } as TimelineRecord,
                previousTimelineRecordState: TimelineRecordState.InProgress
           } as IStageResultCellProps;
           const state = StageResultCellState.createStateFromProperties(props);

                expect(state.buildIndex).toEqual(0);
                expect(state.isMultiStage).toBeFalsy();
                expect(state.timelineIndex).toEqual(0);
                expect(state.timelineRecord!.id).toEqual('1');
                expect(state.timelineRecord!.state).toEqual(TimelineRecordState.Completed);
                expect(state.previousTimelineRecordState).toEqual(TimelineRecordState.InProgress);
        });

        test("StageResultCellState - Can return timelineRecord undefined", () => {
            const props = {
                buildIndex: 0,
                isMultiStage: false,
                timelineIndex: 0,
                timelineRecord: undefined,
                previousTimelineRecordState: TimelineRecordState.InProgress
            } as IStageResultCellProps;
            const state = StageResultCellState.createStateFromProperties(props);

            expect(state.timelineRecord).toEqual(undefined);
        });

        test("StageResultCellState - Can return previousTimelineRecordState undefined", () => {
            const props = {
                buildIndex: 0,
                isMultiStage: false,
                timelineIndex: 0,
                timelineRecord: {
                    id: '1',
                    state: TimelineRecordState.Completed
                } as TimelineRecord,
                previousTimelineRecordState: undefined
            } as IStageResultCellProps;
            const state = StageResultCellState.createStateFromProperties(props);

            expect(state.previousTimelineRecordState).toEqual(undefined);
        });
    });
});