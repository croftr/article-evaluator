
module.exports = {
    normalise: (text) => {             
        const specialCharsRemoved = text.replace(/[^a-z0-9][\s]/g,'');
        return specialCharsRemoved.toLowerCase()
    }
}

