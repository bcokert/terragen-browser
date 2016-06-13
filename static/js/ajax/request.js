"use strict";

class Request {
    /**
     * Returns a new url that has the given query params added to the request
     * @param baseUrl string The base url to append to
     * @param params object An array of query params. Will be properly formatted
     * @return string
     */
    static AddParams (baseUrl, params) {
        let paramToString = param => {
            if (Array.isArray(param)) {
                return param.map(paramToString).join(",");
            }

            if (typeof param === "object" && object !== null) {
                return Object.values(param).map(paramToString).join(",");
            }

            return String(param);
        };

        return baseUrl + "?" + Object.keys(params).map(k => k + "=" + escape(encodeURI(paramToString(params[k])))).join("&");
    }

    static Get (url) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();

            req.open("GET", url, true);

            req.onreadystatechange = () => {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        resolve(JSON.parse(req.responseText));
                    } else {
                        reject(JSON.parse(req.responseText));
                    }
                }
            };

            req.onerror = () => {
                reject(new Error("An Unexpected Error Occurred. (" + req.statusText + ")"));
            };

            req.send();
        });
    }
}

module.exports = Request;
