const express = require("express");
const router = express.Router();
const {
  getShipments,
  createShipment,
  updateShipment,
  generateShippingLabel,
  deleteShipment
} = require("../controllers/shipmentController");

const { protect: protectAdmin } = require("../src/middleware/auth.middleware");
const { checkPermission } = require("../src/middleware/permission.middleware");

router.route("/")
  .get(protectAdmin, checkPermission("shipments", "Track Shipments", "view"), getShipments)
  .post(protectAdmin, checkPermission("shipments", "Shipment Creation", "edit"), createShipment);

router.route("/:id")
  .put(protectAdmin, checkPermission("shipments", "Track Shipments", "edit"), updateShipment)
  .delete(protectAdmin, checkPermission("shipments", "Track Shipments", "delete"), deleteShipment);

router.route("/:id/label")
  .put(protectAdmin, checkPermission("shipments", "Track Shipments", "edit"), generateShippingLabel);

module.exports = router;
