import { Router } from 'express';
import SearchController from '../controller/searchController';

const searchRouter = Router();
const searchController = new SearchController();

searchRouter.post('/', searchController.searchUsers);

export default searchRouter;
