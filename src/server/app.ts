import express, { NextFunction, Request, Response } from "express";
import apiRouter from "../routes/api";
import createError from "http-errors";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import db from "../db/postgres";

// initialize postgres db
db.init();

const app = express();

// allow Content-Type: application/json, application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// cors
const corsOptions: CorsOptions = {
  // origin: "localhost",
  methods: ["GET", "PUT", "OPTIONS"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// csrf

// log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `${req.hostname} ${req.method} ${req.path} ${JSON.stringify(req.body)}`
  );
  next();
});

app.use("/api", apiRouter);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use(
  (
    err: { status: number },
    req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    res.status(err.status || 500).send("error");
  }
);

export default app;
