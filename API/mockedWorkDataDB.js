const DataDB = function (workData, users) {

    const WorkData = workData ?? [
        {
            email: "mihai.maxim@thinslices.com",
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString(),
            description: "Implemented TDD wrong"
        },
        {
            email: "mihai.maxim@thinslices.com",
            start_date: new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(new Date().getTime() + 16 * 60 * 60 * 1000).toISOString(),
            description: "Implemented TDD right"
        },
        {
            email: "codrin.maxim@thinslices.com",
            start_date: new Date(new Date().getTime() + 17 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
            description: "Ate some spaghetti"
        },
        {
            email: "dan@thinslices.com",
            start_date: new Date(new Date().getTime() - 25 * 60 * 60 * 1000).toISOString(),
            end_date: null,
            description: null,
        }
    ]

    const Users = users ?? [
        {
            email: "mihai.maxim@thinslices.com",
            password: "password",
            isEmployer: false,
            checkedIn: false
        },
        {
            email: "codrin.maxim@thinslices.com",
            password: "password",
            isEmployer: false,
            checkedIn: false
        },
        {
            email: "dan@thinslices.com",
            password: "password",
            isEmployer: false,
            checkedIn: false
        },
        {
            email: "boss@thinslices.com",
            password: "password",
            isEmployer: true
        }
    ]



    const cloneObj = (obj) => JSON.parse(JSON.stringify(obj))

    const getAll = async function (array) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(cloneObj(array))
            }, 200)
        })
    }

    const insert = async function (data, index, array) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {

                if (index === undefined) {
                    array.push(data)
                    resolve(cloneObj(array[array.length - 1]))
                }

                index < 0 ? index = Math.abs(array.length - Math.abs(index) - 1) : null

                if (index < array.length) {
                    array.splice(index, 0, todo)
                    resolve(cloneObj(array[index]))
                }

                reject(new Error("invalid_index"))

            }, 200)
        })
    }

    const get = async function (index, noClone, array) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                index < 0 ? index = Math.abs(array.length - Math.abs(index) - 1) : null
                if (array[index]) resolve(noClone ? array[index] : cloneObj(array[index]))
                else {
                    resolve(null)
                }

            }, 200)
        })
    }

    const getByMatch = async function (matchData, array, noClone) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (typeof matchData !== "object") {
                    resolve(new Error("match_data_should_be_object"))
                }

                try {
                    JSON.stringify(matchData)
                } catch (err) {
                    resolve(new Error("match_data_should_be_stringifiable"))
                }

                const matchedData = array.filter(element => {
                    let isMatch = true
                    for (var k in matchData) {
                        if ((matchData[k] !== element[k]) || (!(k in element))) {
                            isMatch = false
                            break
                        }
                    }
                    return isMatch
                })

                if (!noClone) {
                    resolve(cloneObj(matchedData))
                } else {
                    resolve(matchedData)
                }

            }, 200)
        })
    }

    const removeByMatch = async function (matchdata, array) {
        const targets = getByMatch(matchdata, array, true)
        for (let i = 0; i < targets.length; i++) {
            await remove(array.indexOf(targets[i]), array)
        }
        resolve(targets.length)
    }

    const updateByMatch = async function (matchdata, newData, array) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const targets = await getByMatch(matchdata, array, true)
                for (let i = 0; i < targets.length; i++) {
                    let target = targets[i]

                    for (var k in newData) {
                        target[k] = newData[k]
                    }
                }
                resolve(cloneObj(targets))
            }, 200)
        })
    }

    const remove = async function (index, array) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (index === undefined) {
                    const old = array.pop()
                    resolve(cloneObj(old))
                }

                index < 0 ? index = Math.abs(array.length - Math.abs(index) - 1) : null

                if (index < array.length) {
                    const removed = array.splice(index, 1)
                    resolve(cloneObj(...removed))
                }

                reject(new Error("invalid_index"))
            }, 200)
        })
    }


    const update = async function (index, newData, array) {

        return new Promise(async (resolve, reject) => {

            const element = await get(index, true, array)

            if (element) {
                element = {
                    ...element,
                    ...newData
                }
                resolve(cloneObj(element))
            }
            reject(new Error("invalid_index"))

        })
    }

    return {
        WorkDataFunctions: {
            getAllWorkData: async () => {
                return getAll(WorkData)
            },
            insertWorkData: async (data, index) => {
                return insert(data, index, WorkData)
            },
            getWorkData: async (index) => {
                return get(index, false, WorkData)
            },
            removeWorkData: async (index) => {
                return remove(index, WorkData)
            },
            updateWorkData: async (index, newData) => {
                return update(index, newData, WorkData)
            },
            getWorkDataBy: async (matchData) => {
                return getByMatch(matchData, WorkData)
            },
            updateWorkDataBy: async (matchData, newData) => {
                return updateByMatch(matchData, newData, WorkData)
            },
            removeWorkDataBy: async (matchData) => {
                return removeByMatch(matchData, WorkData)
            }
        },
        UsersFunctions: {
            getAllUsersData: async () => {
                return getAll(Users)
            },
            insertUsersData: async (data, index) => {
                return insert(data, index, Users)
            },
            getUsersData: async (index) => {
                return get(index, false, Users)
            },
            removeUsersData: async (index) => {
                return remove(index, Users)
            },
            updateUsersData: async (index, newData) => {
                return update(index, newData, Users)
            },
            getUsersBy: async (matchData) => {
                return getByMatch(matchData, Users)
            },
            updateUsersBy: async (matchData, newData) => {
                return updateByMatch(matchData, newData, Users)
            },
            removeUsersBy: async (matchData) => {
                return removeByMatch(matchData, Users)
            }

        }
    }

}


const dbConn = DataDB()

export {
    dbConn,
    DataDB
}