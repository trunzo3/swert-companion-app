import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import sectionsRouter from "./sections";
import notesRouter from "./notes";
import workflowMapsRouter from "./workflow-maps";
import feedbackRouter from "./feedback";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(sectionsRouter);
router.use(notesRouter);
router.use(workflowMapsRouter);
router.use(feedbackRouter);
router.use(adminRouter);

export default router;
