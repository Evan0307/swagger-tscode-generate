module.exports = function (definitions) {
    const Types = {};
    definitions && Object.keys(definitions).forEach(function (name) {
        const definition = definitions[name];
        const type = {};
        if (definition.type === 'object') {
            Object.keys(definition.properties).forEach(function (prop) {
                const property = definition.properties[prop];

            })
        }
    });
}