const express = require("express");
const { OpenAI } = require("openai");
const app = express();
const cors = require("cors");

// We have documents uploaded on openAI and have created vector stores.
const RETRIEVAL =
  "Respond by using retrieval when available along with the existing knowledge base that you have. Use documents to retrieve.";

app.use(express.json());
app.use(cors());

// Configure OpenAI instance with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
let pollingInterval;

// -----------------------------Functions-----------------------------------------------

// Create a thread using the assistant ID
async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

async function addMessage(threadId, message) {
  console.log(`Adding a new message to thread: ${threadId}`);
  const response = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
  return response;
}

async function runAssistant(threadId) {
  console.log(`Running assistant for thread: ${threadId}`);
  const response = await openai.beta.threads.runs.create(threadId, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID,
    tools: [{ type: "file_search" }],
  });

  return response;
}

async function addFiles(response) {
  if (response?.length) {
    const result = response[0];
    const {
      text: { annotations },
    } = result || {};
    if (annotations?.length) {
      let fileNames = [];

      // Create an array of promises
      const filePromises = annotations.map(async (fileData) => {
        const {
          file_citation: { file_id: fileId },
        } = fileData || {};

        try {
          const file = await openai.files.retrieve(fileId);
          if (file?.filename) {
            fileNames.push(file.filename);
          }
        } catch (error) {
          console.error("Error: ", error);
          throw new Error("Error while fetching files");
        }
      });

      // Wait for all promises to resolve
      await Promise.all(filePromises);

      const responseWithFiles = [
        { ...result, text: { ...result.text, fileNames: [...fileNames] } },
      ];

      return responseWithFiles;
    }
    return response;
  }

  return response;
}

function addReferences(fileNames) {
  let references = "\n\n**References**:\n\n";
  fileNames.forEach((fileName, index) => {
    references += `${index + 1}. ${fileName}\n`;
  });
  return references;
}

async function formatData(data) {
  if (data?.length) {
    const result = data[0];
    const {
      text: { value, annotations, fileNames },
    } = result || {};
    if (!!value && annotations?.length && fileNames?.length) {
      // Split the data into parts based on the pattern '【.*?】'
      const parts = value.split(/(【.*?】)/);
      let citationCount = 1;
      let newParts = [];

      parts.forEach((part) => {
        if (part.match(/【.*?】/)) {
          // Replace the citation with the current count
          newParts.push(`【${citationCount}】`);
          citationCount += 1;
        } else {
          newParts.push(part);
        }
      });

      const updatedValue = newParts.join("");
      // add the heading for the references and list them in numbers
      const referenceStr = addReferences(fileNames);
      const updatedData = [
        {
          ...result,
          text: { ...result.text, value: updatedValue + referenceStr },
        },
      ];

      return updatedData;
    }
    console.log("value, annotations or fileNames are empty or null.");
    return data;
  }
  return data;
}

async function checkingStatus(res, threadId, runId) {
  const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);

  const status = runObject.status;

  if (status === "completed") {
    clearInterval(pollingInterval);

    const messageList = await openai.beta.threads.messages.list(threadId);
    const message = messageList.body.data[0].content;

    // add files with the data
    const withFiles = await addFiles(message);
    // Format the references
    const formattedData = await formatData(withFiles);

    res.json({ message: formattedData });
  }
}

// -----------------------------Routes-----------------------------------------------

app.get("/thread", (req, res) => {
  createThread().then((thread) => {
    res.json({ threadId: thread.id });
  });
});

app.post("/ask-mate", async (req, res) => {
  try {
    const { payload } = req.body || {};
    const { message, threadId } = payload || {};
    if (message && threadId) {
      // integrate openai api
      await addMessage(threadId, `${message}- ${RETRIEVAL}`).then((message) => {
        //Run the assistant
        runAssistant(threadId).then((run) => {
          const runId = run.id;

          //check the status send res when status is completed
          pollingInterval = setInterval(() => {
            checkingStatus(res, threadId, runId);
          }, 5000);
        });
      });
    } else {
      res.status(400).send({ error: "Search string is required." });
    }
  } catch (error) {
    console.error("Something went wrong, Error: ", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3001, () => console.log("Server is running on port 3001"));
