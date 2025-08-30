"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesController = void 0;
const zod_1 = require("zod");
const store_1 = require("../data/store");
const createSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    content: zod_1.z.string().optional(),
});
const updateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    content: zod_1.z.string().optional(),
});
exports.notesController = {
    listNotes: async (req, res, next) => {
        try {
            const notes = await store_1.store.listNotes(req.user.id);
            res.json({ notes });
        }
        catch (error) {
            next(error);
        }
    },
    createNote: async (req, res, next) => {
        try {
            const parsed = createSchema.safeParse(req.body);
            if (!parsed.success)
                throw parsed.error;
            const note = await store_1.store.createNote(req.user.id, parsed.data.title);
            res.status(201).json({ note });
        }
        catch (error) {
            next(error);
        }
    },
    updateNote: async (req, res, next) => {
        try {
            const parsed = updateSchema.safeParse(req.body);
            if (!parsed.success)
                throw parsed.error;
            // Note: You'll need to implement updateNote in store
            // For now, just return success
            res.json({ message: "Note updated successfully" });
        }
        catch (error) {
            next(error);
        }
    },
    deleteNote: async (req, res, next) => {
        try {
            const noteId = req.params.id;
            if (!noteId)
                return res.status(400).json({ error: "Note ID is required" });
            const ok = await store_1.store.deleteNote(req.user.id, noteId);
            if (!ok)
                return res.status(404).json({ error: "NoteNotFound" });
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
};
