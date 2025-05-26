import { Router } from "express";
import searchRouter from "./searchRouter";

const routes = Router();

routes.use('/search', searchRouter);

export default routes;