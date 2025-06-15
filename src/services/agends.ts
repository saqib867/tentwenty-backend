// src/agenda.ts
import Agenda from "agenda";
import mongoose from "mongoose";
import { Contest } from "../models/constest.model";
import { MONGO_URI } from "../config/env_variables";

const mongoUri = MONGO_URI!;

/** ①  Create Agenda instance (uses same Mongo connection pool) */
export const agenda = new Agenda({
  db: { address: mongoUri, collection: "agendaJobs" }, // collection name for jobs
});

/** ②  Job definition: check & close contest */
agenda.define("close-contest", async (job, done) => {
  const { contestId } = job.attrs.data as { contestId: string };

  await Contest.findOneAndUpdate(
    { _id: contestId, status: "ongoing" },
    { status: "completed" }
  );

  done();
});
