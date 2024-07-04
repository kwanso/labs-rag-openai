import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { Box } from "@mui/material";
import { FC } from "react";
import Styles from "./MessageLayout.module.css";

import { ReacionEnum } from "./ChatBox";
import { MessageLayoutProps } from "./MessageLayout";

type ReactionsProps = MessageLayoutProps & {};

const Reactions: FC<ReactionsProps> = ({ message, updateMessageList }) => {
  const addReaction = (reaction: ReacionEnum) => {
    updateMessageList({ ...message, reaction: reaction });
  };

  return (
    <Box className={Styles.reactionLayout}>
      <ThumbUpIcon fill="whiteSmoke" onClick={() => addReaction(ReacionEnum.ThumbsUp)} />
      <ThumbDownIcon fill="whiteSmoke" onClick={() => addReaction(ReacionEnum.ThumbsDown)} />
    </Box>
  );
};

export default Reactions;
