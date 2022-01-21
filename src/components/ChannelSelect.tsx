import React, { ChangeEventHandler } from "react";
import { getChannelsData } from "../controllers/JsonDataLoader";
import { populateChannelOptions } from "../controllers/DataTransform";
import { DropdownOptions, ChannelId } from "../models/Common";

type ChannelSelectProps = {
  onChange: (channelId: ChannelId) => void;
};

// less shamelessly adapted from https://dev.to/antdp425/populate-dropdown-options-in-react-1nk0
const ChannelSelect: React.FC<ChannelSelectProps> = ({ onChange }) => {
  const channels = getChannelsData();
  const channelOptions: Array<DropdownOptions<ChannelId>> =
    populateChannelOptions(channels);

  const handleChannelChange: ChangeEventHandler<HTMLSelectElement> = (
    event: React.FormEvent<HTMLSelectElement>
  ) => {
    const channelIndex: number = +event.currentTarget.value;
    onChange(channelOptions[channelIndex].value);
  };

  return (
    <div>
      {/* #{channelOptions[selected].label} */}
      <br />
      <select onChange={handleChannelChange}>
        <option value="">Select a channel</option>
        {channelOptions.map((channel, index) => (
          <option key={index} value={index}>
            {channel.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChannelSelect;
