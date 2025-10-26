import express from "express";
import cors from "cors";
import router from "./routes/api";
import db from "./utils/database";
import docs from "./docs/route";
import errorMiddleware from "./middlewares/error.middleware";

async function init() {
  try {
    const result = await db();
    console.log("db status: ", result);
    const app = express();

    app.use(cors());
    app.use(express.json());

    const PORT = 3000;
    app.get("/", (req, res) => {
      res.status(200).json({ message: "Welcome to Dissio API", data: null });
    });

    app.use("/api", router);

    docs(app);

    app.use(errorMiddleware.serverRoute());
    app.use(errorMiddleware.serverError());

    app.listen(PORT, () => console.log(`Server is running`));
  } catch (error) {
    console.error("Error initializing the server:", error);
  }
}

init();
