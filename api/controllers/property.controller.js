const { BaseController } = require("./base.controller");

class PropertyController extends BaseController {
    constructor(services) {
        super(services);
    }

    getPropertyManager = async (req, res) => {
        try {
            const data = await this.service.getPropertyManager(req.params.id, req.query.type);
            this.responseSuccess(res, 200, "Data retrieved successfully", data);
        } catch (error) {
            this.responseError(res, error);
        }
    }

    getDashboard = async (req, res) => {
        try {
            const data = await this.service.getDashboard(req.dataLogin.id);
            this.responseSuccess(res, 200, "Dashboard data retrieved successfully", data);
        } catch (error) {
            this.responseError(res, error);
        }
    }

    getManagedProperty = async (req, res) => {
        try {
            const data = await this.service.managedProperty(req.dataLogin.id);
            this.responseSuccess(res, 200, "Data retrieved successfully", data);
        } catch (error) {
            this.responseError(res, error);
        }
    }

    addPropertyManager = async (req, res) => {
        try {
            const data = await this.service.addManager(req.body);
            this.responseSuccess(res, 200, "Data retrieved successfully", data);
        } catch (error) {
            this.responseError(res, error);
        }
    }

    deletePropertyManager = async (req, res) => {
        try {
            const data = await this.service.deleteManager(req.query.officer_id, req.query.property_id);
            this.responseSuccess(res, 200, "Data retrieved successfully", data);
        } catch (error) {
            this.responseError(res, error);
        }
    }

    canceledTransaction = async (req, res) => {
        try {
            const data = await this.service.canceledTransaction(req.params.id);
            this.responseSuccess(res, 200, "Transaction canceled successfully", data);
        } catch (error) {
            this.responseError(res, error);
        }
    }

}

module.exports = { PropertyController };
