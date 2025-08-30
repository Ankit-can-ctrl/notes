"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const requireAuth_1 = require("../middleware/requireAuth");
const store_1 = require("../data/store");
exports.notesRouter = (0, express_1.Router)();
exports.notesRouter.use(requireAuth_1.requireAuth);
exports.notesRouter.get("/", (req, res) => {
    const notes = store_1.store.listNotes(req.user.id);
    res.json({ notes });
});
const createSchema = zod_1.z.object({ title: zod_1.z.string().min(1).max(200) });
exports.notesRouter.post("/", (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
        throw parsed.error;
    const note = store_1.store.createNote(req.user.id, parsed.data.title);
    res.status(201).json({ note });
});
exports.notesRouter.delete("/:id", (req, res) => {
    const ok = store_1.store.deleteNote(req.user.id, req.params.id);
    if (!ok)
        return res.status(404).json({ error: "NoteNotFound" });
    res.status(204).send();
});
