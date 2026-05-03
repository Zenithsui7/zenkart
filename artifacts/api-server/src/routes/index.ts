import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import wishlistRouter from "./wishlist";
import reviewsRouter from "./reviews";
import listingsRouter from "./listings";
import resellerRouter from "./reseller";
import sellerRouter from "./seller";
import walletRouter from "./wallet";
import notificationsRouter from "./notifications";
import chatRouter from "./chat";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(wishlistRouter);
router.use(reviewsRouter);
router.use(listingsRouter);
router.use(resellerRouter);
router.use(sellerRouter);
router.use(walletRouter);
router.use(notificationsRouter);
router.use(chatRouter);
router.use(dashboardRouter);

export default router;
