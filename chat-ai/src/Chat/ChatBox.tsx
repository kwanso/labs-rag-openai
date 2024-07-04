import SendIcon from "@mui/icons-material/Send";
import { Box, InputAdornment, TextField } from "@mui/material";
import axios from "axios";
import { createRef, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import MessageLayout from "./MessageLayout";
import TypeAnimation from "./TypeAnimation";

export enum SenderEnum {
  Client,
  Server,
}

export enum ReacionEnum {
  ThumbsUp = "ThumbsUp",
  ThumbsDown = "ThumbsDown",
}

export interface MessageType {
  id: string;
  text: string;
  sender: SenderEnum;
  reaction?: ReacionEnum;
}

interface FormType {
  searchValue: string;
}

const ChatBox = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const messagesRef = createRef<HTMLDivElement>();

  const methods = useForm<FormType>({
    defaultValues: { searchValue: "" },
  });

  const { control, watch, reset } = methods;

  const postMessage = async () => {
    if (loading) return;
    const searchStr = watch("searchValue");
    reset();

    if (!searchStr?.length) return;

    const newMsg: MessageType = {
      id: `${messages?.length + 1 || 0}`,
      text: searchStr,
      sender: SenderEnum.Client,
    };

    setMessages((prev) => [...prev, newMsg]);
    // updateMessageList(newMsg);

    // Post Api

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3001/ask-mate", {
        payload: { message: searchStr, threadId },
      });

      console.log("data >>>>>>> ", response);

      // console.log(result);
      const {
        data: { message },
      } = response || {};

      const reply = message?.length ? message[0] : null;

      if (!!reply) {
        const { value } = reply?.text;
        // let modifiedValue = value.replace(/【/g, "\n【");

        const answer: MessageType = {
          id: `${messages?.length + 2 || 0}`,
          text: value || "",
          sender: SenderEnum.Server,
        };
        // updateMessageList(answer);
        setMessages((prev) => [...prev, answer]);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Something went wrong. ", error);
    }
  };

  const onCustomKeyDown = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === "Enter") {
      postMessage();
    }
  };

  const updateMessageList = useCallback(
    (newMsg: MessageType) => {
      if (!messages?.length) return;

      const updatedList = messages.map((msg: MessageType) => {
        return msg.id === newMsg.id ? { ...newMsg } : { ...msg };
      });

      setMessages([...updatedList]);
    },
    [messages]
  );

  useEffect(() => {
    (async () => {
      const {
        data: { threadId },
      } = await axios.get("http://localhost:3001/thread");
      if (threadId) {
        setThreadId(threadId);
      }
    })();
  }, []);

  useEffect(() => {
    if (!!messages?.length && !!messagesRef?.current?.scrollIntoView)
      messagesRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesRef]);

  return (
    <Box>
      {/* Message List */}
      <Box p="1rem" my="1rem" height="calc(100vh - 235px)" overflow="auto">
        <Box display="flex" flexDirection="column" gap="2rem">
          {!!messages?.length &&
            messages.map((message: MessageType) => (
              <MessageLayout
                key={message.id}
                message={message}
                updateMessageList={updateMessageList}
              />
            ))}

          {loading && <TypeAnimation />}
        </Box>

        <div ref={messagesRef} />
      </Box>

      {/* Text Input */}
      <Box display="flex" width="100%" justifyContent="center">
        <Controller
          render={({ field }) => (
            <TextField
              {...field}
              id="outlined-basic"
              fullWidth
              variant="outlined"
              placeholder="Type here to search..!!"
              onKeyDown={onCustomKeyDown}
              sx={{ width: "60%" }}
              InputProps={{
                sx: { borderRadius: "50px" },
                endAdornment: (
                  <InputAdornment position="end">
                    <SendIcon
                      style={{ padding: "0 5px", cursor: "pointer", color: "#7277c7" }}
                      onClick={postMessage}
                    />
                  </InputAdornment>
                ),
              }}
            />
          )}
          name="searchValue"
          control={control}
        />
      </Box>
    </Box>
  );
};

export default ChatBox;
