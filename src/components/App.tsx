/* eslint-disable @typescript-eslint/no-unused-vars */
// React is needed for the ModalProvider
import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { useModal } from "react-modal-hook";
import "../styles/index.css";
import {
  TransformedResults,
  transformTeams,
} from "../controllers/DataTransform";
import { getTeamsData } from "../controllers/JsonDataLoader";
import { TeamMap } from "../models/Team";
import { User, UserMap } from "../models/User";
import { ChannelId, TeamId } from "../models/Common";
import OrgChartComponent from "./OrgChart";
import ChannelSelect from "./ChannelSelect";
import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const App = () => {
  const [rootChannelId, setRootChannelId] = useState<ChannelId>("C");
  const [teamResults, setTeamResults] = useState<TransformedResults>({
    users: {},
    teams: {},
  });
  const [teams, setTeams] = useState<TeamMap>({});
  const [users, setUsers] = useState<UserMap>({});
  const [teamMembers, setTeamMembers] = useState<Array<User>>([]);
  const [teamName, setTeamName] = useState<string>("");

  function handleChannelIdChange(channelId: ChannelId) {
    setRootChannelId(channelId);
  }

  function handleOnD3NodeClick(id: string) {
    const teamId: TeamId = id as TeamId;
    const teamMembers: Array<User> = teams[teamId].members.map(
      (userId) => users[userId]
    );
    setTeamName(teams[teamId].name);
    setTeamMembers(teamMembers);
    showModal();
  }

  function handleCloseModal() {
    setTeamMembers([]);
    setTeamName("");
    hideModal();
  }

  // TODO(@themanuelflores) figure out how to get rid of Modal.setApp(el) console warning to remove areaHideApp property
  const [showModal, hideModal] = useModal(
    () => (
      <ReactModal isOpen onRequestClose={handleCloseModal} ariaHideApp={false}>
        {/* TODO(@themanuelflores) Need better styling to get the title and close button on same row */}
        <div
          id="modal-header"
          style={{ justifyContent: "right", textAlign: "right" }}
        >
          <button type="button" onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          <h3
            className="modal-title"
            style={{ justifyContent: "left", textAlign: "left" }}
          >
            {teamName}
          </h3>
        </div>
        <div id="modal-content">
          <ul className="list-group">
            {teamMembers.map((teamMember) => (
              <li key={teamMember.id}>
                <FontAwesomeIcon icon={faUser} size="sm" />
                {teamMember.realName}
              </li>
            ))}
          </ul>
        </div>
      </ReactModal>
    ),
    [teamMembers]
  );

  useEffect(() => {
    const fetchData = async () => {
      const jsonData = getTeamsData();
      const results: TransformedResults = transformTeams(jsonData);
      setTeamResults(results);

      const { teams, users } = results;
      setUsers(users);
      setTeams(teams);
    };

    fetchData();
  }, [true]);

  return (
    <div>
      <h1>Org Chart</h1>
      <ChannelSelect onChange={handleChannelIdChange} />
      <OrgChartComponent
        data={teamResults}
        users={users}
        teams={teams}
        channelId={rootChannelId}
        onNodeClick={handleOnD3NodeClick}
      />
    </div>
  );
};

export default App;
