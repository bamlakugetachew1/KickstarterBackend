const router = require('express').Router();
const validateCreator = require('../validate/validate.creators');
const creatorcontroller = require('../controllers/creator.controller');
const verifyToken = require('../middlewares/verify.token');

router
  .route('/creator')
  .post(validateCreator, creatorcontroller.createcreators)
  .get(creatorcontroller.indivisualCreatorsDetails);
router.post('/creator/login', creatorcontroller.loginCreator);
router.get('/creator/favourites', creatorcontroller.getFavourites);
router.get('/creator/backedprojects', creatorcontroller.getBackedProjects);
router.get('/creator/createdprojects', creatorcontroller.getMyListedProjects);
router.patch('/creator/updateaccount', verifyToken.verifyToken, creatorcontroller.updateAccountDetails);
router.patch('/creator/updateaccount', verifyToken.verifyToken, creatorcontroller.updateAccountDetails);
router.patch('/creator/visibility', verifyToken.verifyToken, creatorcontroller.changevisibility);

module.exports = router;
