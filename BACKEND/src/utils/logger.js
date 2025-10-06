
// Simple logger utility; can be replaced with more advanced loggers like Winston

const info = (message, ...optionalParams) => {
    console.log('ℹ️', message, ...optionalParams)
}

const warn = (message, ...optionalParams) => {
    console.warn('⚠️', message, ...optionalParams)
}

const error = (message, ...optionalParams) => {
    console.error('❌', message, ...optionalParams)
}

module.exports = { info, warn, error }
