const defaultAction = require('./defaultAction');

module.exports = function (paths, params) {
    const categories = {};
    paths && Object.keys(paths).forEach(function (url) {
        let urlDefinition = paths[url];
        Object.keys(urlDefinition).forEach(function (method) {
            let methodDefinition = urlDefinition[method];
            let category;
            if (methodDefinition.tags && methodDefinition.tags.length) {
                category = methodDefinition.tags[0];
            }
            category = defaultAction.defaultGetAPIFileName(category);
            if (typeof params.getAPIFileName === 'function') {
                const friendlyName = params.getAPIFileName(category);
                if (friendlyName) {
                    category = friendlyName;
                }
            }
            let defaultOperationId = defaultAction.defaultGetRequestFunctionName(methodDefinition);
            methodDefinition.operationId = defaultOperationId;
            let operationId = params.getRequestFunctionName(methodDefinition);
            if (!operationId) {
                operationId = defaultOperationId;
            }
            if (!categories[category]) {
                categories[category] = [];
            }

            const finalDefinition = Object.assign({}, methodDefinition, {
                operationId: operationId
            });
            const comments = {
                summary: (finalDefinition.summary || '') + (finalDefinition.description || ''),
                params: {

                }
            }
            finalDefinition.parameters && finalDefinition.parameters.forEach(param => {
                comments.params[param.name] = param;
            });
            categories[category].push({
                url: url,
                method: method,
                comment: comments,
                definition: finalDefinition
            });
        })
    });

    return categories;
}