module.exports = {
    isSameOrigin: ({ baseUrl, urlToCheck = '' }) => {

        //if its an absolute url check its on the same origin as the base url 
        if (urlToCheck.startsWith('http')) {
            if (urlToCheck.startsWith(baseUrl)) {
                return true;
            }
            return false;
        } else { // its a relative url so must be same origin             
            return true;
        }
    },
    makeAbsolute: ({ baseUrl = '', urlToCheck = '' }) => {

        //if the url is not absolute combine it with the base url to make it so 
        if (!urlToCheck.startsWith('http')) {            
            const domain = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
            const path = urlToCheck.startsWith('/') ? urlToCheck.substring(1) : urlToCheck;
            return `${domain}/${path}`;
        }
        return urlToCheck;
    }
}