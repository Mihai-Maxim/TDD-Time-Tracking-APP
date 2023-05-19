const Tokens = function () {
    const tokens = {

    }

    const getAll = () => {
        return tokens
    }

    const set = (token, isValid) => {
        tokens[token] = isValid
    }

    const get = (token) => {
        return tokens[token]
    }

    return {
        getAll,
        set,
        get
    }
}

const authTokens = Tokens()

export default authTokens