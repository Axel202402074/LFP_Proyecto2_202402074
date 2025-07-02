import { Router } from "express";
import { analyze, home, showLexicalErrors } from "../controllers/analyze.controller";

const analyzeRouter = Router();

analyzeRouter.get('/', home);
analyzeRouter.post('/analyze', analyze);
analyzeRouter.get('/errors', showLexicalErrors);

export default analyzeRouter;