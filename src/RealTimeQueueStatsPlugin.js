import { FlexPlugin } from "flex-plugin";
import React from "react";
import { SideLink, Actions } from "@twilio/flex-ui";
import RealTimeQueueStatsComponent from "./RealTimeQueueStatsComponent";

const PLUGIN_NAME = "RealTimeQueueStatsPlugin";

export default class RealTimeQueueStatsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    // Adds button to side nav that navigates to the view previously added to the view collection above.
    flex.SideNav.Content.add(
      <SideLink
        key="RealTimeQueueStats"
        icon="Data"
        onClick={() =>
          Actions.invokeAction("NavigateToView", {
            viewName: "RealTimeQueueStatsView"
          })
        }
      >
        Real Time Queue Stats
      </SideLink>
    );

    console.log("JARED");
    console.log(manager);

    // Creates accessible view that can later be referenced
    flex.ViewCollection.Content.add(
      <flex.View name="RealTimeQueueStatsView" key="realTimeQueueStats">
        <RealTimeQueueStatsComponent
          key="realTimeQueueStats"
          token={manager.user.token}
          syncMapName="queueStats"
        />
      </flex.View>
    );
  }
}
