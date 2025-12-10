class BaseController {
    constructor(service) {
        this.service = service;
    }

    responseSuccess(res, status, message, data = null) {
        res.status(status).json({ status, message, data });
    }

    responseError(res, error) {
        const status = error.status || 500;
        const message = error?.message || "Permintaan anda tidak dapat di proses akibat kesalahan server"
        res.status(status).json({ status, code: error?.code || "Internal server error", message });
    }

    getAll = async (req, res) => {
        try {
            const data = await this.service.getAll(req.dataLogin);
            this.responseSuccess(res, 200, "Data retrieved successfully", data);
        } catch (error) {
            console.error(error);
            this.responseError(res, error, "Internal server error");
        }

    };

    getOne = async (req, res) => {
        try {
            const id = req.params.id
            const type = req.query.type

            const data = await this.service.getOne(id, req.dataLogin, type);
            if (!data) return this.responseError(res, { status: 404 }, "Data not found");

            this.responseSuccess(res, 200, "Data retrieved successfully", data);
        } catch (error) {
            this.responseError(res, error, "Internal server error");
        }
    };

    create = async (req, res) => {
        try {
            const data = await this.service.create(req.body, req.dataLogin);
            this.responseSuccess(res, 201, "Data anda perlu di proses, silahkan tunggu beberapa saat.", data);
        } catch (error) {
            this.responseError(res, error.status ? error : { status: 400 }, error?.message || "Gagal menambahkan data");
        }
    };

    createReply = async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            const data = await this.service.createReply(reviewId, req.body, req.dataLogin);
            this.responseSuccess(res, 201, "Reply created successfully", data);
        } catch (error) {
            this.responseError(res, error.status ? error : { status: 400 }, error?.message || "Gagal membuat reply");
        }
    };

    checkInCheckOut = async (req, res) => {
        try {
            const id = req.params.id;
            const status = req.body.status;
            const data = await this.service.handleCheckinCheckout(id, status);
            this.responseSuccess(res, 201, "Reply created successfully", data);
        } catch (error) {
            this.responseError(res, error.status ? error : { status: 400 }, error?.message || "Gagal membuat reply");
        }
    };

    extendRent = async (req, res) => {
        console.log(req.body);

        try {
            const data = await this.service.extendRent(req.body, req.dataLogin);
            this.responseSuccess(res, 201, "Reply created successfully", data);
        } catch (error) {
            this.responseError(res, error.status ? error : { status: 400 }, error?.message || "Gagal membuat reply");
        }
    }

    update = async (req, res) => {
        try {
            const id = req.params.id
            const data = await this.service.update(req.dataLogin, req.body, id);
            this.responseSuccess(res, 200, "Data updated successfully", data);
        } catch (error) {
            this.responseError(res, error.status ? error : { status: 400 }, error?.message || "Gagal mengubah data");
        }
    };

    delete = async (req, res) => {
        try {
            const id = req.params.id;
            const data = await this.service.delete(id, req.dataLogin);
            this.responseSuccess(res, 200, "Data deleted successfully", data);
        } catch (error) {
            this.responseError(res, error.status ? error : { status: 400 }, error?.message || "Gagal mengubah data");
        }
    };

}

module.exports = { BaseController };
