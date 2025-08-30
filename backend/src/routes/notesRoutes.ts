import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { notesController } from "../controllers/notesController";

export const notesRouter = Router();

// All notes routes require authentication
notesRouter.use(requireAuth as any);

// Notes CRUD routes
notesRouter.get("/", notesController.listNotes as any);
notesRouter.post("/", notesController.createNote as any);
notesRouter.put("/:id", notesController.updateNote as any);
notesRouter.delete("/:id", notesController.deleteNote as any);
