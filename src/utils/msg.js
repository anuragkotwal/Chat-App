const generatedMsg = (text,username) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generatedLocationMsg = (url,username) => {
    return { 
        username,
        url, 
        createdAt: new Date().getTime() 
    }
}

module.exports = {
    generatedMsg,
    generatedLocationMsg,
}