import AndroidIcon from "@mui/icons-material/Android";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { Avatar, Box, Typography, styled } from "@mui/material";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { FC } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageType, ReacionEnum, SenderEnum } from "./ChatBox";
import Styles from "./MessageLayout.module.css";
import Reactions from "./Reactions";

export interface MessageLayoutProps {
  message: MessageType;
  updateMessageList: (newMsg: MessageType) => void;
}

const ReactionsCotainer = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} placement="bottom-start" />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#7277c7",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#7277c7",
    padding: "0.5rem",
    borderRadius: "15px",
  },
}));

const MessageLayout: FC<MessageLayoutProps> = (props) => {
  const { message } = props;
  const isClient = message.sender === SenderEnum.Client;

  const messageText = message?.text || "";

  return (
    <Box display="flex" width="100%" justifyContent={isClient ? "end" : "start"} gap="0.5rem">
      {!isClient ? (
        <>
          <Avatar className={Styles.avatar} style={{ marginLeft: "5px" }}>
            <AndroidIcon />
          </Avatar>

          <ReactionsCotainer title={<Reactions {...props} />}>
            <Box className={`${Styles.layout} ${Styles.pointer}`}>
              <Markdown className={Styles.formatedText} remarkPlugins={[remarkGfm]}>
                {messageText}
              </Markdown>
              <Box className={Styles.arrow}></Box>
              {message?.reaction && (
                <Box
                  position="absolute"
                  left="2px"
                  bottom="-10px"
                  width="fitContent"
                  borderRadius="40%"
                  bgcolor="#e9e7e7"
                  color="whitesmoke"
                  border="1px solid #7277c7"
                  padding="3px"
                >
                  {message.reaction === ReacionEnum.ThumbsUp ? (
                    <ThumbUpIcon className={Styles.selectedReaction} />
                  ) : (
                    <ThumbDownIcon className={Styles.selectedReaction} />
                  )}
                </Box>
              )}
            </Box>
          </ReactionsCotainer>
        </>
      ) : (
        <Box className={Styles.userBubble}>
          <Typography variant="body1">{message.text}</Typography>
        </Box>
      )}

      {isClient && (
        <Avatar className={Styles.avatar} style={{ marginRight: "5px" }}>
          {"You"}
        </Avatar>
      )}
    </Box>
  );
};

export default MessageLayout;
