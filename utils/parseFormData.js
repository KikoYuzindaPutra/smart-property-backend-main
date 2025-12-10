// utils/parseFormData.js
function convertToNestedObject(body) {
    const result = {};

    for (const key in body) {
        const value = body[key];

        if (key.includes("[")) {
            const mainKey = key.substring(0, key.indexOf("["));
            const innerKey = key.substring(key.indexOf("[") + 1, key.length - 1);

            if (!result[mainKey]) result[mainKey] = {};
            result[mainKey][innerKey] = value;
        } else {
            result[key] = value;
        }
    }

    return result;
}

module.exports = { convertToNestedObject };
