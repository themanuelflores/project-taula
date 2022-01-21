import { TeamId, UserId } from "./Common";
import { Team } from "./Team";
import { User } from "./User";

export type D3User = User & {
  parentNodeId: TeamId | UserId | undefined;
};

export type D3Team = Team & {
  parentNodeId: TeamId | UserId | undefined;
};
