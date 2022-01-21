import React, { useLayoutEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { OrgChart, State as D3State } from "d3-org-chart";
import { HierarchyNode } from "d3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { Team, TeamMap } from "../models/Team";
import { UserMap } from "../models/User";
import { D3Team } from "../models/D3";
import { getConsolidatedTeamIdsByTeamId } from "../controllers/DataTransform";
import { ChannelId, TeamId } from "../models/Common";

type OrgChartProps = {
  data: any;
  users: UserMap;
  teams: TeamMap;
  channelId: string;
  setClick?: (arg0: (node: any) => void) => void;
  onNodeClick?: (arg0: any) => void;
};

const OrgChartComponent = (props: OrgChartProps, ref: any) => {
  const d3Container = useRef(null);
  let chart: OrgChart<any>;

  function hierarchyWithChannelRoot(
    channelId: ChannelId,
    teams: TeamMap
  ): Array<D3Team> {
    const allTeams: Array<D3Team> = [];

    // "C" is the 'null' value for ChannelId
    if (channelId === undefined || channelId === "C") {
      return allTeams;
    }

    // find "root" team for channel (even if other teams consolidate into it)
    for (const id in teams) {
      const teamId: TeamId = id as TeamId;
      const specificTeam: Team = teams[teamId];

      if (specificTeam.teamSettings != undefined) {
        const { teamSettings } = specificTeam;
        if (
          teamSettings.channelId != undefined &&
          teamSettings.channelId === channelId
        ) {
          const rootTeam: D3Team = {
            ...specificTeam,
            parentNodeId: undefined,
          };

          // TODO(@themanuelflores) consider memoizing this somehow? each channel will only have one "root" team ...
          allTeams.push(rootTeam);
          break;
        }
      }
    }

    // for every team that consolidates (directly/indirectly) into "root" team, set their parentNodeId
    if (allTeams.length >= 1) {
      const teamIds: Set<TeamId> = getConsolidatedTeamIdsByTeamId(
        allTeams[0].id,
        teams
      );
      const consolidatedTeams: Array<Team> = [];

      teamIds.forEach((teamId) => consolidatedTeams.push(teams[teamId]));

      for (const team of consolidatedTeams) {
        const consolidatedTeam: D3Team = {
          ...team,
          parentNodeId: team.teamSettings.primaryTeam,
        };
        allTeams.push(consolidatedTeam);
      }
    }

    return allTeams;
  }

  useLayoutEffect(() => {
    const selectedChannelId: ChannelId = props.channelId as ChannelId;
    const hierarchy = hierarchyWithChannelRoot(selectedChannelId, props.teams);

    if (hierarchy && hierarchy.length > 0 && d3Container.current) {
      if (!chart) {
        chart = new OrgChart();
      }

      // shamelessly adapted from https://stackblitz.com/edit/d3-org-chart-react-integration-hooks?file=OrgChart.js
      chart
        .container(d3Container.current)
        .data(hierarchy)
        .nodeWidth(() => 250)
        .nodeHeight(() => 175)
        .initialZoom(0.75)
        .childrenMargin(() => 40)
        .compactMarginBetween(() => 15)
        .compactMarginPair(() => 80)
        .nodeContent(
          (
            node: HierarchyNode<D3Team>,
            _index: number,
            _nodes: Array<HierarchyNode<D3Team>>,
            _state: D3State
          ) => {
            const nodeElement = (
              <div
                style={{
                  paddingTop: "30px",
                  backgroundColor: "none",
                  marginLeft: "1px",
                  height: `${node.height}px`,
                  borderRadius: "2px",
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    height: `${node.height}px`,
                    paddingTop: 0,
                    backgroundColor: "white",
                    border: "1px solid lightgray",
                  }}
                >
                  <div>Team Name: {node.data.name}</div>
                  <div>Manager: {props.users[node.data.manager].realName}</div>
                  <div>Team Member Count: {node.data.members.length}</div>
                </div>
              </div>
            );

            return renderToString(nodeElement);
          }
        )
        .buttonContent(({ node, state }) => {
          const memberCount: number = node.data.teamSettings.consolidatedTeams
            ? node.data.teamSettings.consolidatedTeams.length
            : 0;
          const buttonElement = (
            <div
              style={{
                fontSize: "3px",
                color: "#716E7B",
                borderRadius: "5px",
                padding: "4px",
                margin: "auto auto",
                backgroundColor: "white",
                border: "1px solid #E4E2E9",
              }}
            >
              <span style={{ fontSize: "16px" }}>
                {node.children ? (
                  <FontAwesomeIcon icon={faAngleUp} />
                ) : (
                  <FontAwesomeIcon icon={faAngleDown} />
                )}{" "}
                {memberCount}
              </span>
            </div>
          );
          return renderToString(buttonElement);
        })
        .onNodeClick((node) => props.onNodeClick && props.onNodeClick(node))
        .render();
    }
  }, [props.users, props.teams, props.channelId]);

  return (
    <div>
      <div ref={d3Container} />
    </div>
  );
};

export default OrgChartComponent;
