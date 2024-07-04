import { Box, Avatar } from "@mui/material";
import Styles from "./TypingAnimation.module.css";
import AndroidIcon from "@mui/icons-material/Android";
import AvatarStyle from "./MessageLayout.module.css";

const TypeAnimation = () => {
  return (
    <Box display="flex" gap="1rem">
      <Avatar className={AvatarStyle.avatar} style={{ marginLeft: "5px" }}>
        <AndroidIcon />
      </Avatar>
      <Box display="flex" justifyContent="start" pl="1rem">
        <Box display="flex" alignItems="center">
          <Box display="flex" ml="5px">
            <div className={Styles.typingIndicator}></div>
            <div className={Styles.typingIndicator}></div>
            <div className={Styles.typingIndicator}></div>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default TypeAnimation;
