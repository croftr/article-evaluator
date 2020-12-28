
module.exports = {
    normalise: (text) => {             
        const specialCharsRemoved = text.replace(/[^a-zA-Z0-9]/g,' ');
        return specialCharsRemoved.toLowerCase();        
    }
}

