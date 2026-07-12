import { Router } from "express";
import { getHealth, getReadiness } from "./health.controller";

const router = Router();

router.get("/ready", getReadiness);
router.get("/", getHealth);

export default router;
