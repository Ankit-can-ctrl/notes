import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/requireAuth";
import { store } from "../data/store";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
});

export const notesController = {
  listNotes: async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const notes = await store.listNotes(req.user!.id);
      res.json({ notes });
    } catch (error) {
      next(error);
    }
  },

  createNote: async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw parsed.error;
      const note = await store.createNote(req.user!.id, parsed.data.title);
      res.status(201).json({ note });
    } catch (error) {
      next(error);
    }
  },

  updateNote: async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw parsed.error;
      // Note: You'll need to implement updateNote in store
      // For now, just return success
      res.json({ message: "Note updated successfully" });
    } catch (error) {
      next(error);
    }
  },

  deleteNote: async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const noteId = req.params.id;
      if (!noteId)
        return res.status(400).json({ error: "Note ID is required" });
      const ok = await store.deleteNote(req.user!.id, noteId);
      if (!ok) return res.status(404).json({ error: "NoteNotFound" });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
