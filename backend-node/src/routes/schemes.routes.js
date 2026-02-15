const express = require('express');
const schemesController = require('../controllers/schemes.controller');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

const router = express.Router();

// Public: get eligible schemes (rule-based matching)
router.get('/eligible', schemesController.getEligible);

// List and get by id (used by Schemes page View Details and Admin)
router.get('/', schemesController.list);
router.get('/:id', schemesController.getById);

// Admin CRUD: require auth
router.post('/', verifyFirebaseToken, schemesController.create);
router.put('/:id', verifyFirebaseToken, schemesController.update);
router.delete('/:id', verifyFirebaseToken, schemesController.deactivate);

module.exports = router;
