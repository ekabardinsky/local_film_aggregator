const {flatten} = require('lodash');

class GenericOperationController {
    constructor(router, adapters, operation) {
        this.adapters = adapters;
        this.operation = operation;

        router.post(`/${operation}`, this.runOperation.bind(this));
        router.post(`/${operation}/:adapter`, this.runOperationInAdapter.bind(this));
    }

    async runOperation(req, res) {
        const operationInstances = this.adapters.map(async (adapter) => {
            return adapter[this.operation](req);
        });

        const operationResults = await Promise.all(
            operationInstances
        );

        res.json(
            flatten(operationResults)
        );
    }

    async runOperationInAdapter(req, res) {
        const {adapter} = req.params;
        const relatedAdaptor =  this.adapters.find(item => item.name.toLowerCase() === adapter.toLowerCase());
        const result =  await (relatedAdaptor[this.operation](req));
        res.json(
            result
        );
    }
}

module.exports = GenericOperationController;