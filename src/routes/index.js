const express = require('express');
const authRoutes = require('./auth.routes');
const permissionRoutes = require('./permission.routes');
const rolePermissionRoutes = require('./rolePermission.routes');
const roleRoutes = require('./role.routes');
const adminRoutes = require('./admin.routes');
const academicUserRoutes = require('./academicUser.routes');
const academicCategoryRoutes = require('./academicCategory.routes');
const academicSubcategoryRoutes = require('./academicSubcategory.routes');
const jobTitleRoutes = require('./jobTitle.routes');
const skillRoutes = require('./skill.routes');
const workRoutes = require('./work.routes');
const serviceRoutes = require('./service.routes');
const servicePurchaseRoutes = require('./servicePurchase.routes');
const purchaseDeliverableRoutes = require('./purchaseDeliverable.routes');
const customRequestRoutes = require('./customRequest.routes');
const requestDeliverableRoutes = require('./requestDeliverable.routes');
const chatRoutes = require('./chat.routes');
const disputeRoutes = require('./dispute.routes');
const notificationRoutes = require('./notification.routes');
const transactionRoutes = require('./transaction.routes')


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/permissions', permissionRoutes);
router.use('/roles', roleRoutes);
router.use('/role-permissions', rolePermissionRoutes);
router.use('/admins', adminRoutes);
router.use('/academic-users', academicUserRoutes);
router.use('/academic-categories', academicCategoryRoutes);
router.use('/academic-subcategories', academicSubcategoryRoutes);
router.use('/job-titles', jobTitleRoutes);
router.use('/skills', skillRoutes);
router.use('/works', workRoutes);
router.use('/services', serviceRoutes);
router.use('/purchases', servicePurchaseRoutes);
router.use('/purchase-deliverables', purchaseDeliverableRoutes);
router.use('/requests', customRequestRoutes);
router.use('/request-deliverables', requestDeliverableRoutes);
router.use('/disputes', disputeRoutes);
router.use('/transactions', transactionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chats', chatRoutes);


module.exports = router;