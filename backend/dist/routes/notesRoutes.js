"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const notesController_1 = require("../controllers/notesController");
exports.notesRouter = (0, express_1.Router)();
// All notes routes require authentication
exports.notesRouter.use(requireAuth_1.requireAuth);
// Notes CRUD routes
exports.notesRouter.get("/", notesController_1.notesController.listNotes);
exports.notesRouter.post("/", notesController_1.notesController.createNote);
exports.notesRouter.put("/:id", notesController_1.notesController.updateNote);
exports.notesRouter.delete("/:id", notesController_1.notesController.deleteNote);
