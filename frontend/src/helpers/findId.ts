interface HasID {
    id: number
}

export default function findId<T extends HasID>(array: T[], id: number) {
    for (let obj of array) {
        if (obj.id === id)
            return obj
    }
}