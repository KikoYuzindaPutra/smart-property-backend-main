const express = require("express");
const router = express.Router();
const { PropertyController } = require("../controllers");
const { Authorization } = require("../../middleware/authorization.middleware");
const { PropertyService } = require("../../services")
const upload = require("../../middleware/uploadProperty");
const { convertToNestedObject } = require("../../utils/parseFormData");


const controller = new PropertyController(PropertyService)

router.get("/", controller.getAll)
router.get("/dashboard", Authorization.verifySession("users"), controller.getDashboard)
router.get("/managed", Authorization.verifySession("users"), controller.getManagedProperty)
router.get("/officer/:id", Authorization.verifySession("users"), controller.getPropertyManager)
router.post("/officer", Authorization.verifySession("users"), controller.addPropertyManager)
router.delete("/officer", Authorization.verifySession("users"), controller.deletePropertyManager)
router.get("/:id", controller.getOne)
router.post(
    "/",
    Authorization.verifySession("users"),
    upload.any(), // Accept any files, we'll filter them manually
    (req, res, next) => {
        req.body = convertToNestedObject(req.body);

        // Filter files that are photos (fieldname starts with 'property_data[photos]')
        const photoFiles = req.files?.filter(file =>
            file.fieldname === 'property_data[photos][]'
        ) || [];

        if (photoFiles.length > 0) {
            // Create array of photo URLs
            req.body.property_data.photo = photoFiles.map(file =>
                `/uploads/property/${file.filename}`
            );
        } else {
            // If no photos uploaded, set empty array
            req.body.property_data.photo = [];
        }

        next();
    },
    controller.create
);

router.patch("/transaction/:id", Authorization.verifySession("users"), controller.canceledTransaction)
router.patch("/:id", Authorization.verifySession("users"), controller.update)

module.exports = router;
